package com.hyma.auth.service;


import com.hyma.auth.dto.LoginRequest;
import com.hyma.auth.dto.LoginResponse;
import com.hyma.usuario.mapper.UsuarioMapper;
import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // 1. Buscar usuario
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        // 2. Validar que la cuenta esté activa
        if (Boolean.FALSE.equals(usuario.getEstado())) {
            throw new RuntimeException("El usuario se encuentra inactivo");
        }

        // 3. Verificar contraseña contra el hash Argon2id
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        // 4. Retornar respuesta de éxito con los datos del usuario
        return LoginResponse.builder()
                .mensaje("Inicio de sesión exitoso")
                .usuario(usuarioMapper.toResponse(usuario))
                .build();
    }
}