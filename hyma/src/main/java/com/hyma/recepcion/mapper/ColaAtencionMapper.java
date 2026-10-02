package com.hyma.recepcion.mapper;

import com.hyma.preconsulta.dto.SignoVitalResponse;
import com.hyma.recepcion.dto.ColaAtencionResponse;
import com.hyma.recepcion.model.ColaAtencion;
import org.springframework.stereotype.Component;

@Component
public class ColaAtencionMapper {

    public ColaAtencionResponse toResponse(ColaAtencion cola) {
        return toResponse(cola, null);
    }

    public ColaAtencionResponse toResponse(ColaAtencion cola, SignoVitalResponse ultimoSignoVital) {
        return ColaAtencionResponse.builder()
                .idCola(cola.getIdCola())
                .idPaciente(cola.getPaciente().getIdPaciente())
                .nombresPaciente(cola.getPaciente().getNombres())
                .apellidosPaciente(cola.getPaciente().getApellidos())
                .fechaIngreso(cola.getFechaIngreso())
                .estado(cola.getEstado())
                .prioridad(cola.getPrioridad())
                .fechaAtencion(cola.getFechaAtencion())
                .ultimoSignoVital(ultimoSignoVital)
                .build();
    }
}