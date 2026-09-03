package com.hyma.clinica.dto;

import com.hyma.preconsulta.dto.SignoVitalResponse;
import com.hyma.recepcion.dto.PacienteResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PacienteConsultaResponse {
    private PacienteResponse paciente;
    private SignoVitalResponse ultimoSignoVital;
    private Long idCola;
}
