package com.hyma.usuario.repository;
import com.hyma.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    boolean existsByUsername(String username);
    boolean existsByUsernameAndIdUsuarioNot(String username, Long idUsuario);

    // Método necesario para la autenticación
    Optional<Usuario> findByUsername(String username);
}