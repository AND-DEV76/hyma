package com.hyma.clinica.controller;

import com.hyma.clinica.dto.CatalogoCie10Request;
import com.hyma.clinica.dto.CatalogoCie10Response;
import com.hyma.clinica.service.CatalogoCie10Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/diagnosticos/catalogo")
@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
@RequiredArgsConstructor
public class CatalogoCie10Controller {

    private final CatalogoCie10Service catalogoService;

    @GetMapping
    public ResponseEntity<Page<CatalogoCie10Response>> listar(
            @RequestParam(name = "buscar", required = false) String buscar,
            Pageable pageable) {
        return ResponseEntity.ok(catalogoService.buscar(buscar, pageable));
    }

    @PostMapping
    public ResponseEntity<CatalogoCie10Response> crear(@Valid @RequestBody CatalogoCie10Request request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CatalogoCie10Response> actualizar(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody CatalogoCie10Request request) {
        return ResponseEntity.ok(catalogoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable(name = "id") Long id) {
        catalogoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
