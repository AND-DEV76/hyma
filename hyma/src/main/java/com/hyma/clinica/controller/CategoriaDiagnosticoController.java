package com.hyma.clinica.controller;

import com.hyma.clinica.dto.CategoriaDiagnosticoRequest;
import com.hyma.clinica.dto.CategoriaDiagnosticoResponse;
import com.hyma.clinica.service.CategoriaDiagnosticoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/diagnosticos/categorias")
@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
@RequiredArgsConstructor
public class CategoriaDiagnosticoController {

    private final CategoriaDiagnosticoService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaDiagnosticoResponse>> listar() {
        return ResponseEntity.ok(categoriaService.listar());
    }

    @PostMapping
    public ResponseEntity<CategoriaDiagnosticoResponse> crear(@Valid @RequestBody CategoriaDiagnosticoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoriaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaDiagnosticoResponse> actualizar(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody CategoriaDiagnosticoRequest request) {
        return ResponseEntity.ok(categoriaService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable(name = "id") Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

