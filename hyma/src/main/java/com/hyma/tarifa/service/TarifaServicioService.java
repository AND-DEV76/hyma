package com.hyma.tarifa.service;

import com.hyma.tarifa.dto.TarifaDTO;
import com.hyma.tarifa.model.TarifaServicio;
import com.hyma.tarifa.repository.TarifaServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TarifaServicioService {

    private final TarifaServicioRepository tarifaRepository;

    @Transactional(readOnly = true)
    public List<TarifaDTO> listarTodas() {
        return tarifaRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TarifaDTO> listarActivas() {
        return tarifaRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public TarifaDTO obtenerPorId(Long id) {
        TarifaServicio t = tarifaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarifa no encontrada con id: " + id));
        return toDTO(t);
    }

    @Transactional(readOnly = true)
    public BigDecimal obtenerPrecioConsultaGeneral() {
        return tarifaRepository.findByNombreIgnoreCase("Consulta General")
                .filter(t -> Boolean.TRUE.equals(t.getActivo()))
                .map(TarifaServicio::getPrecio)
                .orElse(new BigDecimal("50.00"));
    }

    @Transactional
    public TarifaDTO actualizar(Long id, TarifaDTO dto) {
        TarifaServicio t = tarifaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Tarifa no encontrada con id: " + id));

        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            t.setNombre(dto.getNombre().trim());
        }
        if (dto.getPrecio() != null) {
            t.setPrecio(dto.getPrecio());
        }
        if (dto.getActivo() != null) {
            t.setActivo(dto.getActivo());
        }
        t.setFechaActualizacion(LocalDateTime.now());

        return toDTO(tarifaRepository.save(t));
    }

    @Transactional
    public TarifaDTO actualizarPrecioConsultaGeneral(BigDecimal nuevoPrecio) {
        if (nuevoPrecio == null || nuevoPrecio.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio no puede ser nulo ni negativo");
        }

        TarifaServicio t = tarifaRepository.findByNombreIgnoreCase("Consulta General")
                .orElseGet(() -> TarifaServicio.builder()
                        .nombre("Consulta General")
                        .precio(nuevoPrecio)
                        .activo(true)
                        .build());

        t.setPrecio(nuevoPrecio);
        t.setActivo(true);
        t.setFechaActualizacion(LocalDateTime.now());
        return toDTO(tarifaRepository.save(t));
    }

    private TarifaDTO toDTO(TarifaServicio entity) {
        return TarifaDTO.builder()
                .idTarifa(entity.getIdTarifa())
                .nombre(entity.getNombre())
                .precio(entity.getPrecio())
                .activo(entity.getActivo())
                .fechaActualizacion(entity.getFechaActualizacion())
                .build();
    }
}
