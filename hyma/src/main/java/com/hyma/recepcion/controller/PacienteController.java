package com.hyma.recepcion.controller;

import com.hyma.recepcion.dto.PacienteCreateRequest;
import com.hyma.recepcion.dto.PacienteResponse;
import com.hyma.recepcion.dto.PacienteResumenResponse;
import com.hyma.recepcion.dto.PacienteUpdateRequest;
import com.hyma.recepcion.service.PacienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/recepcion/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    @PostMapping
    public ResponseEntity<PacienteResponse> crearPaciente(
            @Valid @RequestBody PacienteCreateRequest request
    ) {

        PacienteResponse response =
                pacienteService.crearPaciente(request);

        URI location = URI.create(
                "/api/recepcion/pacientes/" +
                        response.getIdPaciente()
        );

        return ResponseEntity
                .created(location)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<PacienteResumenResponse>> buscarPacientes(
            @RequestParam(name = "buscar", required = false) String buscar
    ) {

        return ResponseEntity.ok(
                pacienteService.buscar(buscar)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<PacienteResponse> obtenerPaciente(
            @PathVariable(name = "id") Long id
    ) {

        return ResponseEntity.ok(
                pacienteService.obtenerPorId(id)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<PacienteResponse> actualizarPaciente(
            @PathVariable(name = "id") Long id,
            @Valid @RequestBody PacienteUpdateRequest request
    ) {

        return ResponseEntity.ok(
                pacienteService.actualizarPaciente(id, request)
        );
    }
}