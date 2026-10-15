package com.hyma.procedimiento.controller;

import com.hyma.procedimiento.dto.ActualizarPrecioProcedimientoRequest;
import com.hyma.procedimiento.dto.ConsultaProcedimientoResponse;
import com.hyma.procedimiento.dto.ProcedimientoDTO;
import com.hyma.procedimiento.service.ProcedimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/procedimientos")
@RequiredArgsConstructor
public class ProcedimientoController {

    private final ProcedimientoService procedimientoService;

    @GetMapping
    public ResponseEntity<List<ProcedimientoDTO>> listarTodos() {
        return ResponseEntity.ok(procedimientoService.listarTodos());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<ProcedimientoDTO>> listarActivos() {
        return ResponseEntity.ok(procedimientoService.listarActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedimientoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(procedimientoService.obtenerPorId(id));
    }

    @PutMapping("/{id}/precio")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENFERMERA') or hasAnyAuthority('ROLE_ADMIN', 'ROLE_ENFERMERA', 'ADMIN', 'ENFERMERA')")
    public ResponseEntity<ProcedimientoDTO> actualizarPrecio(
            @PathVariable Long id,
            @Valid @RequestBody ActualizarPrecioProcedimientoRequest request) {
        return ResponseEntity.ok(procedimientoService.actualizarPrecio(id, request.getPrecio()));
    }

    @GetMapping("/pacientes/pendientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'FARMACIA', 'ENFERMERA') or hasAnyAuthority('ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_FARMACIA', 'ROLE_ENFERMERA', 'ADMIN', 'MEDICO', 'FARMACIA', 'ENFERMERA')")
    public ResponseEntity<List<ConsultaProcedimientoResponse>> listarPendientes() {
        return ResponseEntity.ok(procedimientoService.listarPendientes());
    }

    @GetMapping("/pacientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'FARMACIA', 'ENFERMERA') or hasAnyAuthority('ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_FARMACIA', 'ROLE_ENFERMERA', 'ADMIN', 'MEDICO', 'FARMACIA', 'ENFERMERA')")
    public ResponseEntity<List<ConsultaProcedimientoResponse>> listarPorEstado(
            @RequestParam(required = false) String estado) {
        return ResponseEntity.ok(procedimientoService.listarPorEstado(estado));
    }

    @GetMapping("/pacientes/conteo-pendientes")
    public ResponseEntity<Map<String, Object>> conteoPendientes() {
        long conteo = procedimientoService.conteoPendientes();
        return ResponseEntity.ok(Map.of("pendientes", conteo));
    }

    @GetMapping("/consulta/{idConsulta}")
    public ResponseEntity<List<ConsultaProcedimientoResponse>> obtenerPorConsulta(@PathVariable Long idConsulta) {
        return ResponseEntity.ok(procedimientoService.obtenerPorConsulta(idConsulta));
    }

    @PutMapping("/pacientes/{id}/cancelar")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'FARMACIA', 'ENFERMERA') or hasAnyAuthority('ROLE_ADMIN', 'ROLE_MEDICO', 'ROLE_FARMACIA', 'ROLE_ENFERMERA', 'ADMIN', 'MEDICO', 'FARMACIA', 'ENFERMERA')")
    public ResponseEntity<ConsultaProcedimientoResponse> cancelarProcedimiento(@PathVariable Long id) {
        return ResponseEntity.ok(procedimientoService.cancelarProcedimiento(id));
    }

    @PutMapping("/pacientes/{id}/atender")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA', 'ENFERMERA') or hasAnyAuthority('ROLE_ADMIN', 'ROLE_FARMACIA', 'ROLE_ENFERMERA', 'ADMIN', 'FARMACIA', 'ENFERMERA')")
    public ResponseEntity<ConsultaProcedimientoResponse> marcarAtendido(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(procedimientoService.marcarAtendido(id, username));
    }
}
