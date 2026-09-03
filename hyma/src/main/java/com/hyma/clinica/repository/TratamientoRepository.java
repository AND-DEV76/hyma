package com.hyma.clinica.repository;

import com.hyma.clinica.model.Tratamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TratamientoRepository extends JpaRepository<Tratamiento, Long> {
    @Query("SELECT t FROM Tratamiento t LEFT JOIN FETCH t.detalles d LEFT JOIN FETCH d.medicamento WHERE t.consulta.idConsulta = :idConsulta")
    Optional<Tratamiento> findByConsultaIdWithDetalles(@Param("idConsulta") Long idConsulta);
}

