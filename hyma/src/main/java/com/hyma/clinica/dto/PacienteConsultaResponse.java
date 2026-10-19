package com.hyma.clinica.dto;

import com.hyma.preconsulta.dto.SignoVitalResponse;
import com.hyma.recepcion.dto.PacienteResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteConsultaResponse {
    private PacienteResponse paciente;
    private SignoVitalResponse ultimoSignoVital;
    private Long idCola;
    private String estadoCola;
    private String datosConsultaBorrador;
    private UltimaConsultaResponse ultimaConsulta;
    private List<UltimaConsultaResponse> historialConsultas;
}

