package com.hyma.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudRecuperacionRequest {

    @NotBlank(message = "Debe ingresar su correo electrónico")
    @Email(message = "El formato del correo electrónico no es válido")
    private String correo;

    // Getter de compatibilidad
    public String getCorreo() {
        return correo;
    }

    public void setUsuarioOEmail(String usuarioOEmail) {
        if (this.correo == null || this.correo.isBlank()) {
            this.correo = usuarioOEmail;
        }
    }
}
