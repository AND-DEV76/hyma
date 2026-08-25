package com.hyma.recepcion.controller;

import com.hyma.recepcion.dto.CambiarEstadoColaRequest;
import com.hyma.recepcion.dto.ColaAtencionCreateRequest;
import com.hyma.recepcion.dto.ColaAtencionResponse;
import com.hyma.recepcion.model.EstadoCola;
import com.hyma.recepcion.service.ColaAtencionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/recepcion/cola")
@RequiredArgsConstructor
public class ColaAtencionController {

    private final ColaAtencionService colaAtencionService;

    @PostMapping
    public ResponseEntity<ColaAtencionResponse> agregarACola(
            @Valid @RequestBody ColaAtencionCreateRequest request
    ) {

        ColaAtencionResponse response =
                colaAtencionService.agregarACola(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ColaAtencionResponse>> obtenerCola(
            @RequestParam(name = "estado", required = false)
            EstadoCola estado
    ) {

        return ResponseEntity.ok(
                colaAtencionService.obtenerCola(estado)
        );
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<ColaAtencionResponse> cambiarEstado(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody CambiarEstadoColaRequest request
    ) {

        return ResponseEntity.ok(
                colaAtencionService.cambiarEstado(id, request)
        );
    }
}