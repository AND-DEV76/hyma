package com.hyma.alergia.controller;

import com.hyma.alergia.dto.AlergiaRequestDto;
import com.hyma.alergia.dto.AlergiaResponseDto;
import com.hyma.alergia.service.AlergiaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/alergias")
@RequiredArgsConstructor
public class AlergiaController {

    private final AlergiaService alergiaService;

    @GetMapping
    public ResponseEntity<List<AlergiaResponseDto>> obtenerTodas() {
        return ResponseEntity.ok(alergiaService.obtenerTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AlergiaResponseDto> obtenerPorId(@PathVariable("id") Long id) {
        return ResponseEntity.ok(alergiaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<AlergiaResponseDto> crear(@Valid @RequestBody AlergiaRequestDto dto) {
        return new ResponseEntity<>(alergiaService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AlergiaResponseDto> actualizar(
            @PathVariable("id") Long id,
            @Valid @RequestBody AlergiaRequestDto dto) {
        return ResponseEntity.ok(alergiaService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        alergiaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}