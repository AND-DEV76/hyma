package com.hyma.auth.service;

import com.hyma.auth.dto.CambioPasswordRecuperacionRequest;
import com.hyma.auth.dto.RecuperacionResponse;
import com.hyma.auth.dto.SolicitudRecuperacionRequest;
import com.hyma.auth.dto.VerificarCodigoRequest;
import com.hyma.auth.model.TokenRecuperacion;
import com.hyma.auth.repository.TokenRecuperacionRepository;
import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecuperacionPasswordService {

    private final UsuarioRepository usuarioRepository;
    private final TokenRecuperacionRepository tokenRecuperacionRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    /**
     * Paso 1: Solicitar código de recuperación de contraseña buscando únicamente por correo.
     */
    @Transactional
    public RecuperacionResponse solicitarCodigo(SolicitudRecuperacionRequest request) {
        String correo = request.getCorreo().trim();

        // 1. Buscar usuario ÚNICAMENTE por correo registrado
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ningún usuario con el correo electrónico registrado: " + correo));

        // 2. Validar estado del usuario
        if (Boolean.FALSE.equals(usuario.getEstado())) {
            throw new IllegalStateException("El usuario asociado a este correo se encuentra inactivo. Comuníquese con el administrador.");
        }

        // 3. Invalidar tokens anteriores pendientes para este usuario
        List<TokenRecuperacion> anteriores = tokenRecuperacionRepository.findByIdUsuarioAndUsadoFalse(usuario.getIdUsuario());
        for (TokenRecuperacion tr : anteriores) {
            tr.setUsado(true);
        }
        tokenRecuperacionRepository.saveAll(anteriores);

        // 4. Generar nuevo código numérico de 6 dígitos
        String codigoOTP = String.format("%06d", ThreadLocalRandom.current().nextInt(1000000));
        LocalDateTime expiracion = LocalDateTime.now().plusMinutes(3); // 3 minutos de validez

        TokenRecuperacion token = TokenRecuperacion.builder()
                .idUsuario(usuario.getIdUsuario())
                .correo(usuario.getCorreo())
                .codigo(codigoOTP)
                .fechaExpiracion(expiracion)
                .usado(false)
                .build();

        tokenRecuperacionRepository.save(token);

        // 5. Enviar correo electrónico
        EmailService.EmailResult resultado = emailService.enviarCodigoRecuperacion(usuario.getCorreo(), codigoOTP, usuario.getUsername());
        if (!resultado.success()) {
            log.warn("Fallo al enviar correo a {} con Resend: {}", usuario.getCorreo(), resultado.errorMessage());
            throw new IllegalArgumentException("No fue posible enviar el correo de recuperación: " + resultado.errorMessage());
        }

        String correoOfuscado = ofuscarCorreo(usuario.getCorreo());

        return RecuperacionResponse.builder()
                .success(true)
                .mensaje("Se ha enviado un código de seguridad de 6 dígitos a su correo electrónico.")
                .correoOfuscado(correoOfuscado)
                .expiracionSegundos(180L)
                .build();
    }

    /**
     * Paso 2: Verificar si el código OTP ingresado es válido y vigente buscando por correo.
     */
    @Transactional(readOnly = true)
    public RecuperacionResponse verificarCodigo(VerificarCodigoRequest request) {
        String correo = request.getCorreo().trim();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ningún usuario con el correo: " + correo));

        TokenRecuperacion token = tokenRecuperacionRepository
                .findTopByIdUsuarioAndCodigoAndUsadoFalseOrderByFechaCreacionDesc(usuario.getIdUsuario(), request.getCodigo().trim())
                .orElseThrow(() -> new IllegalArgumentException("El código de verificación es incorrecto o ya fue utilizado."));

        if (token.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El código ha expirado. Recuerde que el código es válido únicamente por 3 minutos.");
        }

        long segundosRestantes = Duration.between(LocalDateTime.now(), token.getFechaExpiracion()).getSeconds();

        return RecuperacionResponse.builder()
                .success(true)
                .mensaje("Código de seguridad verificado correctamente.")
                .correoOfuscado(ofuscarCorreo(token.getCorreo()))
                .expiracionSegundos(Math.max(segundosRestantes, 0))
                .build();
    }

    /**
     * Paso 3: Cambiar la contraseña validando el código OTP.
     */
    @Transactional
    public RecuperacionResponse cambiarPassword(CambioPasswordRecuperacionRequest request) {
        if (request.getNuevaPassword() == null || request.getNuevaPassword().trim().length() < 8) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 8 caracteres.");
        }

        String correo = request.getCorreo().trim();
        Usuario usuario = usuarioRepository.findByCorreo(correo)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró ningún usuario con el correo: " + correo));

        TokenRecuperacion token = tokenRecuperacionRepository
                .findTopByIdUsuarioAndCodigoAndUsadoFalseOrderByFechaCreacionDesc(usuario.getIdUsuario(), request.getCodigo().trim())
                .orElseThrow(() -> new IllegalArgumentException("El código de verificación es incorrecto o ya fue utilizado."));

        if (token.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("El código de seguridad ha expirado. Por favor solicite uno nuevo.");
        }

        // Actualizar contraseña con Argon2
        usuario.setPasswordHash(passwordEncoder.encode(request.getNuevaPassword().trim()));
        usuarioRepository.save(usuario);

        // Marcar token como consumido
        token.setUsado(true);
        tokenRecuperacionRepository.save(token);

        log.info("Contraseña restablecida exitosamente para el usuario {}", usuario.getUsername());

        return RecuperacionResponse.builder()
                .success(true)
                .mensaje("Su contraseña ha sido restablecida exitosamente. Ahora puede iniciar sesión con su nueva clave.")
                .build();
    }

    private String ofuscarCorreo(String correo) {
        if (correo == null || !correo.contains("@")) return "******";
        String[] partes = correo.split("@");
        String nombre = partes[0];
        String dominio = partes[1];

        if (nombre.length() <= 2) {
            return nombre.charAt(0) + "***@" + dominio;
        }
        return nombre.substring(0, 2) + "***" + nombre.substring(nombre.length() - 1) + "@" + dominio;
    }
}
