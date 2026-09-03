package com.hyma.config;

import com.hyma.auth.security.CustomUserDetailsService;
import com.hyma.auth.security.JwtAuthenticationEntryPoint;
import com.hyma.auth.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuración central de Seguridad (Spring Security 6+).
 * - Autenticación Stateless basada en JWT.
 * - Hashing de contraseñas con Argon2id.
 * - Protección granular de endpoints según rol y token.
 * - Manejador de CORS unificado.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final JwtAuthenticationEntryPoint jwtAuthEntryPoint;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Configuración del encoder Argon2id para almacenamiento seguro de contraseñas.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new Argon2PasswordEncoder(
                16,    // salt length
                32,    // hash length
                1,     // parallelism
                65536, // memory (64MB)
                3      // iterations
        );
    }

    /**
     * Proveedor de autenticación que conecta CustomUserDetailsService con PasswordEncoder.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Gestor de autenticación de Spring Security.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Cadena principal de filtros de seguridad HTTP.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Habilitar CORS con la configuración definida en el Bean corsConfigurationSource
            .cors(Customizer.withDefaults())

            // 2. Deshabilitar CSRF ya que la API es REST y usa tokens JWT sin estado
            .csrf(AbstractHttpConfigurer::disable)

            // 3. Manejo de excepciones de autenticación con respuesta JSON 401
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthEntryPoint)
            )

            // 4. Gestión de sesiones sin estado (STATELESS)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 5. Reglas de autorización por URL y Rol
            .authorizeHttpRequests(auth -> auth
                // Rutas públicas de autenticación (Login)
                .requestMatchers("/api/auth/**").permitAll()

                // Gestión de usuarios: Solo accesible por Administradores
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers("/api/clinica/**", "/api/diagnosticos/**").authenticated()

                // Todas las demás rutas de la API requieren autenticación válida
                .requestMatchers("/api/**").authenticated()

                // Cualquier otra solicitud requiere autenticación
                .anyRequest().authenticated()
            )

            // 6. Proveedor de autenticación
            .authenticationProvider(authenticationProvider())

            // 7. Añadir filtro JWT antes del filtro estándar de usuario y contraseña
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Configuración centralizada de CORS para permitir peticiones desde el Frontend (React).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Convertir la cadena separada por comas en una lista de URLs permitidas
        List<String> originsList = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(originsList);

        // Métodos HTTP permitidos
        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        // Cabeceras permitidas en las peticiones
        configuration.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin")
        );

        // Permitir credenciales / cookies
        configuration.setAllowCredentials(true);

        // Cache de la respuesta preflight de CORS (1 hora)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}