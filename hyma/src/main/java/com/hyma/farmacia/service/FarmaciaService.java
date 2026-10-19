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

import com.hyma.recepcion.model.ColaAtencion;
import com.hyma.recepcion.model.EstadoCola;
import com.hyma.recepcion.model.Paciente;
import com.hyma.recepcion.repository.ColaAtencionRepository;
import com.hyma.recepcion.repository.PacienteRepository;
import com.hyma.recepcion.mapper.ColaAtencionMapper;
import com.hyma.recepcion.dto.ColaAtencionResponse;
import com.hyma.consulta.model.Consulta;
import com.hyma.consulta.repository.ConsultaRepository;
import com.hyma.clinica.model.Tratamiento;
import com.hyma.clinica.model.DetalleTratamiento;
import com.hyma.clinica.repository.TratamientoRepository;
import com.hyma.tarifa.service.TarifaServicioService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

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

    private final ColaAtencionRepository colaAtencionRepository;
    private final ColaAtencionMapper colaAtencionMapper;
    private final ConsultaRepository consultaRepository;
    private final TratamientoRepository tratamientoRepository;
    private final PacienteRepository pacienteRepository;
    private final SalidaMedicamentoRepository salidaMedicamentoRepository;
    private final DetalleSalidaMedicamentoRepository detalleSalidaMedicamentoRepository;
    private final TarifaServicioService tarifaServicioService;
    private final com.hyma.procedimiento.repository.ConsultaProcedimientoRepository consultaProcedimientoRepository;
    private final com.hyma.procedimiento.repository.ProcedimientoRepository procedimientoRepository;
    private final com.hyma.procedimiento.service.ProcedimientoService procedimientoService;

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
        List<Medicamento> medicamentos = medicamentoRepository.buscar(categoriaId, casaId, estado, filtro);
        List<LoteMedicamento> todosLotes = loteRepository.findAll().stream()
                .filter(l -> l.getIdLote() != null)
                .sorted(Comparator.comparing(LoteMedicamento::getIdLote))
                .toList();
        java.util.Map<Long, List<LoteMedicamento>> lotesPorMed = todosLotes.stream()
                .filter(l -> l.getMedicamento() != null && l.getMedicamento().getIdMedicamento() != null)
                .collect(java.util.stream.Collectors.groupingBy(l -> l.getMedicamento().getIdMedicamento()));

        return medicamentos.stream()
                .map(med -> {
                    MedicamentoResponse resp = mapper.toMedicamentoResponse(med);
                    List<LoteMedicamento> lotes = lotesPorMed.getOrDefault(med.getIdMedicamento(), List.of());
                    int totalUnidades = lotes.stream()
                            .filter(l -> l.getEstado() == EstadoLote.ACTIVO)
                            .mapToInt(l -> l.getCantidadInicial() != null ? l.getCantidadInicial() : 0)
                            .sum();
                    java.math.BigDecimal ultimoPrecio = lotes.stream()
                            .filter(l -> l.getPrecioVenta() != null || l.getPrecioUnitario() != null)
                            .reduce((first, second) -> second)
                            .map(l -> l.getPrecioVenta() != null ? l.getPrecioVenta() : l.getPrecioUnitario())
                            .orElse(null);
                    LocalDate proximoVenc = lotes.stream()
                            .filter(l -> l.getEstado() == EstadoLote.ACTIVO && l.getFechaExpiracion() != null)
                            .map(LoteMedicamento::getFechaExpiracion)
                            .min(LocalDate::compareTo)
                            .orElse(null);

                    resp.setUnidades(totalUnidades);
                    resp.setPrecio(ultimoPrecio);
                    resp.setProximoVencimiento(proximoVenc);
                    return resp;
                })
                .toList();
    }

    @Transactional
    public MedicamentoResponse crearMedicamento(MedicamentoRequest request) {
        Medicamento entity = construirMedicamento(request);
        MedicamentoResponse resp = mapper.toMedicamentoResponse(medicamentoRepository.save(entity));
        resp.setUnidades(0);
        return resp;
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
        entity.setEsUsoClinica(request.getEsUsoClinica() != null && request.getEsUsoClinica());
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

        // Mapa en memoria para reutilizar o crear lotes dentro de la misma transacción/entrada
        Map<String, LoteMedicamento> lotesEnProceso = new HashMap<>();

        for (EntradaDetalleRequest detalleRequest : request.getDetalles()) {
            if (detalleRequest.getCantidad() == null || detalleRequest.getCantidad() < 1) {
                throw new IllegalArgumentException("La cantidad de cada detalle debe ser mayor que cero");
            }

            Medicamento medicamento = medicamentoRepository.findById(detalleRequest.getIdMedicamento())
                    .orElseThrow(() -> new FarmaciaNotFoundException("Medicamento no encontrado"));

            String numeroLote = limpiar(detalleRequest.getNumeroLote());
            LocalDate fechaExpiracion = detalleRequest.getFechaExpiracion();
            BigDecimal precioUnitario = detalleRequest.getPrecioUnitario();
            BigDecimal precioVenta = detalleRequest.getPrecioVenta();
            if (precioVenta == null && precioUnitario != null) {
                precioVenta = calcularPrecioVenta(precioUnitario, obtenerPorcentajeMedicamento());
            }

            // Clave única basada en medicamento, número de lote, fecha de vencimiento y costo unitario
            String claveLote = generarClaveLote(medicamento.getIdMedicamento(), numeroLote, fechaExpiracion, precioUnitario);
            LoteMedicamento lote = lotesEnProceso.get(claveLote);

            if (lote == null) {
                lote = buscarLoteCoincidente(medicamento.getIdMedicamento(), numeroLote, fechaExpiracion, precioUnitario);
            }

            if (lote == null) {
                // Casos 2, 3 y 4 (o lote nuevo): Cualquier diferencia en lote, vencimiento o precio genera un NUEVO lote (id_lote nuevo)
                lote = LoteMedicamento.builder()
                        .medicamento(medicamento)
                        .numeroLote(numeroLote)
                        .fechaExpiracion(fechaExpiracion)
                        .precioUnitario(precioUnitario)
                        .precioVenta(precioVenta)
                        .cantidadInicial(detalleRequest.getCantidad())
                        .estado(EstadoLote.ACTIVO)
                        .build();
            } else {
                // Caso 1: Mismo medicamento, mismo número de lote, mismo vencimiento y mismo costo unitario -> acumular cantidad en el mismo id_lote
                int cantidadActual = lote.getCantidadInicial() == null ? 0 : lote.getCantidadInicial();
                lote.setCantidadInicial(cantidadActual + detalleRequest.getCantidad());
                if (precioVenta != null) {
                    lote.setPrecioVenta(precioVenta);
                } else if (lote.getPrecioVenta() == null && precioUnitario != null) {
                    lote.setPrecioVenta(calcularPrecioVenta(precioUnitario, obtenerPorcentajeMedicamento()));
                }
                lote.setEstado(EstadoLote.ACTIVO);
            }

            LoteMedicamento loteGuardado = loteRepository.save(lote);
            lotesEnProceso.put(claveLote, loteGuardado);

            DetalleEntradaMedicamento detalle = DetalleEntradaMedicamento.builder()
                    .entrada(entrada)
                    .lote(loteGuardado)
                    .cantidad(detalleRequest.getCantidad())
                    .precioUnitario(detalleRequest.getPrecioUnitario() == null
                            ? loteGuardado.getPrecioUnitario()
                            : detalleRequest.getPrecioUnitario())
                    .precioVenta(precioVenta != null ? precioVenta : loteGuardado.getPrecioVenta())
                    .build();
            entrada.getDetalles().add(detalle);
        }

        return mapper.toEntradaResponse(entradaRepository.save(entrada));
    }

    private String generarClaveLote(Long idMedicamento, String numeroLote, LocalDate fechaExpiracion, BigDecimal precioUnitario) {
        String idMed = String.valueOf(idMedicamento);
        String loteStr = numeroLote == null ? "" : numeroLote.trim().toUpperCase();
        String fechaStr = fechaExpiracion == null ? "" : fechaExpiracion.toString();
        String precioStr = precioUnitario == null ? "NULL" : precioUnitario.stripTrailingZeros().toPlainString();
        return idMed + "#" + loteStr + "#" + fechaStr + "#" + precioStr;
    }

    private LoteMedicamento buscarLoteCoincidente(
            Long idMedicamento,
            String numeroLote,
            LocalDate fechaExpiracion,
            BigDecimal precioUnitario
    ) {
        if (idMedicamento == null || fechaExpiracion == null) {
            return null;
        }
        List<LoteMedicamento> lotes = loteRepository.findByMedicamento_IdMedicamento(idMedicamento);
        for (LoteMedicamento lote : lotes) {
            boolean mismoLote = sonTextosIguales(lote.getNumeroLote(), numeroLote);
            boolean mismaFecha = fechaExpiracion.equals(lote.getFechaExpiracion());
            boolean mismoPrecio = sonPreciosIguales(lote.getPrecioUnitario(), precioUnitario);

            if (mismoLote && mismaFecha && mismoPrecio) {
                return lote;
            }
        }
        return null;
    }

    private boolean sonTextosIguales(String t1, String t2) {
        String s1 = limpiar(t1);
        String s2 = limpiar(t2);
        if (s1 == null && s2 == null) {
            return true;
        }
        if (s1 == null || s2 == null) {
            return false;
        }
        return s1.equalsIgnoreCase(s2);
    }

    private boolean sonPreciosIguales(BigDecimal p1, BigDecimal p2) {
        if (p1 == null && p2 == null) {
            return true;
        }
        if (p1 == null || p2 == null) {
            return false;
        }
        return p1.compareTo(p2) == 0;
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

    @Transactional(readOnly = true)
    public BigDecimal obtenerPorcentajeMedicamento() {
        return parametroRepository.findByClaveIgnoreCase("PORCENTAJE_MEDICAMENTO")
                .map(p -> {
                    try {
                        return new BigDecimal(p.getValor().trim());
                    } catch (Exception e) {
                        return BigDecimal.valueOf(25.00);
                    }
                })
                .orElse(BigDecimal.valueOf(25.00));
    }

    @Transactional
    public BigDecimal actualizarPorcentajeMedicamento(BigDecimal porcentaje) {
        if (porcentaje == null || porcentaje.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El porcentaje no puede ser negativo");
        }
        BigDecimal rounded = porcentaje.setScale(2, RoundingMode.HALF_UP);
        ParametroFarmacia param = parametroRepository.findByClaveIgnoreCase("PORCENTAJE_MEDICAMENTO")
                .orElseGet(() -> ParametroFarmacia.builder()
                        .clave("PORCENTAJE_MEDICAMENTO")
                        .descripcion("Porcentaje de incremento sobre el costo unitario para precio final de venta")
                        .build());
        param.setValor(rounded.stripTrailingZeros().toPlainString());
        parametroRepository.save(param);

        // Recalcular el precio de venta en todos los lotes existentes que tengan costo unitario
        List<LoteMedicamento> todosLotes = loteRepository.findAll();
        for (LoteMedicamento l : todosLotes) {
            if (l.getPrecioUnitario() != null) {
                l.setPrecioVenta(calcularPrecioVenta(l.getPrecioUnitario(), rounded));
            }
        }
        loteRepository.saveAll(todosLotes);

        return rounded;
    }

    public BigDecimal calcularPrecioVenta(BigDecimal costoUnitario, BigDecimal porcentaje) {
        if (costoUnitario == null) return null;
        if (porcentaje == null || porcentaje.compareTo(BigDecimal.ZERO) <= 0) {
            return costoUnitario.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal factor = BigDecimal.ONE.add(porcentaje.divide(BigDecimal.valueOf(100), 6, RoundingMode.HALF_UP));
        return costoUnitario.multiply(factor).setScale(2, RoundingMode.HALF_UP);
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

    // ==========================================
    // DISPENSACIÓN DE MEDICAMENTOS
    // ==========================================

    @Transactional(readOnly = true)
    public List<ColaAtencionResponse> obtenerColaDispensacion() {
        return colaAtencionRepository.findByEstadoOrdenadoPorSalida(EstadoCola.EN_FARMACIA).stream()
                .map(colaAtencionMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RecetaDispensacionResponse obtenerRecetaDispensacion(Long idCola, Long idPaciente) {
        ColaAtencion cola = null;
        Paciente paciente = null;

        if (idCola != null) {
            cola = colaAtencionRepository.findById(idCola).orElse(null);
            if (cola != null) {
                paciente = cola.getPaciente();
            }
        }

        if (paciente == null && idPaciente != null) {
            paciente = pacienteRepository.findById(idPaciente)
                    .orElseThrow(() -> new IllegalArgumentException("Paciente no encontrado con id: " + idPaciente));
        }

        if (paciente == null) {
            throw new IllegalArgumentException("Debe proporcionar un idCola o idPaciente válido");
        }

        Consulta consulta = consultaRepository.findTopByPacienteOrderByFechaConsultaDesc(paciente).orElse(null);

        Integer edad = null;
        if (paciente.getFechaNacimiento() != null) {
            edad = Period.between(paciente.getFechaNacimiento(), LocalDate.now()).getYears();
        }

        boolean esNino = edad != null && edad < 13;
        String nombreTarifa = esNino ? "Tarifa de Consulta Médica Niño" : "Tarifa de Consulta Médica";

        String nombreCompleto = (paciente.getNombres() != null ? paciente.getNombres() : "") + " " +
                (paciente.getApellidos() != null ? paciente.getApellidos() : "");

        RecetaDispensacionResponse response = RecetaDispensacionResponse.builder()
                .idCola(cola != null ? cola.getIdCola() : null)
                .idPaciente(paciente.getIdPaciente())
                .nombreCompletoPaciente(nombreCompleto.trim())
                .edad(edad)
                .sexo(paciente.getSexo() != null ? paciente.getSexo().name() : null)
                .comunidad(paciente.getComunidad())
                .nombreTarifaConsulta(nombreTarifa)
                .esNino(esNino)
                .build();

        if (consulta != null) {
            response.setIdConsulta(consulta.getIdConsulta());
            response.setFechaConsulta(consulta.getFechaConsulta());
            if (consulta.getMedico() != null) {
                response.setNombreMedico(consulta.getMedico().getNombres() + " " + consulta.getMedico().getApellidos());
            }

            BigDecimal precioConsulta = consulta.getPrecioConsulta();
            if (precioConsulta == null || precioConsulta.compareTo(BigDecimal.ZERO) <= 0) {
                precioConsulta = esNino
                        ? tarifaServicioService.obtenerPrecioConsultaNino()
                        : tarifaServicioService.obtenerPrecioConsultaGeneral();
            }
            response.setPrecioConsulta(precioConsulta);

            BigDecimal totalMedicamentos = BigDecimal.ZERO;
            Tratamiento tratamiento = tratamientoRepository.findByConsultaIdWithDetalles(consulta.getIdConsulta()).orElse(null);
            if (tratamiento != null) {
                response.setObservacionesTratamiento(tratamiento.getObservaciones());

                List<DetalleDispensacionResponse> medList = new ArrayList<>();
                List<LoteSugeridoResponse> lotesSugeridosList = new ArrayList<>();

                if (tratamiento.getDetalles() != null) {
                    for (DetalleTratamiento d : tratamiento.getDetalles()) {
                        Medicamento m = d.getMedicamento();
                        int cantidadPedida = d.getCantidad() != null ? d.getCantidad() : 1;

                        List<LoteMedicamento> lotesActivos = loteRepository.buscar(EstadoLote.ACTIVO, m.getIdMedicamento(), null).stream()
                                .filter(l -> l.getCantidadInicial() != null && l.getCantidadInicial() > 0)
                                .sorted(Comparator.comparing(LoteMedicamento::getFechaExpiracion))
                                .toList();

                        int stock = lotesActivos.stream()
                                .mapToInt(LoteMedicamento::getCantidadInicial)
                                .sum();

                        BigDecimal precioUnitario = BigDecimal.ZERO;
                        if (!lotesActivos.isEmpty()) {
                            LoteMedicamento lAct = lotesActivos.get(0);
                            precioUnitario = lAct.getPrecioVenta() != null
                                     ? lAct.getPrecioVenta()
                                    : (lAct.getPrecioUnitario() != null ? lAct.getPrecioUnitario() : BigDecimal.ZERO);
                        }
                        BigDecimal subtotalDetalle = precioUnitario.multiply(BigDecimal.valueOf(cantidadPedida));

                        medList.add(DetalleDispensacionResponse.builder()
                                .idMedicamento(m.getIdMedicamento())
                                .nombre(m.getNombre())
                                .presentacion(m.getPresentacion())
                                .concentracion(m.getConcentracion())
                                .dosis(d.getDosis())
                                .frecuencia(d.getFrecuencia())
                                .duracion(d.getDuracion())
                                .cantidad(cantidadPedida)
                                .stockDisponible(stock)
                                .precioUnitario(precioUnitario)
                                .subtotal(subtotalDetalle)
                                .esUsoClinica(Boolean.TRUE.equals(d.getEsUsoClinica()))
                                .build());

                        if (!lotesActivos.isEmpty()) {
                            LoteMedicamento loteSugerido = lotesActivos.get(0);
                            long dias = loteSugerido.getFechaExpiracion() != null
                                    ? java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), loteSugerido.getFechaExpiracion())
                                    : 0L;
                            int aDescontar = Math.min(cantidadPedida, loteSugerido.getCantidadInicial());
                            BigDecimal pUnitLote = loteSugerido.getPrecioVenta() != null
                                    ? loteSugerido.getPrecioVenta()
                                    : (loteSugerido.getPrecioUnitario() != null ? loteSugerido.getPrecioUnitario() : BigDecimal.ZERO);
                            BigDecimal subtotalLote = pUnitLote.multiply(BigDecimal.valueOf(aDescontar));
                            totalMedicamentos = totalMedicamentos.add(subtotalLote);

                            lotesSugeridosList.add(LoteSugeridoResponse.builder()
                                    .idMedicamento(m.getIdMedicamento())
                                    .medicamentoNombre(m.getNombre())
                                    .idLote(loteSugerido.getIdLote())
                                    .numeroLote(loteSugerido.getNumeroLote() != null && !loteSugerido.getNumeroLote().isBlank()
                                            ? loteSugerido.getNumeroLote()
                                            : "S/L")
                                    .fechaVencimiento(loteSugerido.getFechaExpiracion())
                                    .stockDisponible(loteSugerido.getCantidadInicial())
                                    .cantidadADescontar(aDescontar)
                                    .diasParaVencer(dias)
                                    .tieneStock(true)
                                    .precioUnitario(pUnitLote)
                                    .subtotal(subtotalLote)
                                    .build());
                        } else {
                            lotesSugeridosList.add(LoteSugeridoResponse.builder()
                                    .idMedicamento(m.getIdMedicamento())
                                    .medicamentoNombre(m.getNombre())
                                    .numeroLote("SIN STOCK")
                                    .stockDisponible(0)
                                    .cantidadADescontar(0)
                                    .tieneStock(false)
                                    .precioUnitario(BigDecimal.ZERO)
                                    .subtotal(BigDecimal.ZERO)
                                    .build());
                        }
                    }
                }
                response.setMedicamentos(medList);
                response.setLotesSugeridos(lotesSugeridosList);
                response.setTotalMedicamentos(totalMedicamentos);
            }

            // Procedimientos Clínicos Prescritos
            List<com.hyma.procedimiento.model.ConsultaProcedimiento> procedimientosList =
                    consultaProcedimientoRepository.findByConsultaIdWithDetails(consulta.getIdConsulta());
            List<com.hyma.procedimiento.dto.ConsultaProcedimientoResponse> procResponses = new ArrayList<>();
            BigDecimal totalProcedimientos = BigDecimal.ZERO;
            if (procedimientosList != null) {
                for (var cp : procedimientosList) {
                    if (cp != null && (cp.getEstado() == null || !"CANCELADO".equalsIgnoreCase(cp.getEstado()))) {
                        procResponses.add(procedimientoService.toResponse(cp));
                        if (cp.getSubtotal() != null) {
                            totalProcedimientos = totalProcedimientos.add(cp.getSubtotal());
                        }
                    }
                }
            }
            response.setProcedimientos(procResponses);
            response.setTotalProcedimientos(totalProcedimientos);
            response.setTotalPagar(precioConsulta.add(totalMedicamentos).add(totalProcedimientos));
        }

        return response;
    }

    @Transactional
    public ColaAtencionResponse entregarMedicamentos(Long idCola) {
        return entregarMedicamentos(idCola, null, null);
    }

    @Transactional
    public ColaAtencionResponse entregarMedicamentos(Long idCola, EntregaMedicamentosRequest request, String username) {
        ColaAtencion cola = colaAtencionRepository.findById(idCola)
                .orElseThrow(() -> new IllegalArgumentException("Cola de atención no encontrada con id: " + idCola));

        Paciente paciente = cola.getPaciente();
        if (paciente != null) {
            Consulta consulta = consultaRepository.findTopByPacienteOrderByFechaConsultaDesc(paciente).orElse(null);
            if (consulta != null) {
                Usuario usuario = null;
                if (username != null && !username.isBlank()) {
                    usuario = usuarioRepository.findByUsername(username).orElse(null);
                }

                String modalidad = request != null && request.getModalidadCobro() != null ? request.getModalidadCobro().trim().toUpperCase() : "";
                boolean esExoneracionTotal = request != null && (
                        request.isEsCasoEspecial() ||
                        "SR".equals(modalidad) ||
                        "S/R".equals(modalidad) ||
                        "BECADO".equals(modalidad) ||
                        "CASO_ESPECIAL".equals(modalidad)
                );
                boolean noPagaConsulta = request != null && (request.isNoPagaConsulta() || esExoneracionTotal);
                boolean esCasoEspecial = esExoneracionTotal;

                Integer edad = null;
                if (consulta.getPaciente() != null && consulta.getPaciente().getFechaNacimiento() != null) {
                    edad = Period.between(consulta.getPaciente().getFechaNacimiento(), LocalDate.now()).getYears();
                }
                boolean esNino = edad != null && edad < 13;

                BigDecimal precioConsulta = consulta.getPrecioConsulta();
                if ((precioConsulta == null || precioConsulta.compareTo(BigDecimal.ZERO) <= 0) && !noPagaConsulta) {
                    precioConsulta = esNino
                            ? tarifaServicioService.obtenerPrecioConsultaNino()
                            : tarifaServicioService.obtenerPrecioConsultaGeneral();
                    consulta.setPrecioConsulta(precioConsulta);
                    consultaRepository.save(consulta);
                }

                BigDecimal costoConsulta = noPagaConsulta
                        ? BigDecimal.ZERO
                        : (precioConsulta != null ? precioConsulta : BigDecimal.ZERO);

                if (noPagaConsulta) {
                    consulta.setPrecioConsulta(BigDecimal.ZERO);
                    consultaRepository.save(consulta);
                }

                // Sincronizar tratamiento si fue editado en farmacia
                Tratamiento tratamiento = tratamientoRepository.findByConsultaIdWithDetalles(consulta.getIdConsulta()).orElse(null);
                if (request != null && request.getMedicamentos() != null) {
                    if (tratamiento == null && !request.getMedicamentos().isEmpty()) {
                        tratamiento = Tratamiento.builder()
                                .consulta(consulta)
                                .observaciones("Dispensación Farmacia")
                                .detalles(new ArrayList<>())
                                .build();
                        tratamiento = tratamientoRepository.save(tratamiento);
                    }
                    if (tratamiento != null) {
                        tratamiento.getDetalles().clear();
                        for (MedicamentoDispensacionItemRequest mReq : request.getMedicamentos()) {
                            if (mReq == null || mReq.getIdMedicamento() == null) continue;
                            int cant = mReq.getCantidad() != null && mReq.getCantidad() > 0 ? mReq.getCantidad() : 1;
                            Medicamento med = medicamentoRepository.findById(mReq.getIdMedicamento()).orElse(null);
                            if (med != null) {
                                DetalleTratamiento det = DetalleTratamiento.builder()
                                        .tratamiento(tratamiento)
                                        .medicamento(med)
                                        .dosis(mReq.getDosis() != null ? mReq.getDosis().trim() : "")
                                        .frecuencia(mReq.getFrecuencia() != null ? mReq.getFrecuencia().trim() : "")
                                        .duracion(mReq.getDuracion() != null ? mReq.getDuracion().trim() : "")
                                        .cantidad(cant)
                                        .esUsoClinica(Boolean.TRUE.equals(mReq.getEsUsoClinica()))
                                        .build();
                                tratamiento.getDetalles().add(det);
                            }
                        }
                        tratamiento = tratamientoRepository.save(tratamiento);
                    }
                }

                boolean tieneMedicamentos = tratamiento != null && tratamiento.getDetalles() != null
                        && tratamiento.getDetalles().stream().anyMatch(d -> d.getMedicamento() != null && d.getCantidad() != null && d.getCantidad() > 0);

                if (tieneMedicamentos) {
                    String tipoSalida = "DISPENSACION";
                    if ("BECADO".equals(modalidad)) {
                        tipoSalida = "BECADO";
                    } else if ("SR".equals(modalidad) || "S/R".equals(modalidad) || esExoneracionTotal) {
                        tipoSalida = "SR";
                    }

                    String observaciones = request != null && request.getObservaciones() != null && !request.getObservaciones().isBlank()
                            ? request.getObservaciones()
                            : ("BECADO".equals(tipoSalida)
                                    ? "Dispensación Becado (Exoneración total)"
                                    : ("SR".equals(tipoSalida)
                                            ? "Dispensación S/R (Exoneración total)"
                                            : "Dispensación de medicamentos de consulta médica"));
                    if (noPagaConsulta && !esExoneracionTotal && !observaciones.contains("Exonerada")) {
                        observaciones += " [Consulta Exonerada]";
                    }

                    SalidaMedicamento salida = SalidaMedicamento.builder()
                            .consulta(consulta)
                            .usuario(usuario)
                            .fechaSalida(LocalDateTime.now())
                            .tipoSalida(tipoSalida)
                            .observaciones(observaciones)
                            .costoConsulta(costoConsulta)
                            .build();
                    salida = salidaMedicamentoRepository.save(salida);

                    int totalUnidadesDescontadas = 0;
                    for (DetalleTratamiento d : tratamiento.getDetalles()) {
                        int cantidadRestante = d.getCantidad() != null ? d.getCantidad() : 1;
                        Medicamento m = d.getMedicamento();
                        if (m != null && cantidadRestante > 0) {
                            // Buscar lotes activos con stock ordenados por fecha de expiración ascendente (FEFO)
                            List<LoteMedicamento> lotesActivos = loteRepository.buscar(EstadoLote.ACTIVO, m.getIdMedicamento(), null).stream()
                                    .filter(l -> l.getCantidadInicial() != null && l.getCantidadInicial() > 0)
                                    .sorted(Comparator.comparing(LoteMedicamento::getFechaExpiracion))
                                    .toList();

                            for (LoteMedicamento lote : lotesActivos) {
                                if (cantidadRestante <= 0) break;
                                int stockActual = lote.getCantidadInicial();
                                int aDescontar = Math.min(stockActual, cantidadRestante);
                                int nuevoStock = stockActual - aDescontar;
                                lote.setCantidadInicial(nuevoStock);
                                if (nuevoStock == 0) {
                                    lote.setEstado(EstadoLote.INACTIVO);
                                }
                                loteRepository.save(lote);

                                // Registrar detalle de salida del lote
                                BigDecimal precioUnit = lote.getPrecioVenta() != null
                                        ? lote.getPrecioVenta()
                                        : (lote.getPrecioUnitario() != null ? lote.getPrecioUnitario() : BigDecimal.ZERO);
                                DetalleSalidaMedicamento detalleSalida = DetalleSalidaMedicamento.builder()
                                        .salida(salida)
                                        .lote(lote)
                                        .cantidad(aDescontar)
                                        .precioUnitario(precioUnit)
                                        .build();
                                detalleSalidaMedicamentoRepository.save(detalleSalida);

                                cantidadRestante -= aDescontar;
                                totalUnidadesDescontadas += aDescontar;
                            }
                        }
                    }

                    // Si no se pudo descontar ninguna unidad del stock, no dejar registro fantasma
                    if (totalUnidadesDescontadas == 0) {
                        salidaMedicamentoRepository.delete(salida);
                    }
                }

                // Sincronizar y actualizar procedimientos clínicos
                if (request != null && request.getProcedimientos() != null) {
                    List<com.hyma.procedimiento.model.ConsultaProcedimiento> procsExistentes =
                            consultaProcedimientoRepository.findByConsulta_IdConsulta(consulta.getIdConsulta());

                    Set<Long> idsKept = request.getProcedimientos().stream()
                            .map(ProcedimientoDispensacionItemRequest::getIdConsultaProcedimiento)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toSet());

                    if (procsExistentes != null) {
                        for (var cp : procsExistentes) {
                            if (cp != null && !idsKept.contains(cp.getIdConsultaProcedimiento())) {
                                consultaProcedimientoRepository.delete(cp);
                            }
                        }
                    }

                    for (ProcedimientoDispensacionItemRequest pReq : request.getProcedimientos()) {
                        if (pReq == null) continue;
                        int cant = pReq.getCantidad() != null && pReq.getCantidad() > 0 ? pReq.getCantidad() : 1;

                        if (pReq.getIdConsultaProcedimiento() != null) {
                            var cpOpt = consultaProcedimientoRepository.findById(pReq.getIdConsultaProcedimiento());
                            if (cpOpt.isPresent()) {
                                var cp = cpOpt.get();
                                BigDecimal pUnit = pReq.getPrecioUnitario() != null
                                        ? pReq.getPrecioUnitario()
                                        : (cp.getPrecioUnitario() != null ? cp.getPrecioUnitario() : BigDecimal.ZERO);
                                cp.setCantidad(cant);
                                cp.setPrecioUnitario(pUnit);
                                cp.setSubtotal(pUnit.multiply(BigDecimal.valueOf(cant)));
                                if (pReq.getInstrucciones() != null) {
                                    cp.setInstrucciones(pReq.getInstrucciones().trim());
                                }
                                cp.setEstado("ATENDIDO");
                                cp.setFechaAtencion(LocalDateTime.now());
                                if (usuario != null) {
                                    cp.setUsuarioAtendio(usuario);
                                }
                                consultaProcedimientoRepository.save(cp);
                            }
                        } else if (pReq.getIdProcedimiento() != null) {
                            var procOpt = procedimientoRepository.findById(pReq.getIdProcedimiento());
                            if (procOpt.isPresent()) {
                                var proc = procOpt.get();
                                BigDecimal pUnit = pReq.getPrecioUnitario() != null
                                        ? pReq.getPrecioUnitario()
                                        : (proc.getPrecio() != null ? proc.getPrecio() : BigDecimal.ZERO);
                                var cpNuevo = com.hyma.procedimiento.model.ConsultaProcedimiento.builder()
                                        .consulta(consulta)
                                        .paciente(paciente)
                                        .procedimiento(proc)
                                        .cantidad(cant)
                                        .precioUnitario(pUnit)
                                        .subtotal(pUnit.multiply(BigDecimal.valueOf(cant)))
                                        .instrucciones(pReq.getInstrucciones() != null ? pReq.getInstrucciones().trim() : "")
                                        .estado("ATENDIDO")
                                        .fechaRegistro(LocalDateTime.now())
                                        .fechaAtencion(LocalDateTime.now())
                                        .usuarioAtendio(usuario)
                                        .build();
                                consultaProcedimientoRepository.save(cpNuevo);
                            }
                        }
                    }
                } else {
                    // Si no se envió lista modificada, marcar los existentes en ESPERA a ATENDIDO
                    List<com.hyma.procedimiento.model.ConsultaProcedimiento> procs =
                            consultaProcedimientoRepository.findByConsulta_IdConsulta(consulta.getIdConsulta());
                    if (procs != null) {
                        for (var cp : procs) {
                            if (cp != null && "ESPERA".equalsIgnoreCase(cp.getEstado())) {
                                cp.setEstado("ATENDIDO");
                                cp.setFechaAtencion(LocalDateTime.now());
                                if (usuario != null) {
                                    cp.setUsuarioAtendio(usuario);
                                }
                                consultaProcedimientoRepository.save(cp);
                            }
                        }
                    }
                }
            }
        }

        cola.setEstado(EstadoCola.FINALIZADO);
        cola.setFechaAtencion(LocalDateTime.now());
        return colaAtencionMapper.toResponse(colaAtencionRepository.save(cola));
    }

    @Transactional
    public ColaAtencionResponse cancelarTurnoDispensacion(Long idCola) {
        ColaAtencion cola = colaAtencionRepository.findById(idCola)
                .orElseThrow(() -> new IllegalArgumentException("Cola de atención no encontrada con id: " + idCola));
        cola.setEstado(EstadoCola.CANCELADO);
        cola.setFechaAtencion(LocalDateTime.now());
        return colaAtencionMapper.toResponse(colaAtencionRepository.save(cola));
    }

    @Transactional(readOnly = true)
    public List<SalidaMedicamentoResponse> listarSalidas() {
        List<SalidaMedicamento> salidas = salidaMedicamentoRepository.findAllByOrderByFechaSalidaDesc();
        if (salidas.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> idsSalidas = salidas.stream().map(SalidaMedicamento::getIdSalida).toList();
        List<DetalleSalidaMedicamento> todosDetalles = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidas);

        Map<Long, List<DetalleSalidaMedicamento>> detallesPorSalida = todosDetalles.stream()
                .filter(d -> d.getSalida() != null && d.getSalida().getIdSalida() != null)
                .collect(Collectors.groupingBy(d -> d.getSalida().getIdSalida()));

        return salidas.stream()
                .filter(salida -> {
                    List<DetalleSalidaMedicamento> dList = detallesPorSalida.getOrDefault(salida.getIdSalida(), Collections.emptyList());
                    return !dList.isEmpty();
                })
                .map(salida -> {
            List<DetalleSalidaMedicamento> dList = detallesPorSalida.getOrDefault(salida.getIdSalida(), Collections.emptyList());

            BigDecimal totalMed = BigDecimal.ZERO;
            List<DetalleSalidaMedicamentoResponse> detalleResponses = new ArrayList<>();

            for (DetalleSalidaMedicamento d : dList) {
                LoteMedicamento lote = d.getLote();
                Medicamento med = lote != null ? lote.getMedicamento() : null;

                BigDecimal pUnit = d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO;
                int cant = d.getCantidad() != null ? d.getCantidad() : 0;
                BigDecimal sub = pUnit.multiply(BigDecimal.valueOf(cant));
                totalMed = totalMed.add(sub);

                detalleResponses.add(DetalleSalidaMedicamentoResponse.builder()
                        .idDetalleSalida(d.getIdDetalleSalida())
                        .idLote(lote != null ? lote.getIdLote() : null)
                        .idMedicamento(med != null ? med.getIdMedicamento() : null)
                        .medicamentoNombre(med != null ? med.getNombre() : "—")
                        .presentacion(med != null ? med.getPresentacion() : null)
                        .concentracion(med != null ? med.getConcentracion() : null)
                        .categoriaNombre(med != null && med.getCategoria() != null ? med.getCategoria().getNombre() : null)
                        .casaFarmaceuticaNombre(med != null && med.getCasaFarmaceutica() != null ? med.getCasaFarmaceutica().getNombre() : null)
                        .numeroLote(lote != null ? lote.getNumeroLote() : "S/L")
                        .fechaExpiracion(lote != null ? lote.getFechaExpiracion() : null)
                        .cantidad(cant)
                        .precioUnitario(pUnit)
                        .subtotal(sub)
                        .build());
            }

            Consulta c = salida.getConsulta();
            Paciente p = c != null ? c.getPaciente() : null;
            var medico = c != null ? c.getMedico() : null;
            Usuario u = salida.getUsuario();

            String pacienteNombre = p != null
                    ? ((p.getNombres() != null ? p.getNombres() : "") + " " + (p.getApellidos() != null ? p.getApellidos() : "")).trim()
                    : null;

            String medicoNombre = medico != null
                    ? ((medico.getNombres() != null ? medico.getNombres() : "") + " " + (medico.getApellidos() != null ? medico.getApellidos() : "")).trim()
                    : null;

            String usuarioNombre = u != null ? u.getUsername() : null;

            return SalidaMedicamentoResponse.builder()
                    .idSalida(salida.getIdSalida())
                    .idConsulta(c != null ? c.getIdConsulta() : null)
                    .idPaciente(p != null ? p.getIdPaciente() : null)
                    .pacienteNombre(pacienteNombre)
                    .medicoNombre(medicoNombre)
                    .usuarioNombre(usuarioNombre)
                    .fechaSalida(salida.getFechaSalida())
                    .tipoSalida(salida.getTipoSalida())
                    .observaciones(salida.getObservaciones())
                    .costoConsulta(salida.getCostoConsulta() != null ? salida.getCostoConsulta() : BigDecimal.ZERO)
                    .totalMedicamentos(totalMed)
                    .detalles(detalleResponses)
                    .build();
        }).toList();
    }

    @Transactional
    public VentaExternaResponse registrarVentaExterna(VentaExternaRequest request, String username) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Debe incluir al menos un medicamento para la venta");
        }

        Usuario usuario = null;
        if (username != null && !username.isBlank()) {
            usuario = usuarioRepository.findByUsername(username).orElse(null);
        }

        String cliente = request.getCliente() != null ? request.getCliente().trim() : null;
        String obs = "Venta externa en mostrador";
        if (cliente != null && !cliente.isBlank()) {
            obs += " - Cliente: " + cliente;
        }
        if (request.getObservaciones() != null && !request.getObservaciones().isBlank()) {
            obs += " (" + request.getObservaciones().trim() + ")";
        }

        SalidaMedicamento salida = SalidaMedicamento.builder()
                .consulta(null)
                .usuario(usuario)
                .fechaSalida(LocalDateTime.now())
                .tipoSalida("VENTA_EXTERNA")
                .observaciones(obs)
                .costoConsulta(BigDecimal.ZERO)
                .build();
        salida = salidaMedicamentoRepository.save(salida);

        BigDecimal totalVenta = BigDecimal.ZERO;
        List<VentaExternaResponse.ItemVentaExternaResponse> detallesResponse = new ArrayList<>();

        for (VentaExternaRequest.ItemVentaExternaRequest itemReq : request.getItems()) {
            if (itemReq.getIdMedicamento() == null || itemReq.getCantidad() == null || itemReq.getCantidad() <= 0) {
                continue;
            }

            Medicamento m = medicamentoRepository.findById(itemReq.getIdMedicamento())
                    .orElseThrow(() -> new IllegalArgumentException("Medicamento no encontrado con id: " + itemReq.getIdMedicamento()));

            int cantidadRestante = itemReq.getCantidad();

            // Buscar lotes activos con stock ordenados por fecha de expiración ascendente (FEFO)
            List<LoteMedicamento> lotesActivos = loteRepository.buscar(EstadoLote.ACTIVO, m.getIdMedicamento(), null).stream()
                    .filter(l -> l.getCantidadInicial() != null && l.getCantidadInicial() > 0)
                    .sorted(Comparator.comparing(LoteMedicamento::getFechaExpiracion))
                    .toList();

            int stockTotalDisponible = lotesActivos.stream().mapToInt(LoteMedicamento::getCantidadInicial).sum();
            if (stockTotalDisponible < cantidadRestante) {
                throw new IllegalArgumentException("Stock insuficiente para '" + m.getNombre() + "'. Solicitado: " + cantidadRestante + ", disponible: " + stockTotalDisponible);
            }

            for (LoteMedicamento lote : lotesActivos) {
                if (cantidadRestante <= 0) break;
                int stockActual = lote.getCantidadInicial();
                int aDescontar = Math.min(stockActual, cantidadRestante);
                int nuevoStock = stockActual - aDescontar;
                lote.setCantidadInicial(nuevoStock);
                if (nuevoStock == 0) {
                    lote.setEstado(EstadoLote.INACTIVO);
                }
                loteRepository.save(lote);

                // Precio unitario: si se envió en la petición se usa, de lo contrario el del lote
                BigDecimal precioUnit = itemReq.getPrecioUnitario() != null
                        ? itemReq.getPrecioUnitario()
                        : (lote.getPrecioVenta() != null
                                ? lote.getPrecioVenta()
                                : (lote.getPrecioUnitario() != null ? lote.getPrecioUnitario() : BigDecimal.ZERO));
                BigDecimal subtotal = precioUnit.multiply(BigDecimal.valueOf(aDescontar));

                DetalleSalidaMedicamento detalleSalida = DetalleSalidaMedicamento.builder()
                        .salida(salida)
                        .lote(lote)
                        .cantidad(aDescontar)
                        .precioUnitario(precioUnit)
                        .build();
                detalleSalida = detalleSalidaMedicamentoRepository.save(detalleSalida);

                totalVenta = totalVenta.add(subtotal);
                cantidadRestante -= aDescontar;

                detallesResponse.add(VentaExternaResponse.ItemVentaExternaResponse.builder()
                        .idDetalleSalida(detalleSalida.getIdDetalleSalida())
                        .idMedicamento(m.getIdMedicamento())
                        .nombreMedicamento(m.getNombre())
                        .presentacion(m.getPresentacion())
                        .concentracion(m.getConcentracion())
                        .numeroLote(lote.getNumeroLote())
                        .cantidad(aDescontar)
                        .precioUnitario(precioUnit)
                        .subtotal(subtotal)
                        .build());
            }
        }

        return VentaExternaResponse.builder()
                .idSalida(salida.getIdSalida())
                .fechaSalida(salida.getFechaSalida())
                .tipoSalida(salida.getTipoSalida())
                .cliente(cliente)
                .observaciones(salida.getObservaciones())
                .totalVenta(totalVenta)
                .detalles(detallesResponse)
                .build();
    }

    @Transactional
    public ConsumoClinicaResponse registrarConsumoClinica(ConsumoClinicaRequest request, String username) {
        if (request.getIdMedicamento() == null) {
            throw new IllegalArgumentException("Debe seleccionar un medicamento o insumo");
        }
        if (request.getCantidad() == null || request.getCantidad() < 1) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }

        Usuario usuario = null;
        if (username != null) {
            usuario = usuarioRepository.findByUsername(username).orElse(null);
        }

        Medicamento med = medicamentoRepository.findById(request.getIdMedicamento())
                .orElseThrow(() -> new FarmaciaNotFoundException("Medicamento no encontrado"));

        List<LoteMedicamento> lotesActivos = loteRepository.buscar(EstadoLote.ACTIVO, med.getIdMedicamento(), null).stream()
                .filter(l -> l.getCantidadInicial() != null && l.getCantidadInicial() > 0)
                .sorted(Comparator.comparing(LoteMedicamento::getFechaExpiracion))
                .toList();

        int stockTotal = lotesActivos.stream().mapToInt(LoteMedicamento::getCantidadInicial).sum();
        if (stockTotal < request.getCantidad()) {
            throw new IllegalArgumentException("Stock insuficiente para " + med.getNombre() +
                    ". Stock disponible: " + stockTotal + ", solicitado: " + request.getCantidad());
        }

        String obs = request.getObservaciones() != null && !request.getObservaciones().isBlank()
                ? request.getObservaciones().trim()
                : "Consumo de insumo en clínica médica";

        SalidaMedicamento salida = SalidaMedicamento.builder()
                .usuario(usuario)
                .fechaSalida(LocalDateTime.now())
                .tipoSalida("USO_CLINICA")
                .observaciones(obs)
                .costoConsulta(BigDecimal.ZERO)
                .build();
        salida = salidaMedicamentoRepository.save(salida);

        int cantidadRestante = request.getCantidad();
        BigDecimal totalCosto = BigDecimal.ZERO;
        BigDecimal ultimoPrecioUnit = BigDecimal.ZERO;

        for (LoteMedicamento lote : lotesActivos) {
            if (cantidadRestante <= 0) break;
            int stockActual = lote.getCantidadInicial();
            int aDescontar = Math.min(stockActual, cantidadRestante);
            int nuevoStock = stockActual - aDescontar;
            lote.setCantidadInicial(nuevoStock);
            if (nuevoStock == 0) {
                lote.setEstado(EstadoLote.INACTIVO);
            }
            loteRepository.save(lote);

            BigDecimal precioUnit = lote.getPrecioVenta() != null
                    ? lote.getPrecioVenta()
                    : (lote.getPrecioUnitario() != null ? lote.getPrecioUnitario() : BigDecimal.ZERO);
            ultimoPrecioUnit = precioUnit;

            DetalleSalidaMedicamento det = DetalleSalidaMedicamento.builder()
                    .salida(salida)
                    .lote(lote)
                    .cantidad(aDescontar)
                    .precioUnitario(precioUnit)
                    .build();
            detalleSalidaMedicamentoRepository.save(det);

            totalCosto = totalCosto.add(precioUnit.multiply(BigDecimal.valueOf(aDescontar)));
            cantidadRestante -= aDescontar;
        }

        String usuarioNombre = usuario != null ? usuario.getUsername() : "Sistema";

        return ConsumoClinicaResponse.builder()
                .idSalida(salida.getIdSalida())
                .idMedicamento(med.getIdMedicamento())
                .medicamentoNombre(med.getNombre())
                .presentacion(med.getPresentacion())
                .cantidad(request.getCantidad())
                .precioUnitario(ultimoPrecioUnit)
                .total(totalCosto)
                .usuarioNombre(usuarioNombre)
                .fechaSalida(salida.getFechaSalida())
                .observaciones(salida.getObservaciones())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ConsumoClinicaResponse> listarHistorialConsumoClinica() {
        List<SalidaMedicamento> salidas = salidaMedicamentoRepository.findTop50ByTipoSalidaOrderByFechaSalidaDesc("USO_CLINICA");
        if (salidas.isEmpty()) {
            return List.of();
        }

        List<Long> idsSalidas = salidas.stream().map(SalidaMedicamento::getIdSalida).toList();
        List<DetalleSalidaMedicamento> detalles = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidas);
        Map<Long, List<DetalleSalidaMedicamento>> detallesPorSalida = detalles.stream()
                .collect(Collectors.groupingBy(d -> d.getSalida().getIdSalida()));

        List<ConsumoClinicaResponse> resultado = new ArrayList<>();
        for (SalidaMedicamento s : salidas) {
            List<DetalleSalidaMedicamento> dets = detallesPorSalida.getOrDefault(s.getIdSalida(), List.of());
            for (DetalleSalidaMedicamento d : dets) {
                Medicamento med = d.getLote() != null ? d.getLote().getMedicamento() : null;
                String medNombre = med != null ? med.getNombre() : "Insumo / Medicamento";
                String pres = med != null ? med.getPresentacion() : "";
                BigDecimal precioUnit = d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal total = precioUnit.multiply(BigDecimal.valueOf(d.getCantidad() != null ? d.getCantidad() : 0));

                Usuario u = s.getUsuario();
                String uNombre = u != null ? u.getUsername() : "Sistema";

                resultado.add(ConsumoClinicaResponse.builder()
                        .idSalida(s.getIdSalida())
                        .idMedicamento(med != null ? med.getIdMedicamento() : null)
                        .medicamentoNombre(medNombre)
                        .presentacion(pres)
                        .cantidad(d.getCantidad())
                        .precioUnitario(precioUnit)
                        .total(total)
                        .usuarioNombre(uNombre)
                        .fechaSalida(s.getFechaSalida())
                        .observaciones(s.getObservaciones())
                        .build());
            }
        }
        return resultado;
    }
}
