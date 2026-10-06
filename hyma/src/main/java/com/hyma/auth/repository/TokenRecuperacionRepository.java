package com.hyma.auth.repository;

import com.hyma.auth.model.TokenRecuperacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Long> {

    Optional<TokenRecuperacion> findTopByIdUsuarioAndCodigoAndUsadoFalseOrderByFechaCreacionDesc(Long idUsuario, String codigo);

    List<TokenRecuperacion> findByIdUsuarioAndUsadoFalse(Long idUsuario);

    void deleteByFechaExpiracionBefore(LocalDateTime date);
}
