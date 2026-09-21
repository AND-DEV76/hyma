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

import java.math.BigDecimal;
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
                            .filter(l -> l.getPrecioUnitario() != null)
                            .reduce((first, second) -> second)
                            .map(LoteMedicamento::getPrecioUnitario)
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
                        .cantidadInicial(detalleRequest.getCantidad())
                        .estado(EstadoLote.ACTIVO)
                        .build();
            } else {
                // Caso 1: Mismo medicamento, mismo número de lote, mismo vencimiento y mismo costo unitario -> acumular cantidad en el mismo id_lote
                int cantidadActual = lote.getCantidadInicial() == null ? 0 : lote.getCantidadInicial();
                lote.setCantidadInicial(cantidadActual + detalleRequest.getCantidad());
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

        String nombreCompleto = (paciente.getNombres() != null ? paciente.getNombres() : "") + " " +
                (paciente.getApellidos() != null ? paciente.getApellidos() : "");

        RecetaDispensacionResponse response = RecetaDispensacionResponse.builder()
                .idCola(cola != null ? cola.getIdCola() : null)
                .idPaciente(paciente.getIdPaciente())
                .nombreCompletoPaciente(nombreCompleto.trim())
                .edad(edad)
                .sexo(paciente.getSexo() != null ? paciente.getSexo().name() : null)
                .comunidad(paciente.getComunidad())
                .build();

        if (consulta != null) {
            response.setIdConsulta(consulta.getIdConsulta());
            response.setFechaConsulta(consulta.getFechaConsulta());
            if (consulta.getMedico() != null) {
                response.setNombreMedico(consulta.getMedico().getNombres() + " " + consulta.getMedico().getApellidos());
            }

            BigDecimal precioConsulta = consulta.getPrecioConsulta() != null ? consulta.getPrecioConsulta() : BigDecimal.ZERO;
            response.setPrecioConsulta(precioConsulta);

            Tratamiento tratamiento = tratamientoRepository.findByConsultaIdWithDetalles(consulta.getIdConsulta()).orElse(null);
            if (tratamiento != null) {
                response.setObservacionesTratamiento(tratamiento.getObservaciones());

                List<DetalleDispensacionResponse> medList = new ArrayList<>();
                List<LoteSugeridoResponse> lotesSugeridosList = new ArrayList<>();
                BigDecimal totalMedicamentos = BigDecimal.ZERO;

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
                        if (!lotesActivos.isEmpty() && lotesActivos.get(0).getPrecioUnitario() != null) {
                            precioUnitario = lotesActivos.get(0).getPrecioUnitario();
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
                                .build());

                        if (!lotesActivos.isEmpty()) {
                            LoteMedicamento loteSugerido = lotesActivos.get(0);
                            long dias = loteSugerido.getFechaExpiracion() != null
                                    ? java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), loteSugerido.getFechaExpiracion())
                                    : 0L;
                            int aDescontar = Math.min(cantidadPedida, loteSugerido.getCantidadInicial());
                            BigDecimal pUnitLote = loteSugerido.getPrecioUnitario() != null ? loteSugerido.getPrecioUnitario() : BigDecimal.ZERO;
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
                response.setTotalPagar(precioConsulta.add(totalMedicamentos));
            }
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

                boolean noPagaConsulta = request != null && request.isNoPagaConsulta();
                BigDecimal costoConsulta = noPagaConsulta
                        ? BigDecimal.ZERO
                        : (consulta.getPrecioConsulta() != null ? consulta.getPrecioConsulta() : BigDecimal.ZERO);

                if (noPagaConsulta) {
                    consulta.setPrecioConsulta(BigDecimal.ZERO);
                    consultaRepository.save(consulta);
                }

                String observaciones = request != null && request.getObservaciones() != null && !request.getObservaciones().isBlank()
                        ? request.getObservaciones()
                        : "Dispensación de medicamentos de consulta médica";
                if (noPagaConsulta && !observaciones.contains("Exonerada")) {
                    observaciones += " [Consulta Exonerada]";
                }

                SalidaMedicamento salida = SalidaMedicamento.builder()
                        .consulta(consulta)
                        .usuario(usuario)
                        .fechaSalida(LocalDateTime.now())
                        .tipoSalida("DISPENSACION")
                        .observaciones(observaciones)
                        .costoConsulta(costoConsulta)
                        .build();
                salida = salidaMedicamentoRepository.save(salida);

                Tratamiento tratamiento = tratamientoRepository.findByConsultaIdWithDetalles(consulta.getIdConsulta()).orElse(null);
                if (tratamiento != null && tratamiento.getDetalles() != null) {
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
                                BigDecimal precioUnit = lote.getPrecioUnitario() != null ? lote.getPrecioUnitario() : BigDecimal.ZERO;
                                DetalleSalidaMedicamento detalleSalida = DetalleSalidaMedicamento.builder()
                                        .salida(salida)
                                        .lote(lote)
                                        .cantidad(aDescontar)
                                        .precioUnitario(precioUnit)
                                        .build();
                                detalleSalidaMedicamentoRepository.save(detalleSalida);

                                cantidadRestante -= aDescontar;
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

        return salidas.stream().map(salida -> {
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
}
