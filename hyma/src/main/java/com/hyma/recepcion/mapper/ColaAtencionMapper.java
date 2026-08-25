package com.hyma.recepcion.mapper;

import com.hyma.recepcion.dto.ColaAtencionResponse;
import com.hyma.recepcion.model.ColaAtencion;
import org.springframework.stereotype.Component;

@Component
public class ColaAtencionMapper {

    public ColaAtencionResponse toResponse(ColaAtencion cola) {

        return ColaAtencionResponse.builder()
                .idCola(cola.getIdCola())
                .idPaciente(cola.getPaciente().getIdPaciente())
                .nombresPaciente(cola.getPaciente().getNombres())
                .apellidosPaciente(cola.getPaciente().getApellidos())
                .fechaIngreso(cola.getFechaIngreso())
                .estado(cola.getEstado())
                .prioridad(cola.getPrioridad())
                .fechaAtencion(cola.getFechaAtencion())
                .build();
    }
}