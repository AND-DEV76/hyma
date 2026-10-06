package com.hyma.auth.controller;

import com.hyma.auth.dto.CambioPasswordRecuperacionRequest;
import com.hyma.auth.dto.RecuperacionResponse;
import com.hyma.auth.dto.SolicitudRecuperacionRequest;
import com.hyma.auth.dto.VerificarCodigoRequest;
import com.hyma.auth.service.RecuperacionPasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/recuperar-password")
@RequiredArgsConstructor
public class RecuperacionPasswordController {

    private final RecuperacionPasswordService recuperacionPasswordService;

    @PostMapping("/solicitar")
    public ResponseEntity<RecuperacionResponse> solicitarCodigo(@Valid @RequestBody SolicitudRecuperacionRequest request) {
        return ResponseEntity.ok(recuperacionPasswordService.solicitarCodigo(request));
    }

    @PostMapping("/verificar")
    public ResponseEntity<RecuperacionResponse> verificarCodigo(@Valid @RequestBody VerificarCodigoRequest request) {
        return ResponseEntity.ok(recuperacionPasswordService.verificarCodigo(request));
    }

    @PostMapping("/cambiar")
    public ResponseEntity<RecuperacionResponse> cambiarPassword(@Valid @RequestBody CambioPasswordRecuperacionRequest request) {
        return ResponseEntity.ok(recuperacionPasswordService.cambiarPassword(request));
    }
}
