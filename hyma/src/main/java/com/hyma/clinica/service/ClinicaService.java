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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
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
    private final com.hyma.social.repository.EspecialidadReferenciaRepository especialidadReferenciaRepository;
    private final com.hyma.social.repository.ReferenciaMedicaRepository referenciaMedicaRepository;
    private final com.hyma.procedimiento.repository.ProcedimientoRepository procedimientoRepository;
    private final com.hyma.procedimiento.repository.ConsultaProcedimientoRepository consultaProcedimientoRepository;

    @Transactional
    public PacienteConsultaResponse obtenerDatosPacienteParaConsulta(Long idPaciente, Long idCola) {
        String datosBorrador = null;
        String estadoColaStr = null;
        if (idCola != null) {
            Optional<ColaAtencion> colaOpt = colaAtencionRepository.findById(idCola);
            if (colaOpt.isPresent()) {
                ColaAtencion cola = colaOpt.get();
                estadoColaStr = cola.getEstado() != null ? cola.getEstado().name() : null;
                datosBorrador = cola.getDatosConsulta();
                if (cola.getEstado() == EstadoCola.ESPERA_CONSULTA) {
                    cola.setEstado(EstadoCola.EN_CONSULTA);
                    colaAtencionRepository.save(cola);
                }
            }
        }

        Paciente paciente = pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new PacienteNotFoundException(idPaciente));
        
        SignoVital ultimoSigno = signoVitalRepository.findFirstByPaciente_IdPacienteOrderByFechaRegistroDesc(idPaciente)
                .orElse(null);
                
        PacienteResponse pacienteResp = pacienteMapper.toResponse(paciente);
        SignoVitalResponse signoResp = ultimoSigno != null ? signoVitalMapper.toResponse(ultimoSigno) : null;

        // Obtener historial completo de consultas del paciente ordenadas por fecha descendente
        List<Consulta> listaConsultas = consultaRepository.findByPacienteOrderByFechaConsultaDesc(paciente);
        List<UltimaConsultaResponse> historialConsultas = listaConsultas.stream()
                .map(c -> mapearConsultaAResponse(c, idPaciente, ultimoSigno))
                .toList();

        UltimaConsultaResponse ultimaConsultaResp = !historialConsultas.isEmpty() ? historialConsultas.get(0) : null;

        return PacienteConsultaResponse.builder()
                .paciente(pacienteResp)
                .ultimoSignoVital(signoResp)
                .idCola(idCola)
                .estadoCola(estadoColaStr)
                .datosConsultaBorrador(datosBorrador)
                .ultimaConsulta(ultimaConsultaResp)
                .historialConsultas(historialConsultas)
                .build();
    }

    private UltimaConsultaResponse mapearConsultaAResponse(Consulta c, Long idPaciente, SignoVital ultimoSignoActual) {
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
                                .esUsoClinica(Boolean.TRUE.equals(det.getEsUsoClinica()))
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

        SignoVital signoDeConsulta = signoVitalRepository.findByConsulta_IdConsulta(c.getIdConsulta()).orElse(null);
        if (signoDeConsulta == null) {
            List<SignoVital> signos = signoVitalRepository.findByPaciente_IdPacienteOrderByFechaRegistroDesc(idPaciente);
            for (SignoVital sv : signos) {
                if (ultimoSignoActual != null && sv.getIdSignoVital().equals(ultimoSignoActual.getIdSignoVital())) {
                    continue;
                }
                if (c.getFechaConsulta() != null && sv.getFechaRegistro() != null && !sv.getFechaRegistro().isAfter(c.getFechaConsulta().plusHours(1))) {
                    signoDeConsulta = sv;
                    break;
                }
            }
        }
        SignoVitalResponse svResp = signoDeConsulta != null ? signoVitalMapper.toResponse(signoDeConsulta) : null;

        return UltimaConsultaResponse.builder()
                .idConsulta(c.getIdConsulta())
                .fechaConsulta(c.getFechaConsulta())
                .medico(medicoNombre)
                .especialidadMedico(medicoEspecialidad)
                .motivoConsulta(c.getMotivoConsulta())
                .historiaEnfermedadActual(c.getHistoriaEnfermedadActual())
                .impresionClinica(c.getImpresionClinica())
                .planMedico(c.getPlanMedico())
                .laboratorio(c.getLaboratorio())
                .diagnosticos(diagList)
                .indicacionesTratamiento(indicaciones)
                .medicamentos(medsList)
                .examenFisico(efResp)
                .signoVital(svResp)
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

        // 1. Crear Consulta (detectar si es menor de 13 años para aplicar tarifa niño)
        boolean esNino = false;
        if (paciente.getFechaNacimiento() != null) {
            int edad = Period.between(paciente.getFechaNacimiento(), LocalDate.now()).getYears();
            esNino = edad < 13;
        }

        BigDecimal precio = request.getPrecioConsulta() != null && request.getPrecioConsulta().compareTo(BigDecimal.ZERO) > 0
                ? request.getPrecioConsulta()
                : (esNino ? tarifaServicioService.obtenerPrecioConsultaNino() : tarifaServicioService.obtenerPrecioConsultaGeneral());

        Consulta consulta = Consulta.builder()
                .paciente(paciente)
                .medico(medico)
                .motivoConsulta(request.getMotivoConsulta())
                .historiaEnfermedadActual(request.getHistoriaEnfermedadActual())
                .impresionClinica(request.getImpresionClinica())
                .planMedico(request.getPlanMedico())
                .laboratorio(request.getLaboratorio())
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
                        .esUsoClinica(Boolean.TRUE.equals(detReq.getEsUsoClinica()))
                        .build();
                detalleTratamientoRepository.save(detalle);
            }
        }

        // 6. Crear Referencia Médica (si aplica)
        if (request.getReferenciaMedica() != null && request.getReferenciaMedica().getIdEspecialidad() != null) {
            com.hyma.social.model.EspecialidadReferencia esp = especialidadReferenciaRepository
                    .findById(request.getReferenciaMedica().getIdEspecialidad())
                    .orElse(null);
            if (esp != null) {
                String motivo = request.getReferenciaMedica().getMotivoReferencia();
                if (motivo != null && motivo.length() > 300) {
                    motivo = motivo.substring(0, 300);
                }
                com.hyma.social.model.ReferenciaMedica ref = com.hyma.social.model.ReferenciaMedica.builder()
                        .consulta(consulta)
                        .paciente(paciente)
                        .especialidad(esp)
                        .medico(medico)
                        .fechaReferencia(LocalDateTime.now())
                        .motivoReferencia(motivo)
                        .build();
                referenciaMedicaRepository.save(ref);
            }
        }

        // 6.5. Crear Procedimientos Clínicos (si aplica)
        if (request.getProcedimientos() != null && !request.getProcedimientos().isEmpty()) {
            for (var procReq : request.getProcedimientos()) {
                if (procReq == null || procReq.getIdProcedimiento() == null) continue;
                com.hyma.procedimiento.model.Procedimiento procedimiento = procedimientoRepository
                        .findById(procReq.getIdProcedimiento())
                        .orElse(null);
                if (procedimiento != null) {
                    int cant = procReq.getCantidad() != null && procReq.getCantidad() > 0 ? procReq.getCantidad() : 1;
                    BigDecimal precioUnit = procReq.getPrecioUnitario() != null
                            ? procReq.getPrecioUnitario()
                            : (procedimiento.getPrecio() != null ? procedimiento.getPrecio() : BigDecimal.ZERO);
                    BigDecimal subtotal = precioUnit.multiply(BigDecimal.valueOf(cant));

                    com.hyma.procedimiento.model.ConsultaProcedimiento cp = com.hyma.procedimiento.model.ConsultaProcedimiento.builder()
                            .consulta(consulta)
                            .paciente(paciente)
                            .procedimiento(procedimiento)
                            .cantidad(cant)
                            .precioUnitario(precioUnit)
                            .subtotal(subtotal)
                            .instrucciones(procReq.getInstrucciones())
                            .estado("ESPERA")
                            .fechaRegistro(LocalDateTime.now())
                            .build();
                    consultaProcedimientoRepository.save(cp);
                }
            }
        }

        // 7. Actualizar Cola de Atención
        cola.setEstado(EstadoCola.EN_FARMACIA);
        cola.setDatosConsulta(null);
        cola.setFechaAtencion(LocalDateTime.now());
        colaAtencionRepository.save(cola);

        return ConsultaCompletaResponse.builder()
                .idConsulta(consulta.getIdConsulta())
                .mensaje("Consulta finalizada exitosamente")
                .fechaConsulta(consulta.getFechaConsulta())
                .build();
    }

    @Transactional
    public void ponerEnObservacion(Long idCola, String datosBorrador) {
        ColaAtencion cola = colaAtencionRepository.findById(idCola)
                .orElseThrow(() -> new ColaAtencionNotFoundException(idCola));
        cola.setEstado(EstadoCola.OBSERVACION);
        cola.setDatosConsulta(datosBorrador);
        colaAtencionRepository.save(cola);
    }
}
