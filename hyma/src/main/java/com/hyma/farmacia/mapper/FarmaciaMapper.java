package com.hyma.farmacia.mapper;

import com.hyma.farmacia.dto.*;
import com.hyma.farmacia.model.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class FarmaciaMapper {

    public CatalogoFarmaciaResponse toCategoriaResponse(CategoriaMedicamento entity) {
        return CatalogoFarmaciaResponse.builder()
                .id(entity.getIdCategoriaMedicamento())
                .nombre(entity.getNombre())
                .build();
    }

    public CatalogoFarmaciaResponse toCasaResponse(CasaFarmaceutica entity) {
        return CatalogoFarmaciaResponse.builder()
                .id(entity.getIdCasaFarmaceutica())
                .nombre(entity.getNombre())
                .build();
    }

    public MedicamentoResponse toMedicamentoResponse(Medicamento entity) {
        return MedicamentoResponse.builder()
                .idMedicamento(entity.getIdMedicamento())
                .idCategoriaMedicamento(entity.getCategoria() == null ? null : entity.getCategoria().getIdCategoriaMedicamento())
                .categoriaNombre(entity.getCategoria() == null ? null : entity.getCategoria().getNombre())
                .idCasaFarmaceutica(entity.getCasaFarmaceutica() == null ? null : entity.getCasaFarmaceutica().getIdCasaFarmaceutica())
                .casaFarmaceuticaNombre(entity.getCasaFarmaceutica() == null ? null : entity.getCasaFarmaceutica().getNombre())
                .nombre(entity.getNombre())
                .presentacion(entity.getPresentacion())
                .concentracion(entity.getConcentracion())
                .estado(entity.getEstado())
                .build();
    }

    public LoteResponse toLoteResponse(LoteMedicamento entity) {
        Medicamento medicamento = entity.getMedicamento();
        return LoteResponse.builder()
                .idLote(entity.getIdLote())
                .idMedicamento(medicamento.getIdMedicamento())
                .medicamentoNombre(medicamento.getNombre())
                .presentacion(medicamento.getPresentacion())
                .numeroLote(entity.getNumeroLote())
                .fechaExpiracion(entity.getFechaExpiracion())
                .precioUnitario(entity.getPrecioUnitario())
                .cantidadInicial(entity.getCantidadInicial())
                .stockDisponible(entity.getCantidadInicial())
                .estado(entity.getEstado() == null ? null : entity.getEstado().name())
                .build();
    }

    public EntradaResponse toEntradaResponse(EntradaMedicamento entity) {
        List<EntradaDetalleResponse> detalles = entity.getDetalles().stream()
                .map(this::toDetalleResponse)
                .toList();

        return EntradaResponse.builder()
                .idEntrada(entity.getIdEntrada())
                .idUsuario(entity.getUsuario() == null ? null : entity.getUsuario().getIdUsuario())
                .usuarioNombre(entity.getUsuario() == null ? null : entity.getUsuario().getUsername())
                .fechaEntrada(entity.getFechaEntrada())
                .tipoEntrada(entity.getTipoEntrada())
                .observaciones(entity.getObservaciones())
                .detalles(detalles)
                .build();
    }

    public EntradaDetalleResponse toDetalleResponse(DetalleEntradaMedicamento entity) {
        LoteMedicamento lote = entity.getLote();
        return EntradaDetalleResponse.builder()
                .idDetalleEntrada(entity.getIdDetalleEntrada())
                .idLote(lote.getIdLote())
                .idMedicamento(lote.getMedicamento().getIdMedicamento())
                .medicamentoNombre(lote.getMedicamento().getNombre())
                .numeroLote(lote.getNumeroLote())
                .fechaExpiracion(lote.getFechaExpiracion())
                .cantidad(entity.getCantidad())
                .precioUnitario(entity.getPrecioUnitario())
                .build();
    }

    public ParametroFarmaciaResponse toParametroResponse(ParametroFarmacia entity) {
        return ParametroFarmaciaResponse.builder()
                .idParametro(entity.getIdParametro())
                .clave(entity.getClave())
                .valor(entity.getValor())
                .descripcion(entity.getDescripcion())
                .build();
    }
}
