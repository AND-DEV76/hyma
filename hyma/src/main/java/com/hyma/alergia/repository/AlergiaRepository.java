package com.hyma.alergia.repository;

import com.hyma.alergia.model.Alergia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface AlergiaRepository extends JpaRepository<Alergia, Long> {
    
    boolean existsByNombreIgnoreCase(String nombre);
    
    boolean existsByNombreIgnoreCaseAndIdAlergiaNot(String nombre, Long idAlergia);

    
    
}