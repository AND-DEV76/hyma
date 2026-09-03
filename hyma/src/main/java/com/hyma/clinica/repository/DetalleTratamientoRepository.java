package com.hyma.clinica.repository;

import com.hyma.clinica.model.DetalleTratamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DetalleTratamientoRepository extends JpaRepository<DetalleTratamiento, Long> {
}

