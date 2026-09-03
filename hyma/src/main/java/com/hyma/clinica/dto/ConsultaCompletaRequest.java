package com.hyma.clinica.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ConsultaCompletaRequest {
    @NotNull(message = "El idPaciente es obligatorio")
    private Long idPaciente;
    
    @NotNull(message = "El idCola es obligatorio")
    private Long idCola;
    
    private Long idSignoVital;

    private String motivoConsulta;
    private String historiaEnfermedadActual;
    private String impresionClinica;
    private String planMedico;

    @Valid
    private ExamenFisicoRequest examenFisico;

    @NotEmpty(message = "Debe agregar al menos un diagnóstico")
    @Valid
    private List<DiagnosticoRequest> diagnosticos;

    @Valid
    private TratamientoRequest tratamiento;
}
