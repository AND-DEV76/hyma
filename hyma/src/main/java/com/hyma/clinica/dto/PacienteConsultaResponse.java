package com.hyma.clinica.dto;

import com.hyma.preconsulta.dto.SignoVitalResponse;
import com.hyma.recepcion.dto.PacienteResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteConsultaResponse {
    private PacienteResponse paciente;
    private SignoVitalResponse ultimoSignoVital;
    private Long idCola;
    private UltimaConsultaResponse ultimaConsulta;
}

