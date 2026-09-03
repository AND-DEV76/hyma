package com.hyma.preconsulta.service;

import com.hyma.preconsulta.dto.SignoVitalCreateRequest;
import com.hyma.preconsulta.dto.SignoVitalResponse;
import com.hyma.preconsulta.mapper.SignoVitalMapper;
import com.hyma.preconsulta.model.SignoVital;
import com.hyma.preconsulta.repository.SignoVitalRepository;
import com.hyma.recepcion.dto.ColaAtencionResponse;
import com.hyma.recepcion.mapper.ColaAtencionMapper;
import com.hyma.recepcion.model.ColaAtencion;
import com.hyma.recepcion.model.EstadoCola;
import com.hyma.recepcion.model.Paciente;
import com.hyma.recepcion.repository.ColaAtencionRepository;
import com.hyma.recepcion.repository.PacienteRepository;
import com.hyma.recepcion.service.ColaAtencionNotFoundException;
import com.hyma.recepcion.service.PacienteNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Servicio que gestiona la lógica de Preconsulta:
 * - Cambio de estado de la cola (PENDIENTE -> EN_PRECONSULTA -> EN_CONSULTA).
 * - Persistencia y asignación obligatoria de signos vitales al paciente.
 * - Consulta de historial clínico de signos vitales.
 */
@Service
@RequiredArgsConstructor
public class PreconsultaService {

    private final SignoVitalRepository signoVitalRepository;
    private final PacienteRepository pacienteRepository;
    private final ColaAtencionRepository colaAtencionRepository;
    private final SignoVitalMapper signoVitalMapper;
    private final ColaAtencionMapper colaAtencionMapper;

    /**
     * Inicia la atención en preconsulta para un turno en cola,
     * transicionando su estado a 'EN_PRECONSULTA'.
     *
     * @param idCola Identificador del turno en cola
     * @return Turno actualizado
     */
    @Transactional
    public ColaAtencionResponse iniciarPreconsulta(Long idCola) {
        ColaAtencion cola = colaAtencionRepository.findById(idCola)
                .orElseThrow(() -> new ColaAtencionNotFoundException(idCola));

        if (cola.getEstado() == EstadoCola.EN_PRECONSULTA) {
            return colaAtencionMapper.toResponse(cola);
        }
        if (cola.getEstado() != EstadoCola.PENDIENTE) {
            throw new com.hyma.exception.EstadoColaInvalidoException(
                    "Solo se puede iniciar preconsulta para un turno en estado PENDIENTE"
            );
        }

        cola.setEstado(EstadoCola.EN_PRECONSULTA);
        ColaAtencion guardada = colaAtencionRepository.save(cola);

        return colaAtencionMapper.toResponse(guardada);
    }

    /**
     * Guarda los signos vitales asignándolos al paciente especificado,
     * y avanza el turno de la cola al estado 'EN_CONSULTA' para que el médico
     * pueda atenderlo.
     *
     * @param request Datos de los signos vitales y referencias de paciente/cola
     * @return Registro de signos vitales creado con IMC calculado
     */
    @Transactional
    public SignoVitalResponse registrarSignosVitales(SignoVitalCreateRequest request) {
        // 1. Validar existencia del paciente (Obligatorio)
        Paciente paciente = pacienteRepository.findById(request.getIdPaciente())
                .orElseThrow(() -> new PacienteNotFoundException(request.getIdPaciente()));

        ColaAtencion colaActual = colaAtencionRepository.findById(request.getIdCola())
                .orElseThrow(() -> new ColaAtencionNotFoundException(request.getIdCola()));
        if (!colaActual.getPaciente().getIdPaciente().equals(paciente.getIdPaciente())) {
            throw new com.hyma.exception.EstadoColaInvalidoException(
                    "El turno indicado no corresponde al paciente de los signos vitales"
            );
        }
        if (colaActual.getEstado() != EstadoCola.EN_PRECONSULTA) {
            throw new com.hyma.exception.EstadoColaInvalidoException(
                    "Los signos vitales solo se pueden registrar para un turno EN_PRECONSULTA"
            );
        }

        // 2. Mapear y guardar la entidad SignoVital
        SignoVital signoVital = signoVitalMapper.toEntity(request, paciente);
        SignoVital guardado = signoVitalRepository.save(signoVital);

        // 3. Transicionar el turno de atención a 'EN_CONSULTA'
        if (request.getIdCola() != null) {
            colaAtencionRepository.findById(request.getIdCola())
                    .ifPresent(cola -> {
                        cola.setEstado(EstadoCola.EN_CONSULTA);
                        colaAtencionRepository.save(cola);
                    });
        } else {
            // Si no se pasó idCola directamente, buscar si el paciente tiene un turno activo en preconsulta o pendiente
            List<ColaAtencion> turnosActivos = colaAtencionRepository.findByEstadoOrderByFechaIngresoAsc(EstadoCola.EN_PRECONSULTA);
            turnosActivos.stream()
                    .filter(c -> c.getPaciente().getIdPaciente().equals(paciente.getIdPaciente()))
                    .findFirst()
                    .ifPresent(cola -> {
                        cola.setEstado(EstadoCola.EN_CONSULTA);
                        colaAtencionRepository.save(cola);
                    });
        }

        return signoVitalMapper.toResponse(guardado);
    }

    /**
     * Obtiene el último registro de signos vitales tomado para un paciente.
     */
    @Transactional(readOnly = true)
    public SignoVitalResponse obtenerUltimosSignosVitales(Long idPaciente) {
        if (!pacienteRepository.existsById(idPaciente)) {
            throw new PacienteNotFoundException(idPaciente);
        }

        return signoVitalRepository.findFirstByPaciente_IdPacienteOrderByFechaRegistroDesc(idPaciente)
                .map(signoVitalMapper::toResponse)
                .orElse(null);
    }

    /**
     * Obtiene el historial completo de signos vitales de un paciente.
     */
    @Transactional(readOnly = true)
    public List<SignoVitalResponse> obtenerHistorialSignosVitales(Long idPaciente) {
        if (!pacienteRepository.existsById(idPaciente)) {
            throw new PacienteNotFoundException(idPaciente);
        }

        return signoVitalRepository.findByPaciente_IdPacienteOrderByFechaRegistroDesc(idPaciente)
                .stream()
                .map(signoVitalMapper::toResponse)
                .toList();
    }
}
