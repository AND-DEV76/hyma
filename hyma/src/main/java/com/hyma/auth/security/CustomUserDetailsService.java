package com.hyma.auth.security;

import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

/**
 * Servicio encargado de cargar la información de usuario y sus roles para Spring Security
 * a partir de la base de datos (PostgreSQL).
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con username: " + username));

        // Formatear roles con y sin prefijo 'ROLE_' para compatibilidad total con hasRole() y hasAuthority()
        List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
        if (usuario.getRoles() != null) {
            for (var r : usuario.getRoles()) {
                if (r != null && r.getNombre() != null) {
                    String raw = r.getNombre().trim().toUpperCase();
                    String prefixed = raw.startsWith("ROLE_") ? raw : "ROLE_" + raw;
                    String bare = raw.startsWith("ROLE_") ? raw.substring(5) : raw;
                    authorities.add(new SimpleGrantedAuthority(prefixed));
                    authorities.add(new SimpleGrantedAuthority(bare));
                }
            }
        }

        return new User(
                usuario.getUsername(),
                usuario.getPasswordHash(),
                Boolean.TRUE.equals(usuario.getEstado()), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities
        );
    }
}

