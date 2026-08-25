package com.hyma.alergia.service;

import com.hyma.alergia.dto.AlergiaRequestDto;
import com.hyma.alergia.dto.AlergiaResponseDto;
import com.hyma.alergia.mapper.AlergiaMapper;
import com.hyma.alergia.model.Alergia;
import com.hyma.alergia.repository.AlergiaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlergiaServiceImpl implements AlergiaService {

    private final AlergiaRepository alergiaRepository;
    private final AlergiaMapper alergiaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AlergiaResponseDto> obtenerTodas() {
        return alergiaRepository.findAll().stream()
                .map(alergiaMapper::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AlergiaResponseDto obtenerPorId(Long id) {
        Alergia alergia = alergiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alergia no encontrada con el ID: " + id));
        return alergiaMapper.toDto(alergia);
    }

    @Override
    @Transactional
    public AlergiaResponseDto crear(AlergiaRequestDto dto) {
        if (alergiaRepository.existsByNombreIgnoreCase(dto.getNombre().trim())) {
            throw new RuntimeException("Ya existe una alergia con el nombre: " + dto.getNombre());
        }

        Alergia nuevaAlergia = alergiaMapper.toEntity(dto);
        Alergia guardada = alergiaRepository.save(nuevaAlergia);
        return alergiaMapper.toDto(guardada);
    }

    @Override
    @Transactional
    public AlergiaResponseDto actualizar(Long id, AlergiaRequestDto dto) {
        Alergia alergiaExistente = alergiaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alergia no encontrada con el ID: " + id));

        if (alergiaRepository.existsByNombreIgnoreCaseAndIdAlergiaNot(dto.getNombre().trim(), id)) {
            throw new RuntimeException("Ya existe otra alergia registrada con el nombre: " + dto.getNombre());
        }

        alergiaExistente.setNombre(dto.getNombre().trim());
        Alergia actualizada = alergiaRepository.save(alergiaExistente);
        return alergiaMapper.toDto(actualizada);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!alergiaRepository.existsById(id)) {
            throw new RuntimeException("Alergia no encontrada con el ID: " + id);
        }
        alergiaRepository.deleteById(id);
    }
}