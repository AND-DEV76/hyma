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
import com.hyma.tarifa.service.TarifaServicioService;
import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
    private final TarifaServicioService tarifaServicioService;

    @Transactional
    public PacienteConsultaResponse obtenerDatosPacienteParaConsulta(Long idPaciente, Long idCola) {
        if (idCola != null) {
            colaAtencionRepository.findById(idCola).ifPresent(cola -> {
                if (cola.getEstado() == EstadoCola.ESPERA_CONSULTA) {
                    cola.setEstado(EstadoCola.EN_CONSULTA);
                    colaAtencionRepository.save(cola);
                }
            });
        }

        Paciente paciente = pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new PacienteNotFoundException(idPaciente));
        
        SignoVital ultimoSigno = signoVitalRepository.findFirstByPaciente_IdPacienteOrderByFechaRegistroDesc(idPaciente)
                .orElse(null);
                
        PacienteResponse pacienteResp = pacienteMapper.toResponse(paciente);
        SignoVitalResponse signoResp = ultimoSigno != null ? signoVitalMapper.toResponse(ultimoSigno) : null;

        // Obtener última consulta completada si existe
        UltimaConsultaResponse ultimaConsultaResp = null;
        Optional<Consulta> ultimaConsultaOpt = consultaRepository.findTopByPacienteOrderByFechaConsultaDesc(paciente);
        if (ultimaConsultaOpt.isPresent()) {
            Consulta c = ultimaConsultaOpt.get();
            
            // Diagnósticos
            List<Diagnostico> diags = diagnosticoRepository.findByConsulta_IdConsulta(c.getIdConsulta());
            List<UltimaConsultaResponse.DiagnosticoItemResponse> diagList = diags.stream()
                    .map(d -> UltimaConsultaResponse.DiagnosticoItemResponse.builder()
                            .codigoCie10(d.getCodigoCie10())
                            .descripcion(d.getDescripcion())
                            .build())
                    .toList();

            // Tratamiento
            Optional<Tratamiento> tratOpt = tratamientoRepository.findByConsultaIdWithDetalles(c.getIdConsulta());
            String indicaciones = tratOpt.map(Tratamiento::getObservaciones).orElse(null);
            List<UltimaConsultaResponse.MedicamentoRecetadoItemResponse> medsList = tratOpt
                    .map(t -> t.getDetalles().stream()
                            .map(det -> UltimaConsultaResponse.MedicamentoRecetadoItemResponse.builder()
                                    .medicamento(det.getMedicamento() != null ? det.getMedicamento().getNombre() : "Medicamento")
                                    .presentacion(det.getMedicamento() != null ? det.getMedicamento().getPresentacion() : null)
                                    .concentracion(det.getMedicamento() != null ? det.getMedicamento().getConcentracion() : null)
                                    .dosis(det.getDosis())
                                    .frecuencia(det.getFrecuencia())
                                    .duracion(det.getDuracion())
                                    .cantidad(det.getCantidad())
                                    .build())
                            .toList())
                    .orElse(List.of());

            // Examen Físico
            Optional<ExamenFisico> efOpt = examenFisicoRepository.findByConsulta_IdConsulta(c.getIdConsulta());
            UltimaConsultaResponse.ExamenFisicoItemResponse efResp = efOpt
                    .map(ef -> UltimaConsultaResponse.ExamenFisicoItemResponse.builder()
                            .piel(ef.getPiel())
                            .conciencia(ef.getConciencia())
                            .cardiopulmonar(ef.getCardiopulmonar())
                            .abdomen(ef.getAbdomen())
                            .soma(ef.getSoma())
                            .build())
                    .orElse(null);

            String medicoNombre = null;
            String medicoEspecialidad = null;
            if (c.getMedico() != null) {
                medicoNombre = ((c.getMedico().getNombres() != null ? c.getMedico().getNombres() : "") + " " +
                               (c.getMedico().getApellidos() != null ? c.getMedico().getApellidos() : "")).trim();
                medicoEspecialidad = c.getMedico().getEspecialidad();
            }

            ultimaConsultaResp = UltimaConsultaResponse.builder()
                    .idConsulta(c.getIdConsulta())
                    .fechaConsulta(c.getFechaConsulta())
                    .medico(medicoNombre)
                    .especialidadMedico(medicoEspecialidad)
                    .motivoConsulta(c.getMotivoConsulta())
                    .historiaEnfermedadActual(c.getHistoriaEnfermedadActual())
                    .impresionClinica(c.getImpresionClinica())
                    .planMedico(c.getPlanMedico())
                    .diagnosticos(diagList)
                    .indicacionesTratamiento(indicaciones)
                    .medicamentos(medsList)
                    .examenFisico(efResp)
                    .build();
        }
        
        return PacienteConsultaResponse.builder()
                .paciente(pacienteResp)
                .ultimoSignoVital(signoResp)
                .idCola(idCola)
                .ultimaConsulta(ultimaConsultaResp)
                .build();
    }


    @Transactional
    public ConsultaCompletaResponse finalizarConsulta(ConsultaCompletaRequest request, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new MedicoNotFoundException("Usuario no encontrado: " + username));
                
        Medico medico = medicoRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
                .orElse(null);

        if (medico == null) {
            if (!medicoRepository.existsByUsuarioIdUsuario(usuario.getIdUsuario())) {
                medico = Medico.builder()
                        .nombres(usuario.getUsername())
                        .apellidos(usuario.getRol() != null ? usuario.getRol().getNombre() : "Médico")
                        .especialidad("Medicina General")
                        .correo(usuario.getUsername() + "@hyma.com")
                        .telefono("00000000")
                        .usuario(usuario)
                        .build();
                medico = medicoRepository.save(medico);
            } else {
                medico = medicoRepository.findAll().stream().findFirst().orElse(null);
            }
        }

        if (medico == null) {
            medico = medicoRepository.findAll().stream().findFirst().orElse(null);
        }

        if (medico == null) {
            medico = Medico.builder()
                    .nombres(usuario.getUsername())
                    .apellidos("Médico")
                    .especialidad("Medicina General")
                    .correo("medico@hyma.com")
                    .telefono("00000000")
                    .build();
            medico = medicoRepository.save(medico);
        }
                
        Paciente paciente = pacienteRepository.findById(request.getIdPaciente())
                .orElseThrow(() -> new PacienteNotFoundException(request.getIdPaciente()));

        ColaAtencion cola = colaAtencionRepository.findById(request.getIdCola())
                .orElseThrow(() -> new ColaAtencionNotFoundException(request.getIdCola()));

        // 1. Crear Consulta
        BigDecimal precio = request.getPrecioConsulta() != null && request.getPrecioConsulta().compareTo(BigDecimal.ZERO) > 0
                ? request.getPrecioConsulta()
                : tarifaServicioService.obtenerPrecioConsultaGeneral();

        Consulta consulta = Consulta.builder()
                .paciente(paciente)
                .medico(medico)
                .motivoConsulta(request.getMotivoConsulta())
                .historiaEnfermedadActual(request.getHistoriaEnfermedadActual())
                .impresionClinica(request.getImpresionClinica())
                .planMedico(request.getPlanMedico())
                .precioConsulta(precio)
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
