package com.hyma.farmacia.dto;

import com.hyma.farmacia.model.TipoEntrada;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntradaResponse {
    private Long idEntrada;
    private Long idUsuario;
    private String usuarioNombre;
    private LocalDateTime fechaEntrada;
    private TipoEntrada tipoEntrada;
    private String observaciones;
    private List<EntradaDetalleResponse> detalles;
}
