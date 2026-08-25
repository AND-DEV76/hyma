package com.hyma.doctor.controller;



import com.hyma.doctor.dto.MedicoRequestDTO;
import com.hyma.doctor.dto.MedicoResponseDTO;
import com.hyma.doctor.service.MedicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/medicos")
@RequiredArgsConstructor
public class MedicoController {

    private final MedicoService medicoService;

    @GetMapping
    public ResponseEntity<List<MedicoResponseDTO>> obtenerTodos() {
        return ResponseEntity.ok(medicoService.obtenerTodos());
    }

    // AGREGAR ("id") AQUÍ
    @GetMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> obtenerPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(medicoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<MedicoResponseDTO> crear(@Valid @RequestBody MedicoRequestDTO requestDTO) {
        return new ResponseEntity<>(medicoService.crear(requestDTO), HttpStatus.CREATED);
    }

    // AGREGAR ("id") AQUÍ
    @PutMapping("/{id}")
    public ResponseEntity<MedicoResponseDTO> actualizar(
            @PathVariable("id") Long id,
            @Valid @RequestBody MedicoRequestDTO requestDTO
    ) {
        return ResponseEntity.ok(medicoService.actualizar(id, requestDTO));
    }

    // AGREGAR ("id") AQUÍ
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        medicoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}