package com.hyma.alergia.mapper;

import com.hyma.alergia.dto.AlergiaRequestDto;
import com.hyma.alergia.dto.AlergiaResponseDto;
import com.hyma.alergia.model.Alergia;
import org.springframework.stereotype.Component;

@Component
public class AlergiaMapper {

    public Alergia toEntity(AlergiaRequestDto dto) {
        if (dto == null) return null;
        return Alergia.builder()
                .nombre(dto.getNombre().trim())
                .build();
    }

    public AlergiaResponseDto toDto(Alergia entity) {
        if (entity == null) return null;
        return AlergiaResponseDto.builder()
                .idAlergia(entity.getIdAlergia())
                .nombre(entity.getNombre())
                .build();
    }
}