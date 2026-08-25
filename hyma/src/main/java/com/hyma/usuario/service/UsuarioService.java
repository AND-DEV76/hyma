package com.hyma.usuario.service;

import com.hyma.usuario.dto.UsuarioCreateRequest;
import com.hyma.usuario.dto.UsuarioResponse;
import com.hyma.usuario.dto.UsuarioUpdateRequest;
import com.hyma.usuario.mapper.UsuarioMapper;
import com.hyma.usuario.model.Rol;
import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.RolRepository;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> findAll() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsuarioResponse findById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
        return usuarioMapper.toResponse(usuario);
    }

    @Transactional
    public UsuarioResponse create(UsuarioCreateRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("El nombre de usuario ya está en uso");
        }

        Rol rol = rolRepository.findById(request.getIdRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + request.getIdRol()));

        // Codificación con Argon2id
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        Usuario usuario = Usuario.builder()
                .rol(rol)
                .username(request.getUsername())
                .passwordHash(encodedPassword)
                .estado(true)
                .build();

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse update(Long id, UsuarioUpdateRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));

        if (usuarioRepository.existsByUsernameAndIdUsuarioNot(request.getUsername(), id)) {
            throw new RuntimeException("El nombre de usuario ya está asignado a otro registro");
        }

        Rol rol = rolRepository.findById(request.getIdRol())
                .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + request.getIdRol()));

        usuario.setRol(rol);
        usuario.setUsername(request.getUsername());
        usuario.setEstado(request.getEstado());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        return usuarioMapper.toResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public void delete(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new RuntimeException("Usuario no encontrado con ID: " + id);
        }
        usuarioRepository.deleteById(id);
    }
}