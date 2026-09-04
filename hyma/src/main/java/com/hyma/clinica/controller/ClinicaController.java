package com.hyma.clinica.controller;

import com.hyma.clinica.dto.ConsultaCompletaRequest;
import com.hyma.clinica.dto.ConsultaCompletaResponse;
import com.hyma.clinica.dto.PacienteConsultaResponse;
import com.hyma.clinica.service.ClinicaService;
import com.hyma.farmacia.dto.MedicamentoResponse;
import com.hyma.farmacia.service.FarmaciaService;
import com.hyma.recepcion.dto.ColaAtencionResponse;
import com.hyma.recepcion.model.EstadoCola;
import com.hyma.recepcion.service.ColaAtencionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clinica")
@PreAuthorize("hasAnyRole('ADMIN', 'MEDICO')")
@RequiredArgsConstructor
public class ClinicaController {

    private final ClinicaService clinicaService;
    private final ColaAtencionService colaAtencionService;
    private final FarmaciaService farmaciaService;

    @GetMapping("/cola")
    public ResponseEntity<List<ColaAtencionResponse>> obtenerColaConsulta() {
        return ResponseEntity.ok(colaAtencionService.obtenerCola(EstadoCola.EN_CONSULTA));
    }

    @GetMapping("/pacientes/{idPaciente}")
    public ResponseEntity<PacienteConsultaResponse> obtenerDatosPaciente(
            @PathVariable(name = "idPaciente") Long idPaciente,
            @RequestParam(name = "idCola", required = false) Long idCola) {
        return ResponseEntity.ok(clinicaService.obtenerDatosPacienteParaConsulta(idPaciente, idCola));
    }

    @PostMapping("/consultas")
    public ResponseEntity<ConsultaCompletaResponse> finalizarConsulta(
            @Valid @RequestBody ConsultaCompletaRequest request,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clinicaService.finalizarConsulta(request, authentication.getName()));
    }

    @GetMapping("/medicamentos")
    public ResponseEntity<List<MedicamentoResponse>> buscarMedicamentos(
            @RequestParam(name = "buscar", required = false) String buscar) {
        return ResponseEntity.ok(farmaciaService.listarMedicamentos(null, null, true, buscar));
    }
}
