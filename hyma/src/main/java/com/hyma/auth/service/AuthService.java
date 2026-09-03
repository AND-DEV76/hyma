package com.hyma.auth.service;

import com.hyma.auth.dto.LoginRequest;
import com.hyma.auth.dto.LoginResponse;
import com.hyma.auth.security.CustomUserDetailsService;
import com.hyma.auth.security.JwtService;
import com.hyma.usuario.mapper.UsuarioMapper;
import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

/**
 * Servicio encargado de la lógica de autenticación de usuarios.
 * Valida credenciales contra hashes Argon2id y emite tokens JWT.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Autentica las credenciales ingresadas y emite un token JWT si son válidas.
     *
     * @param request Credenciales (username y password)
     * @return LoginResponse con token JWT, mensaje y datos del usuario
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        // 1. Buscar usuario en la base de datos
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        // 2. Validar que la cuenta del usuario esté activa
        if (Boolean.FALSE.equals(usuario.getEstado())) {
            throw new RuntimeException("El usuario se encuentra inactivo");
        }

        // 3. Verificar contraseña en texto plano contra el hash Argon2id almacenado
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        // 4. Cargar UserDetails para generar las autoridades correspondientes
        UserDetails userDetails = userDetailsService.loadUserByUsername(usuario.getUsername());

        // 5. Preparar claims personalizados para incluir en el payload del JWT
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("idUsuario", usuario.getIdUsuario());
        extraClaims.put("rol", usuario.getRol().getNombre());

        // 6. Generar token JWT firmado
        String jwtToken = jwtService.generateToken(extraClaims, userDetails);

        // 7. Retornar respuesta de éxito con token JWT y datos de perfil
        return LoginResponse.builder()
                .mensaje("Inicio de sesión exitoso")
                .token(jwtToken)
                .tokenType("Bearer")
                .usuario(usuarioMapper.toResponse(usuario))
                .build();
    }
}