package com.hyma.clinica.service;

import com.hyma.clinica.dto.CatalogoCie10Request;
import com.hyma.clinica.dto.CatalogoCie10Response;
import com.hyma.clinica.mapper.ClinicaMapper;
import com.hyma.clinica.model.CatalogoCie10;
import com.hyma.clinica.repository.CatalogoCie10Repository;
import com.hyma.exception.CatalogoCie10NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CatalogoCie10Service {

    private final CatalogoCie10Repository catalogoCie10Repository;
    private final ClinicaMapper clinicaMapper;

    @Transactional(readOnly = true)
    public Page<CatalogoCie10Response> buscar(String query, Pageable pageable) {
        String safeQuery = (query == null) ? "" : query;
        return catalogoCie10Repository.buscar(safeQuery, pageable)
                .map(clinicaMapper::toCie10Response);
    }

    @Transactional
    public CatalogoCie10Response crear(CatalogoCie10Request request) {
        if (catalogoCie10Repository.existsByCodigo(request.getCodigo())) {
            throw new IllegalArgumentException("El código CIE-10 ya existe");
        }
        CatalogoCie10 entity = CatalogoCie10.builder()
                .codigo(request.getCodigo())
                .descripcion(request.getDescripcion())
                .build();
        return clinicaMapper.toCie10Response(catalogoCie10Repository.save(entity));
    }

    @Transactional
    public CatalogoCie10Response actualizar(Long id, CatalogoCie10Request request) {
        CatalogoCie10 entity = catalogoCie10Repository.findById(id)
                .orElseThrow(() -> new CatalogoCie10NotFoundException("Catálogo CIE-10 no encontrado"));
        
        if (catalogoCie10Repository.existsByCodigoAndIdCie10Not(request.getCodigo(), id)) {
            throw new IllegalArgumentException("El código CIE-10 ya está en uso por otro registro");
        }
        
        entity.setCodigo(request.getCodigo());
        entity.setDescripcion(request.getDescripcion());
        return clinicaMapper.toCie10Response(entity);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!catalogoCie10Repository.existsById(id)) {
            throw new CatalogoCie10NotFoundException("Catálogo CIE-10 no encontrado");
        }
        catalogoCie10Repository.deleteById(id);
    }
}
