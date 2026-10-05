package com.hyma.social.controller;

import com.hyma.social.dto.*;
import com.hyma.social.service.SocialService;
import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/social")
@PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL', 'MEDICO', 'ENFERMERA')")
@RequiredArgsConstructor
public class SocialController {

    private final SocialService socialService;

    @GetMapping("/especialidades")
    public ResponseEntity<List<EspecialidadReferenciaResponse>> listarEspecialidades(
            @RequestParam(name = "buscar", required = false) String buscar) {
        return ResponseEntity.ok(socialService.listarEspecialidades(buscar));
    }

    @GetMapping("/especialidades-contactos")
    public ResponseEntity<List<EspecialidadConContactosResponse>> listarEspecialidadesConContactos(
            @RequestParam(name = "buscar", required = false) String buscar) {
        return ResponseEntity.ok(socialService.listarEspecialidadesConContactos(buscar));
    }

    @PostMapping("/especialidades")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<EspecialidadReferenciaResponse> crearEspecialidad(
            @Valid @RequestBody EspecialidadReferenciaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialService.crearEspecialidad(request));
    }

    @PutMapping("/especialidades/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<EspecialidadReferenciaResponse> actualizarEspecialidad(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody EspecialidadReferenciaRequest request) {
        return ResponseEntity.ok(socialService.actualizarEspecialidad(id, request));
    }

    @DeleteMapping("/especialidades/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<Void> eliminarEspecialidad(@PathVariable(name = "id") Long id) {
        socialService.eliminarEspecialidad(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/centros")
    public ResponseEntity<List<CentroReferenciaResponse>> listarCentros(
            @RequestParam(name = "idEspecialidad", required = false) Long idEspecialidad) {
        return ResponseEntity.ok(socialService.listarCentrosPorEspecialidad(idEspecialidad));
    }

    @PostMapping("/centros")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<CentroReferenciaResponse> crearCentroReferencia(
            @Valid @RequestBody CentroReferenciaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(socialService.crearCentroReferencia(request));
    }

    @PutMapping("/centros/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<CentroReferenciaResponse> actualizarCentroReferencia(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody CentroReferenciaRequest request) {
        return ResponseEntity.ok(socialService.actualizarCentroReferencia(id, request));
    }

    @DeleteMapping("/centros/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<Void> eliminarCentroReferencia(@PathVariable(name = "id") Long id) {
        socialService.eliminarCentroReferencia(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<DashboardReferenciasResponse> obtenerDashboard(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) {
        return ResponseEntity.ok(socialService.obtenerDashboard(anio, mes));
    }

    @GetMapping("/dashboard/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<byte[]> exportarExcelDashboard(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) throws IOException {
        byte[] excelBytes = socialService.exportarExcelDashboard(anio, mes);
        String filename = "Referencias_Medicas_" + (anio != null ? anio : "2026") + "_" + (mes != null ? mes : "10") + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @GetMapping("/pacientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<List<PacienteResumenSocialResponse>> listarPacientes(
            @RequestParam(name = "buscar", required = false) String buscar) {
        return ResponseEntity.ok(socialService.listarPacientesRecientes(buscar));
    }

    @GetMapping("/pacientes/{idPaciente}/expediente")
    @PreAuthorize("hasAnyRole('ADMIN', 'SOCIAL')")
    public ResponseEntity<ExpedienteSocialResponse> obtenerExpediente(
            @PathVariable(name = "idPaciente") Long idPaciente) {
        return ResponseEntity.ok(socialService.obtenerExpediente(idPaciente));
    }
}
