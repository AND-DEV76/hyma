package com.hyma.clinica.service;

import com.hyma.clinica.dto.*;
import com.hyma.clinica.model.*;
import com.hyma.clinica.repository.*;
import com.hyma.consulta.model.Consulta;
import com.hyma.consulta.repository.ConsultaRepository;
import com.hyma.doctor.model.Medico;
import com.hyma.doctor.repository.MedicoRepository;
import com.hyma.exception.MedicoNotFoundException;
import com.hyma.farmacia.model.Medicamento;
import com.hyma.farmacia.repository.MedicamentoRepository;
import com.hyma.preconsulta.dto.SignoVitalResponse;
import com.hyma.preconsulta.mapper.SignoVitalMapper;
import com.hyma.preconsulta.model.SignoVital;
import com.hyma.preconsulta.repository.SignoVitalRepository;
import com.hyma.recepcion.dto.PacienteResponse;
import com.hyma.recepcion.mapper.PacienteMapper;
import com.hyma.recepcion.model.ColaAtencion;
import com.hyma.recepcion.model.EstadoCola;
import com.hyma.recepcion.model.Paciente;
import com.hyma.recepcion.repository.ColaAtencionRepository;
import com.hyma.recepcion.repository.PacienteRepository;
import com.hyma.recepcion.service.ColaAtencionNotFoundException;
import com.hyma.recepcion.service.PacienteNotFoundException;
import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ClinicaService {

    private final ConsultaRepository consultaRepository;
    private final ExamenFisicoRepository examenFisicoRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final TratamientoRepository tratamientoRepository;
    private final DetalleTratamientoRepository detalleTratamientoRepository;
    private final MedicoRepository medicoRepository;
    private final PacienteRepository pacienteRepository;
    private final ColaAtencionRepository colaAtencionRepository;
    private final SignoVitalRepository signoVitalRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final SignoVitalMapper signoVitalMapper;
    private final PacienteMapper pacienteMapper;

    @Transactional(readOnly = true)
    public PacienteConsultaResponse obtenerDatosPacienteParaConsulta(Long idPaciente, Long idCola) {
        Paciente paciente = pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new PacienteNotFoundException(idPaciente));
        
        SignoVital ultimoSigno = signoVitalRepository.findFirstByPaciente_IdPacienteOrderByFechaRegistroDesc(idPaciente)
                .orElse(null);
                
        PacienteResponse pacienteResp = pacienteMapper.toResponse(paciente);
        SignoVitalResponse signoResp = ultimoSigno != null ? signoVitalMapper.toResponse(ultimoSigno) : null;
        
        return PacienteConsultaResponse.builder()
                .paciente(pacienteResp)
                .ultimoSignoVital(signoResp)
                .idCola(idCola)
                .build();
    }

    @Transactional
    public ConsultaCompletaResponse finalizarConsulta(ConsultaCompletaRequest request, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new MedicoNotFoundException("Usuario no encontrado: " + username));
                
        Medico medico = medicoRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
                .orElseThrow(() -> new MedicoNotFoundException("El usuario autenticado no tiene un perfil de médico asociado"));
                
        Paciente paciente = pacienteRepository.findById(request.getIdPaciente())
                .orElseThrow(() -> new PacienteNotFoundException(request.getIdPaciente()));

        ColaAtencion cola = colaAtencionRepository.findById(request.getIdCola())
                .orElseThrow(() -> new ColaAtencionNotFoundException(request.getIdCola()));
                
        if (cola.getEstado() != EstadoCola.EN_CONSULTA) {
            throw new IllegalArgumentException("El turno no está en estado EN_CONSULTA");
        }

        // 1. Crear Consulta
        Consulta consulta = Consulta.builder()
                .paciente(paciente)
                .medico(medico)
                .motivoConsulta(request.getMotivoConsulta())
                .historiaEnfermedadActual(request.getHistoriaEnfermedadActual())
                .impresionClinica(request.getImpresionClinica())
                .planMedico(request.getPlanMedico())
                .fechaConsulta(LocalDateTime.now())
                .build();
        consulta = consultaRepository.save(consulta);

        // 2. Crear Examen Físico
        if (request.getExamenFisico() != null) {
            ExamenFisico examen = ExamenFisico.builder()
                    .consulta(consulta)
                    .piel(request.getExamenFisico().getPiel())
                    .conciencia(request.getExamenFisico().getConciencia())
                    .cardiopulmonar(request.getExamenFisico().getCardiopulmonar())
                    .abdomen(request.getExamenFisico().getAbdomen())
                    .soma(request.getExamenFisico().getSoma())
                    .build();
            examenFisicoRepository.save(examen);
        }

        // 3. Vincular Signo Vital (si existe)
        if (request.getIdSignoVital() != null) {
            SignoVital signoVital = signoVitalRepository.findById(request.getIdSignoVital())
                    .orElse(null);
            if (signoVital != null && signoVital.getConsulta() == null) {
                signoVital.setConsulta(consulta);
                signoVitalRepository.save(signoVital);
            }
        }

        // 4. Crear Diagnósticos
        if (request.getDiagnosticos() != null) {
            for (DiagnosticoRequest diagReq : request.getDiagnosticos()) {
                Diagnostico diag = Diagnostico.builder()
                        .consulta(consulta)
                        .codigoCie10(diagReq.getCodigoCie10())
                        .descripcion(diagReq.getDescripcion())
                        .build();
                diagnosticoRepository.save(diag);
            }
        }

        // 5. Crear Tratamiento y Detalles
        if (request.getTratamiento() != null && request.getTratamiento().getDetalles() != null && !request.getTratamiento().getDetalles().isEmpty()) {
            Tratamiento tratamiento = Tratamiento.builder()
                    .consulta(consulta)
                    .observaciones(request.getTratamiento().getObservaciones())
                    .build();
            tratamiento = tratamientoRepository.save(tratamiento);

            for (DetalleTratamientoRequest detReq : request.getTratamiento().getDetalles()) {
                Medicamento medicamento = medicamentoRepository.findById(detReq.getIdMedicamento())
                        .orElseThrow(() -> new IllegalArgumentException("Medicamento no encontrado: " + detReq.getIdMedicamento()));
                        
                DetalleTratamiento detalle = DetalleTratamiento.builder()
                        .tratamiento(tratamiento)
                        .medicamento(medicamento)
                        .dosis(detReq.getDosis())
                        .frecuencia(detReq.getFrecuencia())
                        .duracion(detReq.getDuracion())
                        .cantidad(detReq.getCantidad())
                        .build();
                detalleTratamientoRepository.save(detalle);
            }
        }

        // 6. Actualizar Cola de Atención
        cola.setEstado(EstadoCola.EN_FARMACIA);
        cola.setFechaAtencion(LocalDateTime.now());
        colaAtencionRepository.save(cola);

        return ConsultaCompletaResponse.builder()
                .idConsulta(consulta.getIdConsulta())
                .mensaje("Consulta finalizada exitosamente")
                .fechaConsulta(consulta.getFechaConsulta())
                .build();
    }
}
