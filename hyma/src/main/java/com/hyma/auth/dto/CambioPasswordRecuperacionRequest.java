package com.hyma.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CambioPasswordRecuperacionRequest {

    @NotBlank(message = "Debe especificar el correo electrónico")
    private String correo;

    @NotBlank(message = "El código es obligatorio")
    @Pattern(regexp = "^[0-9]{6}$", message = "El código debe ser de 6 dígitos numéricos")
    private String codigo;

    @NotBlank(message = "La nueva contraseña no puede estar vacía")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String nuevaPassword;

    public void setUsuarioOEmail(String usuarioOEmail) {
        if (this.correo == null || this.correo.isBlank()) {
            this.correo = usuarioOEmail;
        }
    }
}
