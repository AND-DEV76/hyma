package com.hyma.doctor.service;
import com.hyma.doctor.dto.MedicoRequestDTO;
import com.hyma.doctor.dto.MedicoResponseDTO;

import java.util.List;

public interface MedicoService {
    List<MedicoResponseDTO> obtenerTodos();
    MedicoResponseDTO obtenerPorId(Long id);
    MedicoResponseDTO crear(MedicoRequestDTO requestDTO);
    MedicoResponseDTO actualizar(Long id, MedicoRequestDTO requestDTO);
    void eliminar(Long id);
}