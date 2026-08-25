package com.hyma.usuario.controller;

import com.hyma.usuario.dto.UsuarioCreateRequest;
import com.hyma.usuario.dto.UsuarioResponse;
import com.hyma.usuario.dto.UsuarioUpdateRequest;
import com.hyma.usuario.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> getAll() {
        return ResponseEntity.ok(usuarioService.findAll());
    }

    // Agregamos ("id") explícitamente a @PathVariable
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(usuarioService.findById(id));
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> create(@Valid @RequestBody UsuarioCreateRequest request) {
        return new ResponseEntity<>(usuarioService.create(request), HttpStatus.CREATED);
    }

    // Agregamos ("id") explícitamente a @PathVariable
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> update(
            @PathVariable("id") Long id, 
            @Valid @RequestBody UsuarioUpdateRequest request) {
        return ResponseEntity.ok(usuarioService.update(id, request));
    }

    // Agregamos ("id") explícitamente a @PathVariable
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        usuarioService.delete(id);
        return ResponseEntity.noContent().build();
    }
}