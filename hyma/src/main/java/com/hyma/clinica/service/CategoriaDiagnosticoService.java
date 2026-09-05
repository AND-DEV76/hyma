package com.hyma.clinica.service;

import com.hyma.clinica.dto.CategoriaDiagnosticoRequest;
import com.hyma.clinica.dto.CategoriaDiagnosticoResponse;
import com.hyma.clinica.mapper.ClinicaMapper;
import com.hyma.clinica.model.CategoriaDiagnostico;
import com.hyma.clinica.repository.CatalogoCie10Repository;
import com.hyma.clinica.repository.CategoriaDiagnosticoRepository;
import com.hyma.clinica.repository.DiagnosticoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaDiagnosticoService {

    private final CategoriaDiagnosticoRepository categoriaRepository;
    private final CatalogoCie10Repository catalogoCie10Repository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final ClinicaMapper clinicaMapper;

    @Transactional(readOnly = true)
    public List<CategoriaDiagnosticoResponse> listar() {
        return categoriaRepository.findAllByOrderByNombreAsc().stream()
                .map(cat -> {
                    long total = catalogoCie10Repository.countByCategoria_IdCategoria(cat.getIdCategoria());
                    return clinicaMapper.toCategoriaResponse(cat, total);
                })
                .toList();
    }

    @Transactional
    public CategoriaDiagnosticoResponse crear(CategoriaDiagnosticoRequest request) {
        String nombreLimpio = request.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombreLimpio)) {
            throw new IllegalArgumentException("Ya existe una categoría con el nombre: " + nombreLimpio);
        }

        CategoriaDiagnostico entity = CategoriaDiagnostico.builder()
                .nombre(nombreLimpio)
                .descripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null)
                .build();

        CategoriaDiagnostico guardada = categoriaRepository.save(entity);
        return clinicaMapper.toCategoriaResponse(guardada, 0L);
    }

    @Transactional
    public CategoriaDiagnosticoResponse actualizar(Long id, CategoriaDiagnosticoRequest request) {
        CategoriaDiagnostico entity = categoriaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));

        String nombreLimpio = request.getNombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdCategoriaNot(nombreLimpio, id)) {
            throw new IllegalArgumentException("Ya existe otra categoría con el nombre: " + nombreLimpio);
        }

        entity.setNombre(nombreLimpio);
        entity.setDescripcion(request.getDescripcion() != null ? request.getDescripcion().trim() : null);

        long total = catalogoCie10Repository.countByCategoria_IdCategoria(id);
        return clinicaMapper.toCategoriaResponse(entity, total);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new IllegalArgumentException("Categoría no encontrada");
        }

        if (catalogoCie10Repository.existsByCategoria_IdCategoria(id) ||
            diagnosticoRepository.existsByCategoria_IdCategoria(id)) {
            throw new IllegalArgumentException("No se puede eliminar la categoría porque ya tiene diagnósticos asociados.");
        }

        categoriaRepository.deleteById(id);
    }
}

