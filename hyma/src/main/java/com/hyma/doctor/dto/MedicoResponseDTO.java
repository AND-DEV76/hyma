package com.hyma.doctor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MedicoResponseDTO {
    private Long idMedico;
    private String nombres;
    private String apellidos;
    private String especialidad;
    private String telefono;
    private String correo;
    private Long idUsuario;
    private String username;
}