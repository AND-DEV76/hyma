package com.hyma.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecuperacionResponse {
    private boolean success;
    private String mensaje;
    private String correoOfuscado;
    private Long expiracionSegundos;
}
