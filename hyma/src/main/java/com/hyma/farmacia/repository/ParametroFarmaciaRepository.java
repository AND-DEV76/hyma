package com.hyma.farmacia.repository;

import com.hyma.farmacia.model.ParametroFarmacia;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParametroFarmaciaRepository extends JpaRepository<ParametroFarmacia, Long> {
    List<ParametroFarmacia> findAllByOrderByClaveAsc();
    Optional<ParametroFarmacia> findByClaveIgnoreCase(String clave);
}
