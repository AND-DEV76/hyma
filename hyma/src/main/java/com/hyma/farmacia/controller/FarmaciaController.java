package com.hyma.farmacia.controller;

import com.hyma.farmacia.dto.*;
import com.hyma.farmacia.model.EstadoLote;
import com.hyma.farmacia.service.FarmaciaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/farmacia")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA')")
public class FarmaciaController {

    private final FarmaciaService farmaciaService;

    @GetMapping("/categorias")
    public ResponseEntity<List<CatalogoFarmaciaResponse>> listarCategorias() {
        return ResponseEntity.ok(farmaciaService.listarCategorias());
    }

    @PostMapping("/categorias")
    public ResponseEntity<CatalogoFarmaciaResponse> crearCategoria(
            @Valid @RequestBody CatalogoFarmaciaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(farmaciaService.crearCategoria(request));
    }

    @PutMapping("/categorias/{id}")
    public ResponseEntity<CatalogoFarmaciaResponse> actualizarCategoria(
            @PathVariable Long id,
            @Valid @RequestBody CatalogoFarmaciaRequest request) {
        return ResponseEntity.ok(farmaciaService.actualizarCategoria(id, request));
    }

    @DeleteMapping("/categorias/{id}")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        farmaciaService.eliminarCategoria(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/casas-farmaceuticas")
    public ResponseEntity<List<CatalogoFarmaciaResponse>> listarCasas() {
        return ResponseEntity.ok(farmaciaService.listarCasas());
    }

    @PostMapping("/casas-farmaceuticas")
    public ResponseEntity<CatalogoFarmaciaResponse> crearCasa(
            @Valid @RequestBody CatalogoFarmaciaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(farmaciaService.crearCasa(request));
    }

    @PutMapping("/casas-farmaceuticas/{id}")
    public ResponseEntity<CatalogoFarmaciaResponse> actualizarCasa(
            @PathVariable Long id,
            @Valid @RequestBody CatalogoFarmaciaRequest request) {
        return ResponseEntity.ok(farmaciaService.actualizarCasa(id, request));
    }

    @DeleteMapping("/casas-farmaceuticas/{id}")
    public ResponseEntity<Void> eliminarCasa(@PathVariable Long id) {
        farmaciaService.eliminarCasa(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/medicamentos")
    public ResponseEntity<List<MedicamentoResponse>> listarMedicamentos(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long casaId,
            @RequestParam(required = false) Boolean estado,
            @RequestParam(required = false) String buscar) {
        return ResponseEntity.ok(farmaciaService.listarMedicamentos(categoriaId, casaId, estado, buscar));
    }

    @PostMapping("/medicamentos")
    public ResponseEntity<MedicamentoResponse> crearMedicamento(
            @Valid @RequestBody MedicamentoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(farmaciaService.crearMedicamento(request));
    }

    @PutMapping("/medicamentos/{id}")
    public ResponseEntity<MedicamentoResponse> actualizarMedicamento(
            @PathVariable Long id,
            @Valid @RequestBody MedicamentoRequest request) {
        return ResponseEntity.ok(farmaciaService.actualizarMedicamento(id, request));
    }

    @GetMapping("/lotes")
    public ResponseEntity<List<LoteResponse>> listarLotes(
            @RequestParam(required = false) EstadoLote estado,
            @RequestParam(required = false) Long medicamentoId,
            @RequestParam(required = false) LocalDate hasta) {
        return ResponseEntity.ok(farmaciaService.listarLotes(estado, medicamentoId, hasta));
    }

    @GetMapping("/entradas")
    public ResponseEntity<List<EntradaResponse>> listarEntradas(
            @RequestParam(required = false) LocalDate desde,
            @RequestParam(required = false) LocalDate hasta) {
        return ResponseEntity.ok(farmaciaService.listarEntradas(desde, hasta));
    }

    @PostMapping("/entradas")
    public ResponseEntity<EntradaResponse> registrarEntrada(
            @Valid @RequestBody EntradaRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(farmaciaService.registrarEntrada(request, authentication.getName()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardFarmaciaResponse> obtenerDashboard() {
        return ResponseEntity.ok(farmaciaService.obtenerDashboard());
    }

    @GetMapping("/parametros")
    public ResponseEntity<List<ParametroFarmaciaResponse>> listarParametros() {
        return ResponseEntity.ok(farmaciaService.listarParametros());
    }

    @PutMapping("/parametros/{clave}")
    public ResponseEntity<ParametroFarmaciaResponse> actualizarParametro(
            @PathVariable String clave,
            @Valid @RequestBody ParametroFarmaciaRequest request) {
        return ResponseEntity.ok(farmaciaService.actualizarParametro(clave, request));
    }
}
