package com.hyma.alergia.service;

import com.hyma.alergia.dto.AlergiaRequestDto;
import com.hyma.alergia.dto.AlergiaResponseDto;

import java.util.List;

public interface AlergiaService {
    List<AlergiaResponseDto> obtenerTodas();
    AlergiaResponseDto obtenerPorId(Long id);
    AlergiaResponseDto crear(AlergiaRequestDto dto);
    AlergiaResponseDto actualizar(Long id, AlergiaRequestDto dto);
    void eliminar(Long id);
}