package com.hyma.farmacia.service;

import com.hyma.farmacia.dto.*;
import com.hyma.farmacia.mapper.FarmaciaMapper;
import com.hyma.farmacia.model.*;
import com.hyma.farmacia.repository.*;
import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FarmaciaService {

    private final CategoriaMedicamentoRepository categoriaRepository;
    private final CasaFarmaceuticaRepository casaRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final LoteMedicamentoRepository loteRepository;
    private final EntradaMedicamentoRepository entradaRepository;
    private final ParametroFarmaciaRepository parametroRepository;
    private final UsuarioRepository usuarioRepository;
    private final FarmaciaMapper mapper;

    @Transactional(readOnly = true)
    public List<CatalogoFarmaciaResponse> listarCategorias() {
        return categoriaRepository.findAllByOrderByNombreAsc().stream()
                .map(mapper::toCategoriaResponse)
                .toList();
    }

    @Transactional
    public CatalogoFarmaciaResponse crearCategoria(CatalogoFarmaciaRequest request) {
        String nombre = normalizar(request.getNombre());
        validarNombreCategoria(nombre, null);
        return mapper.toCategoriaResponse(categoriaRepository.save(
                CategoriaMedicamento.builder().nombre(nombre).build()
        ));
    }

    @Transactional
    public CatalogoFarmaciaResponse actualizarCategoria(Long id, CatalogoFarmaciaRequest request) {
        CategoriaMedicamento entity = categoriaRepository.findById(id)
                .orElseThrow(() -> new FarmaciaNotFoundException("Categoría no encontrada"));
        String nombre = normalizar(request.getNombre());
        validarNombreCategoria(nombre, id);
        entity.setNombre(nombre);
        return mapper.toCategoriaResponse(entity);
    }

    @Transactional
    public void eliminarCategoria(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new FarmaciaNotFoundException("Categoría no encontrada");
        }
        if (medicamentoRepository.existsByCategoria_IdCategoriaMedicamento(id)) {
            throw new IllegalArgumentException("No se puede eliminar la categoría porque ya está asociada a uno o más medicamentos registrados.");
        }
        categoriaRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<CatalogoFarmaciaResponse> listarCasas() {
        return casaRepository.findAllByOrderByNombreAsc().stream()
                .map(mapper::toCasaResponse)
                .toList();
    }

    @Transactional
    public CatalogoFarmaciaResponse crearCasa(CatalogoFarmaciaRequest request) {
        String nombre = normalizar(request.getNombre());
        validarNombreCasa(nombre, null);
        return mapper.toCasaResponse(casaRepository.save(
                CasaFarmaceutica.builder().nombre(nombre).build()
        ));
    }

    @Transactional
    public CatalogoFarmaciaResponse actualizarCasa(Long id, CatalogoFarmaciaRequest request) {
        CasaFarmaceutica entity = casaRepository.findById(id)
                .orElseThrow(() -> new FarmaciaNotFoundException("Casa farmacéutica no encontrada"));
        String nombre = normalizar(request.getNombre());
        validarNombreCasa(nombre, id);
        entity.setNombre(nombre);
        return mapper.toCasaResponse(entity);
    }

    @Transactional
    public void eliminarCasa(Long id) {
        if (!casaRepository.existsById(id)) {
            throw new FarmaciaNotFoundException("Casa farmacéutica no encontrada");
        }
        if (medicamentoRepository.existsByCasaFarmaceutica_IdCasaFarmaceutica(id)) {
            throw new IllegalArgumentException("No se puede eliminar la casa farmacéutica porque ya está asociada a uno o más medicamentos registrados.");
        }
        casaRepository.deleteById(id);
    }

    @Transactional
    public void eliminarMedicamento(Long id) {
        if (!medicamentoRepository.existsById(id)) {
            throw new FarmaciaNotFoundException("Medicamento no encontrado");
        }
        if (loteRepository.existsByMedicamento_IdMedicamento(id)) {
            throw new IllegalArgumentException("No se puede eliminar el medicamento porque ya cuenta con lotes o movimientos en el inventario. Puedes desactivarlo en su lugar.");
        }
        medicamentoRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<MedicamentoResponse> listarMedicamentos(Long categoriaId, Long casaId, Boolean estado, String buscar) {
        String filtro = buscar == null || buscar.isBlank() ? "" : buscar.trim();
        return medicamentoRepository.buscar(categoriaId, casaId, estado, filtro).stream()
                .map(mapper::toMedicamentoResponse)
                .toList();
    }

    @Transactional
    public MedicamentoResponse crearMedicamento(MedicamentoRequest request) {
        Medicamento entity = construirMedicamento(request);
        return mapper.toMedicamentoResponse(medicamentoRepository.save(entity));
    }

    @Transactional
    public MedicamentoResponse actualizarMedicamento(Long id, MedicamentoRequest request) {
        Medicamento entity = medicamentoRepository.findById(id)
                .orElseThrow(() -> new FarmaciaNotFoundException("Medicamento no encontrado"));
        aplicarMedicamento(entity, request);
        return mapper.toMedicamentoResponse(entity);
    }

    private Medicamento construirMedicamento(MedicamentoRequest request) {
        Medicamento entity = new Medicamento();
        aplicarMedicamento(entity, request);
        return entity;
    }

    private void aplicarMedicamento(Medicamento entity, MedicamentoRequest request) {
        entity.setCategoria(request.getIdCategoriaMedicamento() == null ? null :
                categoriaRepository.findById(request.getIdCategoriaMedicamento())
                        .orElseThrow(() -> new FarmaciaNotFoundException("Categoría no encontrada")));
        entity.setCasaFarmaceutica(request.getIdCasaFarmaceutica() == null ? null :
                casaRepository.findById(request.getIdCasaFarmaceutica())
                        .orElseThrow(() -> new FarmaciaNotFoundException("Casa farmacéutica no encontrada")));
        entity.setNombre(normalizar(request.getNombre()));
        entity.setPresentacion(limpiar(request.getPresentacion()));
        entity.setConcentracion(limpiar(request.getConcentracion()));
        entity.setEstado(request.getEstado() == null || request.getEstado());
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> listarLotes(EstadoLote estado, Long medicamentoId, LocalDate hasta) {
        return loteRepository.buscar(estado, medicamentoId, hasta).stream()
                .map(mapper::toLoteResponse)
                .toList();
    }

    @Transactional
    public EntradaResponse registrarEntrada(EntradaRequest request, String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new FarmaciaNotFoundException("Usuario de la entrada no encontrado"));

        EntradaMedicamento entrada = EntradaMedicamento.builder()
                .usuario(usuario)
                .fechaEntrada(LocalDateTime.now())
                .tipoEntrada(request.getTipoEntrada())
                .observaciones(limpiar(request.getObservaciones()))
                .build();

        for (EntradaDetalleRequest detalleRequest : request.getDetalles()) {
            if (detalleRequest.getCantidad() == null || detalleRequest.getCantidad() < 1) {
                throw new IllegalArgumentException("La cantidad de cada detalle debe ser mayor que cero");
            }

            Medicamento medicamento = medicamentoRepository.findById(detalleRequest.getIdMedicamento())
                    .orElseThrow(() -> new FarmaciaNotFoundException("Medicamento no encontrado"));

            String numeroLote = limpiar(detalleRequest.getNumeroLote());
            LoteMedicamento lote = buscarLoteExistente(medicamento.getIdMedicamento(), numeroLote);

            if (lote == null) {
                lote = LoteMedicamento.builder()
                        .medicamento(medicamento)
                        .numeroLote(numeroLote)
                        .fechaExpiracion(detalleRequest.getFechaExpiracion())
                        .precioUnitario(detalleRequest.getPrecioUnitario())
                        .cantidadInicial(detalleRequest.getCantidad())
                        .estado(EstadoLote.ACTIVO)
                        .build();
            } else {
                lote.setFechaExpiracion(detalleRequest.getFechaExpiracion());
                if (detalleRequest.getPrecioUnitario() != null) {
                    lote.setPrecioUnitario(detalleRequest.getPrecioUnitario());
                }
                lote.setCantidadInicial((lote.getCantidadInicial() == null ? 0 : lote.getCantidadInicial())
                        + detalleRequest.getCantidad());
                lote.setEstado(EstadoLote.ACTIVO);
            }

            LoteMedicamento loteGuardado = loteRepository.save(lote);
            DetalleEntradaMedicamento detalle = DetalleEntradaMedicamento.builder()
                    .entrada(entrada)
                    .lote(loteGuardado)
                    .cantidad(detalleRequest.getCantidad())
                    .precioUnitario(detalleRequest.getPrecioUnitario() == null
                            ? loteGuardado.getPrecioUnitario()
                            : detalleRequest.getPrecioUnitario())
                    .build();
            entrada.getDetalles().add(detalle);
        }

        return mapper.toEntradaResponse(entradaRepository.save(entrada));
    }

    private LoteMedicamento buscarLoteExistente(Long idMedicamento, String numeroLote) {
        if (numeroLote == null) {
            return null;
        }
        return loteRepository.findByMedicamento_IdMedicamentoAndNumeroLote(idMedicamento, numeroLote)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<EntradaResponse> listarEntradas(LocalDate desde, LocalDate hasta) {
        List<EntradaMedicamento> entradas;
        if (desde == null && hasta == null) {
            entradas = entradaRepository.buscarTodas();
        } else {
            LocalDate fechaDesde = desde == null ? LocalDate.of(1970, 1, 1) : desde;
            LocalDate fechaHasta = hasta == null ? LocalDate.now().plusDays(1) : hasta.plusDays(1);
            entradas = entradaRepository.buscarPorRango(
                    fechaDesde.atStartOfDay(), fechaHasta.atStartOfDay()
            );
        }

        return entradas.stream()
                .map(mapper::toEntradaResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DashboardFarmaciaResponse obtenerDashboard() {
        LocalDate hoy = LocalDate.now();
        long lotes30 = loteRepository.countByEstadoAndFechaExpiracionBetween(
                EstadoLote.ACTIVO, hoy, hoy.plusDays(30));
        long lotes60 = loteRepository.countByEstadoAndFechaExpiracionBetween(
                EstadoLote.ACTIVO, hoy, hoy.plusDays(60));
        long lotes90 = loteRepository.countByEstadoAndFechaExpiracionBetween(
                EstadoLote.ACTIVO, hoy, hoy.plusDays(90));
        YearMonth mesActual = YearMonth.now();
        long entradasMes = entradaRepository.countByFechaEntradaBetween(
                mesActual.atDay(1).atStartOfDay(),
                mesActual.plusMonths(1).atDay(1).atStartOfDay());
        long stock = loteRepository.buscar(EstadoLote.ACTIVO, null, null).stream()
                .mapToLong(lote -> lote.getCantidadInicial() == null ? 0 : lote.getCantidadInicial())
                .sum();

        return DashboardFarmaciaResponse.builder()
                .lotesPorVencer30Dias(lotes30)
                .lotesPorVencer60Dias(lotes60)
                .lotesPorVencer90Dias(lotes90)
                .totalMedicamentos(medicamentoRepository.count())
                .entradasDelMes(entradasMes)
                .stockTotal(stock)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ParametroFarmaciaResponse> listarParametros() {
        return parametroRepository.findAllByOrderByClaveAsc().stream()
                .map(mapper::toParametroResponse)
                .toList();
    }

    @Transactional
    public ParametroFarmaciaResponse actualizarParametro(String clave, ParametroFarmaciaRequest request) {
        String claveNormalizada = normalizar(clave);
        ParametroFarmacia parametro = parametroRepository.findByClaveIgnoreCase(claveNormalizada)
                .orElseGet(() -> ParametroFarmacia.builder().clave(claveNormalizada).build());
        parametro.setValor(normalizar(request.getValor()));
        parametro.setDescripcion(limpiar(request.getDescripcion()));
        return mapper.toParametroResponse(parametroRepository.save(parametro));
    }

    private void validarNombreCategoria(String nombre, Long id) {
        boolean existe = id == null
                ? categoriaRepository.existsByNombreIgnoreCase(nombre)
                : categoriaRepository.existsByNombreIgnoreCaseAndIdCategoriaMedicamentoNot(nombre, id);
        if (existe) {
            throw new IllegalArgumentException("Ya existe una categoría con ese nombre");
        }
    }

    private void validarNombreCasa(String nombre, Long id) {
        boolean existe = id == null
                ? casaRepository.existsByNombreIgnoreCase(nombre)
                : casaRepository.existsByNombreIgnoreCaseAndIdCasaFarmaceuticaNot(nombre, id);
        if (existe) {
            throw new IllegalArgumentException("Ya existe una casa farmacéutica con ese nombre");
        }
    }

    private String normalizar(String value) {
        String result = value == null ? "" : value.trim();
        return result;
    }

    private String limpiar(String value) {
        String result = value == null ? null : value.trim();
        return result == null || result.isBlank() ? null : result;
    }
}
