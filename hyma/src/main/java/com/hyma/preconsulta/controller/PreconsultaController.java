package com.hyma.preconsulta.controller;

import com.hyma.preconsulta.dto.SignoVitalCreateRequest;
import com.hyma.preconsulta.dto.SignoVitalResponse;
import com.hyma.preconsulta.service.PreconsultaService;
import com.hyma.recepcion.dto.ColaAtencionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

/**
 * Controlador REST para el Módulo 2: Preconsulta y Signos Vitales.
 * Permite cambiar el estado de la cola y persistir las mediciones fisiológicas del paciente.
 */
@RestController
@RequestMapping("/api/preconsulta")
@RequiredArgsConstructor
public class PreconsultaController {

    private final PreconsultaService preconsultaService;

    /**
     * Inicia la atención en preconsulta para un paciente en espera (PENDIENTE -> EN_PRECONSULTA).
     */
    @PostMapping("/iniciar/{idCola}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENFERMERA')")
    public ResponseEntity<ColaAtencionResponse> iniciarPreconsulta(@PathVariable("idCola") Long idCola) {
        return ResponseEntity.ok(preconsultaService.iniciarPreconsulta(idCola));
    }

    /**
     * Registra los signos vitales tomados por enfermería y avanza el turno a EN_CONSULTA.
     */
    @PostMapping("/signos-vitales")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENFERMERA')")
    public ResponseEntity<SignoVitalResponse> registrarSignosVitales(
            @Valid @RequestBody SignoVitalCreateRequest request
    ) {
        SignoVitalResponse response = preconsultaService.registrarSignosVitales(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene el último registro de signos vitales de un paciente.
     */
    @GetMapping("/pacientes/{idPaciente}/signos-vitales/ultimo")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENFERMERA', 'MEDICO')")
    public ResponseEntity<SignoVitalResponse> obtenerUltimosSignosVitales(
            @PathVariable("idPaciente") Long idPaciente
    ) {
        SignoVitalResponse response = preconsultaService.obtenerUltimosSignosVitales(idPaciente);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene el historial completo de signos vitales de un paciente.
     */
    @GetMapping("/pacientes/{idPaciente}/signos-vitales")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENFERMERA', 'MEDICO')")
    public ResponseEntity<List<SignoVitalResponse>> obtenerHistorialSignosVitales(
            @PathVariable("idPaciente") Long idPaciente
    ) {
        return ResponseEntity.ok(preconsultaService.obtenerHistorialSignosVitales(idPaciente));
    }
}
