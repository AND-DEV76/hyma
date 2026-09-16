package com.hyma.tarifa.controller;

import com.hyma.tarifa.dto.TarifaDTO;
import com.hyma.tarifa.service.TarifaServicioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tarifas")
@RequiredArgsConstructor
public class TarifaServicioController {

    private final TarifaServicioService tarifaService;

    @GetMapping
    public ResponseEntity<List<TarifaDTO>> listarTodas() {
        return ResponseEntity.ok(tarifaService.listarTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<TarifaDTO>> listarActivas() {
        return ResponseEntity.ok(tarifaService.listarActivas());
    }

    @GetMapping("/consulta-general")
    public ResponseEntity<Map<String, Object>> obtenerPrecioConsultaGeneral() {
        BigDecimal precio = tarifaService.obtenerPrecioConsultaGeneral();
        return ResponseEntity.ok(Map.of(
                "nombre", "Consulta General",
                "precio", precio
        ));
    }

    @PutMapping("/consulta-general")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
    public ResponseEntity<TarifaDTO> actualizarPrecioConsultaGeneral(@RequestBody Map<String, Object> payload) {
        Object precioObj = payload.get("precio");
        if (precioObj == null) {
            throw new IllegalArgumentException("El campo 'precio' es requerido");
        }
        BigDecimal nuevoPrecio = new BigDecimal(precioObj.toString());
        return ResponseEntity.ok(tarifaService.actualizarPrecioConsultaGeneral(nuevoPrecio));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TarifaDTO> actualizar(@PathVariable(name = "id") Long id, @RequestBody TarifaDTO dto) {
        return ResponseEntity.ok(tarifaService.actualizar(id, dto));
    }
}
