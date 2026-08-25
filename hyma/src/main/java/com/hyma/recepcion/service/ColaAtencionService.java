package com.hyma.recepcion.service;

import com.hyma.recepcion.dto.CambiarEstadoColaRequest;
import com.hyma.recepcion.dto.ColaAtencionCreateRequest;
import com.hyma.recepcion.dto.ColaAtencionResponse;
import com.hyma.recepcion.mapper.ColaAtencionMapper;
import com.hyma.recepcion.model.ColaAtencion;
import com.hyma.recepcion.model.EstadoCola;
import com.hyma.recepcion.model.Paciente;
import com.hyma.recepcion.repository.ColaAtencionRepository;

import com.hyma.recepcion.repository.PacienteRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ColaAtencionService {

    private final ColaAtencionRepository colaAtencionRepository;
    private final PacienteRepository pacienteRepository;
    private final ColaAtencionMapper colaAtencionMapper;

    private static final List<EstadoCola> ESTADOS_ACTIVOS = List.of(
            EstadoCola.PENDIENTE,
            EstadoCola.EN_PRECONSULTA,
            EstadoCola.EN_CONSULTA,
            EstadoCola.EN_FARMACIA
    );

    @Transactional
    public ColaAtencionResponse agregarACola(
            ColaAtencionCreateRequest request
    ) {

        /*
         * Se bloquea el registro del paciente durante esta transacción.
         *
         * Esto evita que dos peticiones simultáneas puedan agregar
         * al mismo paciente a una cola activa al mismo tiempo.
         */
        Paciente paciente = pacienteRepository
                .findByIdForUpdate(request.getIdPaciente())
                .orElseThrow(
                        () -> new PacienteNotFoundException(
                                request.getIdPaciente()
                        )
                );

        boolean yaEstaEnCola = colaAtencionRepository
                .existsByPaciente_IdPacienteAndEstadoIn(
                        paciente.getIdPaciente(),
                        ESTADOS_ACTIVOS
                );

        if (yaEstaEnCola) {
            throw new PacienteYaEnColaException(
                    paciente.getIdPaciente()
            );
        }

        ColaAtencion cola = ColaAtencion.builder()
                .paciente(paciente)
                .estado(EstadoCola.PENDIENTE)
                .prioridad(
                        request.getPrioridad() == null
                                ? 0
                                : request.getPrioridad()
                )
                .fechaIngreso(LocalDateTime.now())
                .build();

        ColaAtencion guardada = colaAtencionRepository.save(cola);

        return colaAtencionMapper.toResponse(guardada);
    }

    @Transactional(readOnly = true)
    public List<ColaAtencionResponse> obtenerCola(
            EstadoCola estado
    ) {

        List<ColaAtencion> cola;

        if (estado == null) {
            cola = colaAtencionRepository
                    .findAllByOrderByFechaIngresoAsc();
        } else {
            cola = colaAtencionRepository
                    .findByEstadoOrderByFechaIngresoAsc(estado);
        }

        return cola.stream()
                .map(colaAtencionMapper::toResponse)
                .toList();
    }

    @Transactional
    public ColaAtencionResponse cambiarEstado(
            Long idCola,
            CambiarEstadoColaRequest request
    ) {

        ColaAtencion cola = colaAtencionRepository.findById(idCola)
                .orElseThrow(
                        () -> new ColaAtencionNotFoundException(idCola)
                );

        cola.setEstado(request.getEstado());

        if (request.getEstado() == EstadoCola.FINALIZADO
                || request.getEstado() == EstadoCola.CANCELADO) {

            if (cola.getFechaAtencion() == null) {
                cola.setFechaAtencion(LocalDateTime.now());
            }
        }

        return colaAtencionMapper.toResponse(cola);
    }
}