package com.hyma.reporte.service;

import com.hyma.clinica.model.CatalogoCie10;
import com.hyma.clinica.model.Diagnostico;
import com.hyma.clinica.repository.CatalogoCie10Repository;

import com.hyma.clinica.repository.DiagnosticoRepository;
import com.hyma.consulta.model.Consulta;
import com.hyma.consulta.repository.ConsultaRepository;
import com.hyma.farmacia.model.DetalleSalidaMedicamento;
import com.hyma.farmacia.model.SalidaMedicamento;
import com.hyma.farmacia.repository.DetalleSalidaMedicamentoRepository;
import com.hyma.farmacia.repository.SalidaMedicamentoRepository;
import com.hyma.recepcion.model.Paciente;
import com.hyma.recepcion.model.ColaAtencion;
import com.hyma.recepcion.model.EstadoCola;
import com.hyma.recepcion.model.Sexo;
import com.hyma.recepcion.repository.ColaAtencionRepository;
import com.hyma.farmacia.model.DetalleEntradaMedicamento;
import com.hyma.farmacia.model.EntradaMedicamento;
import com.hyma.farmacia.model.TipoEntrada;
import com.hyma.farmacia.repository.EntradaMedicamentoRepository;
import com.hyma.farmacia.model.EstadoLote;
import com.hyma.farmacia.model.LoteMedicamento;
import com.hyma.farmacia.model.Medicamento;
import com.hyma.farmacia.repository.LoteMedicamentoRepository;
import com.hyma.farmacia.repository.MedicamentoRepository;
import com.hyma.reporte.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.DefaultIndexedColorMap;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteService {

    private final ConsultaRepository consultaRepository;
    private final DiagnosticoRepository diagnosticoRepository;
    private final CatalogoCie10Repository catalogoCie10Repository;
    private final SalidaMedicamentoRepository salidaMedicamentoRepository;
    private final DetalleSalidaMedicamentoRepository detalleSalidaMedicamentoRepository;
    private final ColaAtencionRepository colaAtencionRepository;
    private final LoteMedicamentoRepository loteMedicamentoRepository;
    private final MedicamentoRepository medicamentoRepository;
    private final EntradaMedicamentoRepository entradaMedicamentoRepository;


    // Paleta base institucional de colores pastel para categorías
    private static final Map<String, String> COLORES_CATEGORIA_BASE = Map.of(
            "INFECCIOSOS", "#FED7AA",    // Anaranjado pálido
            "CRONICOS", "#BAE6FD",       // Celeste pálido
            "GINECOLOGICO", "#FBCFE8",   // Rosado pálido
            "NUTRICIONAL", "#D1FAE5",    // Verde pálido
            "OTROS", "#FCE4D6"           // Tono pálido especificado
    );

    // Paleta rotativa para nuevas categorías dinámicas
    private static final List<String> PALETA_PASTEL_EXTRA = List.of(
            "#EDE9FE", // Violeta / lavanda pálido
            "#FEF9C3", // Amarillo pálido
            "#CCFBF1", // Turquesa / menta pálido
            "#F3E8FF", // Lila pálido
            "#FEE2E2", // Rojo pálido
            "#E2E8F0"  // Gris pálido
    );

    /**
     * Construye dinámicamente las columnas de diagnóstico a partir de la BD (catalogo_cie10 y categoria_diagnostico).
     */
    @Transactional(readOnly = true)
    public List<DiagnosticoColumnaInfo> obtenerColumnasDiagnosticosDinamicas() {
        List<CatalogoCie10> catalogo = catalogoCie10Repository.findAllWithCategoria();

        if (catalogo.isEmpty()) {
            return List.of(
                    new DiagnosticoColumnaInfo(0, 1L, "GEN-01", "OTROS", "Consulta General", "#FCE4D6")
            );
        }

        // Agrupar por nombre de categoría
        Map<String, List<CatalogoCie10>> porCategoria = catalogo.stream()
                .collect(Collectors.groupingBy(c -> {
                    if (c.getCategoria() != null && c.getCategoria().getNombre() != null && !c.getCategoria().getNombre().isBlank()) {
                        return c.getCategoria().getNombre().trim().toUpperCase();
                    }
                    return "OTROS";
                }));

        // Orden de categorías: estándar primero, luego nuevas dinámicas, y OTROS al final
        List<String> categoriasOrdenadas = new ArrayList<>();
        List<String> ordenEstandar = List.of("INFECCIOSOS", "CRONICOS", "GINECOLOGICO", "NUTRICIONAL");
        for (String std : ordenEstandar) {
            if (porCategoria.containsKey(std)) {
                categoriasOrdenadas.add(std);
            }
        }

        // Categorías adicionales (ej. CANCERIGENO, etc.)
        List<String> extras = porCategoria.keySet().stream()
                .filter(k -> !ordenEstandar.contains(k) && !"OTROS".equals(k))
                .sorted()
                .toList();
        categoriasOrdenadas.addAll(extras);

        // OTROS al final si existe
        if (porCategoria.containsKey("OTROS")) {
            categoriasOrdenadas.add("OTROS");
        }

        // Asignación de colores pastel
        Map<String, String> colorPorCategoria = new HashMap<>();
        int extraIdx = 0;
        for (String cat : categoriasOrdenadas) {
            if (COLORES_CATEGORIA_BASE.containsKey(cat)) {
                colorPorCategoria.put(cat, COLORES_CATEGORIA_BASE.get(cat));
            } else {
                String color = PALETA_PASTEL_EXTRA.get(extraIdx % PALETA_PASTEL_EXTRA.size());
                colorPorCategoria.put(cat, color);
                extraIdx++;
            }
        }

        // Generar lista final de columnas
        List<DiagnosticoColumnaInfo> resultado = new ArrayList<>();
        int colIndex = 0;

        for (String cat : categoriasOrdenadas) {
            List<CatalogoCie10> items = porCategoria.get(cat);
            if (items == null) continue;

            // Ordenar diagnósticos por descripción (no por código)
            items.sort(Comparator.comparing(CatalogoCie10::getDescripcion, String.CASE_INSENSITIVE_ORDER));

            String color = colorPorCategoria.getOrDefault(cat, "#FCE4D6");

            for (CatalogoCie10 item : items) {
                resultado.add(DiagnosticoColumnaInfo.builder()
                        .indice(colIndex++)
                        .idCie10(item.getIdCie10())
                        .codigo(item.getCodigo())
                        .categoria(cat)
                        .nombre(item.getDescripcion()) // Se muestra la descripción
                        .colorFondo(color)
                        .build());
            }
        }

        return resultado;
    }

    @Transactional(readOnly = true)
    public ReporteEstadisticaResponse generarReporteEstadistica(int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        // Obtener columnas diagnósticas dinámicas desde BD
        List<DiagnosticoColumnaInfo> columnasDiag = obtenerColumnasDiagnosticosDinamicas();
        int totalDiagCols = columnasDiag.size();

        // Consultas del mes
        List<Consulta> consultasMes = consultaRepository.findByFechaConsultaBetweenOrderByFechaConsultaAsc(inicioMes, finMes);

        // Mapeo del primer registro histórico de cada paciente
        Map<Long, LocalDateTime> primerConsultaMap = new HashMap<>();
        try {
            List<Object[]> minConsultas = consultaRepository.findMinFechaConsultaPorPaciente();
            for (Object[] row : minConsultas) {
                if (row == null || row.length < 2 || row[0] == null) continue;

                Long idPac = null;
                if (row[0] instanceof Number num) {
                    idPac = num.longValue();
                } else {
                    try {
                        idPac = Long.valueOf(row[0].toString());
                    } catch (Exception ignored) {}
                }

                LocalDateTime minFecha = null;
                if (row[1] instanceof LocalDateTime ldt) {
                    minFecha = ldt;
                } else if (row[1] instanceof java.sql.Timestamp ts) {
                    minFecha = ts.toLocalDateTime();
                } else if (row[1] instanceof java.util.Date d) {
                    minFecha = d.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
                } else if (row[1] != null) {
                    try {
                        minFecha = LocalDateTime.parse(row[1].toString().replace(" ", "T"));
                    } catch (Exception ignored) {}
                }

                if (idPac != null && minFecha != null) {
                    primerConsultaMap.put(idPac, minFecha);
                }
            }
        } catch (Exception ex) {
            log.warn("No se pudo obtener el historial mínimo de consultas por paciente: {}", ex.getMessage());
        }

        // Diagnósticos de las consultas del mes
        List<Long> idsConsultas = consultasMes.stream()
                .map(Consulta::getIdConsulta)
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        Map<Long, List<Diagnostico>> diagPorConsulta = new HashMap<>();
        Map<Long, SalidaMedicamento> salidaPorConsulta = new HashMap<>();
        Map<Long, List<DetalleSalidaMedicamento>> detallesPorSalida = new HashMap<>();

        if (!idsConsultas.isEmpty()) {
            List<Diagnostico> todosDiag = diagnosticoRepository.findByConsulta_IdConsultaIn(idsConsultas);
            for (Diagnostico d : todosDiag) {
                if (d != null && d.getConsulta() != null && d.getConsulta().getIdConsulta() != null) {
                    diagPorConsulta.computeIfAbsent(d.getConsulta().getIdConsulta(), k -> new ArrayList<>()).add(d);
                }
            }

            // Cargar salidas y detalles de medicamentos del mes para la recaudación real
            List<SalidaMedicamento> salidas = salidaMedicamentoRepository.findByConsulta_IdConsultaIn(idsConsultas);
            List<Long> idsSalidas = new ArrayList<>();
            for (SalidaMedicamento s : salidas) {
                if (s != null && s.getConsulta() != null && s.getConsulta().getIdConsulta() != null) {
                    salidaPorConsulta.put(s.getConsulta().getIdConsulta(), s);
                    if (s.getIdSalida() != null) {
                        idsSalidas.add(s.getIdSalida());
                    }
                }
            }
            if (!idsSalidas.isEmpty()) {
                List<DetalleSalidaMedicamento> detalles = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidas);
                for (DetalleSalidaMedicamento det : detalles) {
                    if (det != null && det.getSalida() != null && det.getSalida().getIdSalida() != null) {
                        detallesPorSalida.computeIfAbsent(det.getSalida().getIdSalida(), k -> new ArrayList<>()).add(det);
                    }
                }
            }
        }

        // Cargar salidas externas (sin consulta) para sumarlas a la recaudación del día
        List<SalidaMedicamento> salidasExternas = salidaMedicamentoRepository.findByTipoSalidaIgnoreCaseAndFechaSalidaBetweenOrderByFechaSalidaDesc("VENTA_EXTERNA", inicioMes, finMes);
        Map<Integer, BigDecimal> ventasExternasPorDia = new HashMap<>();
        if (salidasExternas != null && !salidasExternas.isEmpty()) {
            List<Long> idsSalidasExt = salidasExternas.stream().map(SalidaMedicamento::getIdSalida).filter(Objects::nonNull).toList();
            if (!idsSalidasExt.isEmpty()) {
                List<DetalleSalidaMedicamento> detallesExt = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidasExt);
                Map<Long, BigDecimal> subtotalPorSalidaExt = new HashMap<>();
                for (DetalleSalidaMedicamento det : detallesExt) {
                    if (det != null && det.getSalida() != null && det.getSalida().getIdSalida() != null
                            && det.getCantidad() != null && det.getPrecioUnitario() != null) {
                        BigDecimal sub = det.getPrecioUnitario().multiply(BigDecimal.valueOf(det.getCantidad()));
                        subtotalPorSalidaExt.merge(det.getSalida().getIdSalida(), sub, BigDecimal::add);
                    }
                }
                for (SalidaMedicamento se : salidasExternas) {
                    if (se.getFechaSalida() != null) {
                        int diaExt = se.getFechaSalida().getDayOfMonth();
                        BigDecimal monto = subtotalPorSalidaExt.getOrDefault(se.getIdSalida(), BigDecimal.ZERO);
                        ventasExternasPorDia.merge(diaExt, monto, BigDecimal::add);
                    }
                }
            }
        }

        // Agrupar consultas por día del mes
        Map<Integer, List<Consulta>> consultasPorDia = consultasMes.stream()
                .filter(c -> c.getFechaConsulta() != null)
                .collect(Collectors.groupingBy(c -> c.getFechaConsulta().getDayOfMonth()));

        int diasEnMes = ym.lengthOfMonth();
        List<FilaReporteEstadistica> filas = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (int dia = 1; dia <= diasEnMes; dia++) {
            LocalDate fechaDia = ym.atDay(dia);
            List<Consulta> consultasDia = consultasPorDia.getOrDefault(dia, Collections.emptyList());
            BigDecimal recaudadoVentaExt = ventasExternasPorDia.getOrDefault(dia, BigDecimal.ZERO);

            if (consultasDia.isEmpty()) {
                List<Integer> diagsCero = new ArrayList<>(Collections.nCopies(totalDiagCols, 0));
                filas.add(FilaReporteEstadistica.builder()
                        .fecha(fechaDia.format(dtf))
                        .numeroDia(dia)
                        .diasAtencion(0)
                        .nuevos(0)
                        .reconsulta(0)
                        .totalPacientes(0)
                        .edad0a5(0)
                        .edad6a12(0)
                        .edad13a17(0)
                        .edad18a59(0)
                        .edad60mas(0)
                        .totalEdades(0)
                        .femenino(0)
                        .masculino(0)
                        .totalGenero(0)
                        .totalRecaudado(recaudadoVentaExt)
                        .diagnosticos(diagsCero)
                        .build());
                continue;
            }

            int nuevos = 0;
            int reconsulta = 0;
            int e0a5 = 0;
            int e6a12 = 0;
            int e13a17 = 0;
            int e18a59 = 0;
            int e60mas = 0;
            int fem = 0;
            int masc = 0;
            BigDecimal recaudado = BigDecimal.ZERO;
            int[] conteoDiag = new int[totalDiagCols];

            for (Consulta c : consultasDia) {
                if (c == null) continue;
                Paciente p = c.getPaciente();
                if (p == null) continue;

                // Nuevo o Re-consulta
                LocalDateTime primeraFecha = primerConsultaMap.get(p.getIdPaciente());
                if (primeraFecha != null && primeraFecha.toLocalDate().isEqual(fechaDia)) {
                    nuevos++;
                } else {
                    reconsulta++;
                }

                // Edad
                if (p.getFechaNacimiento() != null) {
                    int edad = Period.between(p.getFechaNacimiento(), fechaDia).getYears();
                    if (edad <= 5) e0a5++;
                    else if (edad <= 12) e6a12++;
                    else if (edad <= 17) e13a17++;
                    else if (edad <= 59) e18a59++;
                    else e60mas++;
                } else {
                    e18a59++;
                }

                // Género
                String sexo = p.getSexo() != null ? p.getSexo().name() : "M";
                if ("F".equalsIgnoreCase(sexo)) {
                    fem++;
                } else {
                    masc++;
                }

                // Recaudado: Costo Consulta (o 0 si exonerada) + Total Medicamentos Dispensados
                BigDecimal totalConsulta = BigDecimal.ZERO;
                SalidaMedicamento salida = c.getIdConsulta() != null ? salidaPorConsulta.get(c.getIdConsulta()) : null;
                if (salida != null) {
                    boolean esCasoEspecial = "CASO_ESPECIAL".equalsIgnoreCase(salida.getTipoSalida());
                    if (!esCasoEspecial) {
                        BigDecimal costoConsulta = salida.getCostoConsulta() != null ? salida.getCostoConsulta() : BigDecimal.ZERO;
                        totalConsulta = totalConsulta.add(costoConsulta);

                        List<DetalleSalidaMedicamento> detalles = salida.getIdSalida() != null
                                ? detallesPorSalida.getOrDefault(salida.getIdSalida(), Collections.emptyList())
                                : Collections.emptyList();
                        for (DetalleSalidaMedicamento det : detalles) {
                            if (det != null && det.getCantidad() != null && det.getPrecioUnitario() != null) {
                                BigDecimal precioDetalle = det.getPrecioUnitario().multiply(BigDecimal.valueOf(det.getCantidad()));
                                totalConsulta = totalConsulta.add(precioDetalle);
                            }
                        }
                    }
                } else {
                    if (c.getPrecioConsulta() != null) {
                        totalConsulta = totalConsulta.add(c.getPrecioConsulta());
                    }
                }
                recaudado = recaudado.add(totalConsulta);

                // Diagnósticos dinámicos
                if (c.getIdConsulta() != null) {
                    List<Diagnostico> diags = diagPorConsulta.getOrDefault(c.getIdConsulta(), Collections.emptyList());
                    for (Diagnostico d : diags) {
                        if (d == null) continue;
                        int idx = clasificarDiagnosticoDinamico(d, columnasDiag);
                        if (idx >= 0 && idx < totalDiagCols) {
                            conteoDiag[idx]++;
                        }
                    }
                }
            }

            recaudado = recaudado.add(recaudadoVentaExt);

            int totalPac = nuevos + reconsulta;
            int totalEdades = e0a5 + e6a12 + e13a17 + e18a59 + e60mas;
            int totalGen = fem + masc;

            List<Integer> listDiag = new ArrayList<>();
            for (int val : conteoDiag) {
                listDiag.add(val);
            }

            filas.add(FilaReporteEstadistica.builder()
                    .fecha(fechaDia.format(dtf))
                    .numeroDia(dia)
                    .diasAtencion(1)
                    .nuevos(nuevos)
                    .reconsulta(reconsulta)
                    .totalPacientes(totalPac)
                    .edad0a5(e0a5)
                    .edad6a12(e6a12)
                    .edad13a17(e13a17)
                    .edad18a59(e18a59)
                    .edad60mas(e60mas)
                    .totalEdades(totalEdades)
                    .femenino(fem)
                    .masculino(masc)
                    .totalGenero(totalGen)
                    .totalRecaudado(recaudado)
                    .diagnosticos(listDiag)
                    .build());
        }

        // Calcular Totales
        int totDiasAtencion = (int) filas.stream().filter(f -> f.getDiasAtencion() != null && f.getDiasAtencion() > 0).count();
        int sumNuevos = filas.stream().mapToInt(FilaReporteEstadistica::getNuevos).sum();
        int sumReconsulta = filas.stream().mapToInt(FilaReporteEstadistica::getReconsulta).sum();
        int sumTotalPac = sumNuevos + sumReconsulta;
        int sum0a5 = filas.stream().mapToInt(FilaReporteEstadistica::getEdad0a5).sum();
        int sum6a12 = filas.stream().mapToInt(FilaReporteEstadistica::getEdad6a12).sum();
        int sum13a17 = filas.stream().mapToInt(FilaReporteEstadistica::getEdad13a17).sum();
        int sum18a59 = filas.stream().mapToInt(FilaReporteEstadistica::getEdad18a59).sum();
        int sum60mas = filas.stream().mapToInt(FilaReporteEstadistica::getEdad60mas).sum();
        int sumTotalEdades = sum0a5 + sum6a12 + sum13a17 + sum18a59 + sum60mas;
        int sumFem = filas.stream().mapToInt(FilaReporteEstadistica::getFemenino).sum();
        int sumMasc = filas.stream().mapToInt(FilaReporteEstadistica::getMasculino).sum();
        int sumTotalGen = sumFem + sumMasc;
        BigDecimal sumRecaudado = filas.stream()
                .map(FilaReporteEstadistica::getTotalRecaudado)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int[] sumDiags = new int[totalDiagCols];
        for (FilaReporteEstadistica f : filas) {
            for (int i = 0; i < totalDiagCols; i++) {
                if (f.getDiagnosticos() != null && f.getDiagnosticos().size() > i) {
                    sumDiags[i] += f.getDiagnosticos().get(i);
                }
            }
        }
        List<Integer> listTotDiags = new ArrayList<>();
        for (int v : sumDiags) listTotDiags.add(v);

        // Promedio diario de atención (Total Pacientes / Total Días de Atención)
        double promDiarioPacientes = totDiasAtencion > 0
                ? Math.round(((double) sumTotalPac / totDiasAtencion) * 10.0) / 10.0
                : 0.0;

        TotalesReporteEstadistica totales = TotalesReporteEstadistica.builder()
                .totalDiasAtencion(totDiasAtencion)
                .promedioDiarioAtencion(promDiarioPacientes)
                .nuevos(sumNuevos)
                .reconsulta(sumReconsulta)
                .totalPacientes(sumTotalPac)
                .edad0a5(sum0a5)
                .edad6a12(sum6a12)
                .edad13a17(sum13a17)
                .edad18a59(sum18a59)
                .edad60mas(sum60mas)
                .totalEdades(sumTotalEdades)
                .femenino(sumFem)
                .masculino(sumMasc)
                .totalGenero(sumTotalGen)
                .totalRecaudado(sumRecaudado)
                .diagnosticos(listTotDiags)
                .build();

        // En la fila PROMEDIO solo se promedian los DÍAS de atención y la recaudación diaria
        BigDecimal promRecaudado = totDiasAtencion > 0
                ? sumRecaudado.divide(BigDecimal.valueOf(totDiasAtencion), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        TotalesReporteEstadistica promedios = TotalesReporteEstadistica.builder()
                .totalDiasAtencion((int) Math.round(promDiarioPacientes))
                .promedioDiarioAtencion(promDiarioPacientes)
                .nuevos(0)
                .reconsulta(0)
                .totalPacientes((int) Math.round(promDiarioPacientes))
                .edad0a5(0)
                .edad6a12(0)
                .edad13a17(0)
                .edad18a59(0)
                .edad60mas(0)
                .totalEdades(0)
                .femenino(0)
                .masculino(0)
                .totalGenero(0)
                .totalRecaudado(promRecaudado)
                .diagnosticos(new ArrayList<>(Collections.nCopies(totalDiagCols, 0)))
                .build();

        String periodoNombre = ym.getMonth().name().substring(0, 3).toLowerCase() + "-" + (anio % 100);

        return ReporteEstadisticaResponse.builder()
                .mes(mes)
                .anio(anio)
                .periodoNombre(periodoNombre)
                .titulo("ESTADISTICA MENSUAL OBRAS SOCIALES SAN MARTIN")
                .columnasDiagnosticos(columnasDiag)
                .filas(filas)
                .totales(totales)
                .promedios(promedios)
                .build();
    }

    /**
     * Clasifica un diagnóstico dinámicamente comparando código CIE-10 y descripción contra el catálogo.
     */
    public int clasificarDiagnosticoDinamico(Diagnostico d, List<DiagnosticoColumnaInfo> columnas) {
        if (d == null || columnas.isEmpty()) return 0;

        String cod = d.getCodigoCie10() != null ? d.getCodigoCie10().trim().toUpperCase() : "";
        String desc = d.getDescripcion() != null ? d.getDescripcion().trim() : "";

        // 1. Coincidencia exacta por código
        if (!cod.isEmpty()) {
            for (int i = 0; i < columnas.size(); i++) {
                DiagnosticoColumnaInfo col = columnas.get(i);
                if (col.getCodigo() != null && col.getCodigo().equalsIgnoreCase(cod)) {
                    return i;
                }
            }
        }

        // 2. Coincidencia normalizada por descripción
        String cleanDesc = normalizarTexto(desc);
        if (!cleanDesc.isEmpty()) {
            for (int i = 0; i < columnas.size(); i++) {
                DiagnosticoColumnaInfo col = columnas.get(i);
                String cleanCol = normalizarTexto(col.getNombre());
                if (cleanDesc.equalsIgnoreCase(cleanCol)) {
                    return i;
                }
            }

            // 3. Contención de palabras clave
            for (int i = 0; i < columnas.size(); i++) {
                DiagnosticoColumnaInfo col = columnas.get(i);
                String cleanCol = normalizarTexto(col.getNombre());
                if (cleanDesc.contains(cleanCol) || cleanCol.contains(cleanDesc)) {
                    return i;
                }
            }
        }

        // 4. Si no coincide, buscar primera columna de "OTROS" o fallback al último índice
        for (int i = 0; i < columnas.size(); i++) {
            if ("OTROS".equalsIgnoreCase(columnas.get(i).getCategoria())) {
                return i;
            }
        }

        return columnas.size() - 1;
    }

    private String normalizarTexto(String texto) {
        if (texto == null || texto.isBlank()) return "";
        return Normalizer.normalize(texto.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").trim();
    }

    /**
     * Genera el libro Excel (.xlsx) dinámico, con colores pastel, nombres en negro,
     * y EXCLUSIVAMENTE los días con atención registrados.
     */
    public byte[] generarExcel(int anio, int mes) throws IOException {
        ReporteEstadisticaResponse data = generarReporteEstadistica(anio, mes);
        List<DiagnosticoColumnaInfo> columnasDiag = data.getColumnasDiagnosticos();
        int totalDiagCols = columnasDiag.size();

        // Filtrar SOLO días con atención
        List<FilaReporteEstadistica> filasAtendidas = data.getFilas().stream()
                .filter(f -> f.getDiasAtencion() != null && f.getDiasAtencion() > 0)
                .toList();

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Estadística Mensual");
            sheet.setDisplayGridlines(true);

            DefaultIndexedColorMap colorMap = new DefaultIndexedColorMap();

            // Fuente Negrita común
            Font fontBold = wb.createFont();
            fontBold.setBold(true);

            // Fuente Títulos Principales
            Font fontHeaderTitle = wb.createFont();
            fontHeaderTitle.setBold(true);
            fontHeaderTitle.setFontHeightInPoints((short) 11);
            fontHeaderTitle.setColor(IndexedColors.WHITE.getIndex());

            // Fuente Negro para Categorías y Diagnósticos (solicitud explícita del usuario)
            Font fontNegroBold = wb.createFont();
            fontNegroBold.setBold(true);
            fontNegroBold.setColor(IndexedColors.BLACK.getIndex());
            fontNegroBold.setFontHeightInPoints((short) 9);

            Font fontNegroSub = wb.createFont();
            fontNegroSub.setBold(true);
            fontNegroSub.setColor(IndexedColors.BLACK.getIndex());
            fontNegroSub.setFontHeightInPoints((short) 8);

            // Estilos Títulos Generales
            CellStyle styleTitleMain = wb.createCellStyle();
            styleTitleMain.setFont(fontHeaderTitle);
            styleTitleMain.setAlignment(HorizontalAlignment.CENTER);
            styleTitleMain.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTitleMain.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            styleTitleMain.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTitleMain);

            CellStyle styleTitleDiag = wb.createCellStyle();
            styleTitleDiag.setFont(fontHeaderTitle);
            styleTitleDiag.setAlignment(HorizontalAlignment.CENTER);
            styleTitleDiag.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTitleDiag.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            styleTitleDiag.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTitleDiag);

            // Estilo Subencabezados estándar
            CellStyle styleSubHeader = wb.createCellStyle();
            styleSubHeader.setFont(fontNegroSub);
            styleSubHeader.setAlignment(HorizontalAlignment.CENTER);
            styleSubHeader.setVerticalAlignment(VerticalAlignment.CENTER);
            styleSubHeader.setWrapText(true);
            styleSubHeader.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            styleSubHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleSubHeader);

            // Estilos Numéricos y Moneda
            CellStyle styleDataNum = wb.createCellStyle();
            styleDataNum.setAlignment(HorizontalAlignment.CENTER);
            setBorders(styleDataNum);

            CellStyle styleCurrency = wb.createCellStyle();
            styleCurrency.setAlignment(HorizontalAlignment.RIGHT);
            DataFormat df = wb.createDataFormat();
            styleCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            setBorders(styleCurrency);

            // Estilos Totales
            CellStyle styleTotal = wb.createCellStyle();
            styleTotal.setFont(fontBold);
            styleTotal.setAlignment(HorizontalAlignment.CENTER);
            styleTotal.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            styleTotal.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTotal);

            CellStyle styleTotalCurrency = wb.createCellStyle();
            styleTotalCurrency.setFont(fontBold);
            styleTotalCurrency.setAlignment(HorizontalAlignment.RIGHT);
            styleTotalCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            styleTotalCurrency.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            styleTotalCurrency.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTotalCurrency);

            // Cache de estilos para cada categoría con su color pastel y texto negro
            Map<String, CellStyle> estilosCategoriaHeader = new HashMap<>();
            Map<String, CellStyle> estilosDiagnosticoSubheader = new HashMap<>();

            for (DiagnosticoColumnaInfo col : columnasDiag) {
                String cat = col.getCategoria();
                String colorHex = col.getColorFondo() != null ? col.getColorFondo() : "#FCE4D6";

                if (!estilosCategoriaHeader.containsKey(cat)) {
                    XSSFCellStyle styleCat = (XSSFCellStyle) wb.createCellStyle();
                    styleCat.setFont(fontNegroBold);
                    styleCat.setAlignment(HorizontalAlignment.CENTER);
                    styleCat.setVerticalAlignment(VerticalAlignment.CENTER);
                    styleCat.setWrapText(true);
                    byte[] rgb = hexToRgb(colorHex);
                    styleCat.setFillForegroundColor(new XSSFColor(rgb, colorMap));
                    styleCat.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                    setBorders(styleCat);
                    estilosCategoriaHeader.put(cat, styleCat);
                }

                if (!estilosDiagnosticoSubheader.containsKey(col.getNombre())) {
                    XSSFCellStyle styleDiag = (XSSFCellStyle) wb.createCellStyle();
                    styleDiag.setFont(fontNegroSub);
                    styleDiag.setAlignment(HorizontalAlignment.CENTER);
                    styleDiag.setVerticalAlignment(VerticalAlignment.CENTER);
                    styleDiag.setWrapText(true);
                    byte[] rgb = hexToRgb(colorHex);
                    styleDiag.setFillForegroundColor(new XSSFColor(rgb, colorMap));
                    styleDiag.setFillPattern(FillPatternType.SOLID_FOREGROUND);
                    setBorders(styleDiag);
                    estilosDiagnosticoSubheader.put(col.getNombre(), styleDiag);
                }
            }

            int lastColIdx = 14 + totalDiagCols;

            // -------------------------------------------------------------
            // FILA 0: Título principal
            // -------------------------------------------------------------
            Row row0 = sheet.createRow(0);
            row0.setHeightInPoints(26);

            Cell cPeriodo = row0.createCell(0);
            cPeriodo.setCellValue(data.getPeriodoNombre());
            cPeriodo.setCellStyle(styleTitleMain);

            Cell cTitulo = row0.createCell(1);
            cTitulo.setCellValue(data.getTitulo());
            cTitulo.setCellStyle(styleTitleMain);

            for (int col = 2; col <= 14; col++) {
                Cell c = row0.createCell(col);
                c.setCellStyle(styleTitleMain);
            }
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 1, 14));

            // Merge de clasificación de diagnósticos
            Cell cDiagTitle = row0.createCell(15);
            cDiagTitle.setCellValue("CLASIFICACIÓN DE DIAGNÓSTICOS");
            cDiagTitle.setCellStyle(styleTitleDiag);
            for (int col = 16; col <= lastColIdx; col++) {
                Cell c = row0.createCell(col);
                c.setCellStyle(styleTitleDiag);
            }
            if (lastColIdx >= 15) {
                sheet.addMergedRegion(new CellRangeAddress(0, 0, 15, lastColIdx));
            }

            // -------------------------------------------------------------
            // FILA 1: Encabezados mayores de bloques
            // -------------------------------------------------------------
            Row row1 = sheet.createRow(1);
            row1.setHeightInPoints(24);

            crearCeldaConBorde(row1, 0, "FECHA", styleSubHeader);
            crearCeldaConBorde(row1, 1, "TOTAL DIAS DE ATENCION", styleSubHeader);

            crearCeldaConBorde(row1, 2, "No DE PACIENTES", styleSubHeader);
            crearCeldaConBorde(row1, 3, "", styleSubHeader);
            crearCeldaConBorde(row1, 4, "", styleSubHeader);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 2, 4));

            crearCeldaConBorde(row1, 5, "GRUPO DE EDADES", styleSubHeader);
            for (int c = 6; c <= 10; c++) crearCeldaConBorde(row1, c, "", styleSubHeader);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 5, 10));

            crearCeldaConBorde(row1, 11, "GENERO", styleSubHeader);
            crearCeldaConBorde(row1, 12, "", styleSubHeader);
            crearCeldaConBorde(row1, 13, "", styleSubHeader);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 11, 13));

            crearCeldaConBorde(row1, 14, "TOTAL RECAUDADO", styleSubHeader);

            // Generar bloques de categorías dinámicamente con texto negro y fondo pastel
            int startCatCol = 15;
            while (startCatCol <= lastColIdx) {
                int colIdx = startCatCol - 15;
                String catName = columnasDiag.get(colIdx).getCategoria();
                CellStyle styleCat = estilosCategoriaHeader.get(catName);

                int endCatCol = startCatCol;
                while (endCatCol + 1 <= lastColIdx &&
                        columnasDiag.get(endCatCol + 1 - 15).getCategoria().equalsIgnoreCase(catName)) {
                    endCatCol++;
                }

                for (int c = startCatCol; c <= endCatCol; c++) {
                    crearCeldaConBorde(row1, c, c == startCatCol ? catName : "", styleCat);
                }

                if (endCatCol > startCatCol) {
                    sheet.addMergedRegion(new CellRangeAddress(1, 1, startCatCol, endCatCol));
                }

                startCatCol = endCatCol + 1;
            }

            // -------------------------------------------------------------
            // FILA 2: Sub-encabezados específicos de columnas
            // -------------------------------------------------------------
            Row row2 = sheet.createRow(2);
            row2.setHeightInPoints(48);

            crearCeldaConBorde(row2, 0, "FECHA", styleSubHeader);
            crearCeldaConBorde(row2, 1, "DÍAS", styleSubHeader);
            crearCeldaConBorde(row2, 2, "NUEVOS", styleSubHeader);
            crearCeldaConBorde(row2, 3, "RE- CONSULTA", styleSubHeader);
            crearCeldaConBorde(row2, 4, "TOTAL", styleSubHeader);

            crearCeldaConBorde(row2, 5, "0-5", styleSubHeader);
            crearCeldaConBorde(row2, 6, "06-12", styleSubHeader);
            crearCeldaConBorde(row2, 7, "13-17", styleSubHeader);
            crearCeldaConBorde(row2, 8, "18-59", styleSubHeader);
            crearCeldaConBorde(row2, 9, "60-+", styleSubHeader);
            crearCeldaConBorde(row2, 10, "TOTAL", styleSubHeader);

            crearCeldaConBorde(row2, 11, "F", styleSubHeader);
            crearCeldaConBorde(row2, 12, "M", styleSubHeader);
            crearCeldaConBorde(row2, 13, "TOTAL", styleSubHeader);

            crearCeldaConBorde(row2, 14, "Q", styleSubHeader);

            // Nombres de diagnósticos (descripción, texto negro y fondo pastel)
            for (int i = 0; i < totalDiagCols; i++) {
                DiagnosticoColumnaInfo colInfo = columnasDiag.get(i);
                CellStyle styleDiag = estilosDiagnosticoSubheader.get(colInfo.getNombre());
                crearCeldaConBorde(row2, 15 + i, colInfo.getNombre(), styleDiag != null ? styleDiag : styleSubHeader);
            }

            // -------------------------------------------------------------
            // FILAS DE DATOS (EXCLUSIVAMENTE DÍAS CON ATENCIÓN)
            // -------------------------------------------------------------
            int rowIdx = 3;
            for (FilaReporteEstadistica f : filasAtendidas) {
                Row r = sheet.createRow(rowIdx++);
                r.setHeightInPoints(18);

                crearCeldaConBorde(r, 0, f.getFecha(), styleDataNum);
                crearCeldaNumerica(r, 1, 1, styleDataNum);
                crearCeldaNumerica(r, 2, f.getNuevos(), styleDataNum);
                crearCeldaNumerica(r, 3, f.getReconsulta(), styleDataNum);
                crearCeldaNumerica(r, 4, f.getTotalPacientes(), styleDataNum);

                crearCeldaNumerica(r, 5, f.getEdad0a5(), styleDataNum);
                crearCeldaNumerica(r, 6, f.getEdad6a12(), styleDataNum);
                crearCeldaNumerica(r, 7, f.getEdad13a17(), styleDataNum);
                crearCeldaNumerica(r, 8, f.getEdad18a59(), styleDataNum);
                crearCeldaNumerica(r, 9, f.getEdad60mas(), styleDataNum);
                crearCeldaNumerica(r, 10, f.getTotalEdades(), styleDataNum);

                crearCeldaNumerica(r, 11, f.getFemenino(), styleDataNum);
                crearCeldaNumerica(r, 12, f.getMasculino(), styleDataNum);
                crearCeldaNumerica(r, 13, f.getTotalGenero(), styleDataNum);

                Cell cRec = r.createCell(14);
                cRec.setCellValue(f.getTotalRecaudado() != null ? f.getTotalRecaudado().doubleValue() : 0.0);
                cRec.setCellStyle(styleCurrency);

                for (int i = 0; i < totalDiagCols; i++) {
                    int val = (f.getDiagnosticos() != null && f.getDiagnosticos().size() > i)
                            ? f.getDiagnosticos().get(i) : 0;
                    crearCeldaNumerica(r, 15 + i, val, styleDataNum);
                }
            }

            // -------------------------------------------------------------
            // FILA TOTALES
            // -------------------------------------------------------------
            Row rTot = sheet.createRow(rowIdx++);
            rTot.setHeightInPoints(22);
            TotalesReporteEstadistica tot = data.getTotales();

            crearCeldaConBorde(rTot, 0, "TOTALES", styleTotal);
            crearCeldaNumerica(rTot, 1, tot.getTotalDiasAtencion(), styleTotal);
            crearCeldaNumerica(rTot, 2, tot.getNuevos(), styleTotal);
            crearCeldaNumerica(rTot, 3, tot.getReconsulta(), styleTotal);
            crearCeldaNumerica(rTot, 4, tot.getTotalPacientes(), styleTotal);

            crearCeldaNumerica(rTot, 5, tot.getEdad0a5(), styleTotal);
            crearCeldaNumerica(rTot, 6, tot.getEdad6a12(), styleTotal);
            crearCeldaNumerica(rTot, 7, tot.getEdad13a17(), styleTotal);
            crearCeldaNumerica(rTot, 8, tot.getEdad18a59(), styleTotal);
            crearCeldaNumerica(rTot, 9, tot.getEdad60mas(), styleTotal);
            crearCeldaNumerica(rTot, 10, tot.getTotalEdades(), styleTotal);

            crearCeldaNumerica(rTot, 11, tot.getFemenino(), styleTotal);
            crearCeldaNumerica(rTot, 12, tot.getMasculino(), styleTotal);
            crearCeldaNumerica(rTot, 13, tot.getTotalGenero(), styleTotal);

            Cell cTotRec = rTot.createCell(14);
            cTotRec.setCellValue(tot.getTotalRecaudado() != null ? tot.getTotalRecaudado().doubleValue() : 0.0);
            cTotRec.setCellStyle(styleTotalCurrency);

            for (int i = 0; i < totalDiagCols; i++) {
                int val = (tot.getDiagnosticos() != null && tot.getDiagnosticos().size() > i)
                        ? tot.getDiagnosticos().get(i) : 0;
                crearCeldaNumerica(rTot, 15 + i, val, styleTotal);
            }

            // -------------------------------------------------------------
            // FILA PROMEDIO (PROMEDIO EN DÍAS DE ATENCIÓN Y RECAUDACIÓN DIARIA)
            // -------------------------------------------------------------
            Row rProm = sheet.createRow(rowIdx);
            rProm.setHeightInPoints(22);

            CellStyle stylePromNum = wb.createCellStyle();
            stylePromNum.setFont(fontBold);
            stylePromNum.setAlignment(HorizontalAlignment.CENTER);
            stylePromNum.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            stylePromNum.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(stylePromNum);

            CellStyle stylePromCurrency = wb.createCellStyle();
            stylePromCurrency.setFont(fontBold);
            stylePromCurrency.setAlignment(HorizontalAlignment.RIGHT);
            stylePromCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            stylePromCurrency.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            stylePromCurrency.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(stylePromCurrency);

            crearCeldaConBorde(rProm, 0, "PROMEDIO", stylePromNum);

            // Col 1 DÍAS: Promedio diario de pacientes atendidos
            Cell cPromDias = rProm.createCell(1);
            cPromDias.setCellValue(tot.getPromedioDiarioAtencion() != null ? tot.getPromedioDiarioAtencion() : 0.0);
            cPromDias.setCellStyle(stylePromNum);

            // Columnas intermedias vacías / limpias
            for (int c = 2; c <= 13; c++) {
                crearCeldaConBorde(rProm, c, "", stylePromNum);
            }

            // Col 14: Promedio de recaudación diaria
            Cell cPromRec = rProm.createCell(14);
            double promRecValue = data.getPromedios().getTotalRecaudado() != null
                    ? data.getPromedios().getTotalRecaudado().doubleValue()
                    : 0.0;
            cPromRec.setCellValue(promRecValue);
            cPromRec.setCellStyle(stylePromCurrency);

            // Diagnósticos vacíos en fila de promedio
            for (int i = 0; i < totalDiagCols; i++) {
                crearCeldaConBorde(rProm, 15 + i, "", stylePromNum);
            }

            // Anchos de columnas
            sheet.setColumnWidth(0, 3200);  // FECHA
            sheet.setColumnWidth(1, 2800);  // DÍAS
            for (int c = 2; c <= 13; c++) {
                sheet.setColumnWidth(c, 2400);
            }
            sheet.setColumnWidth(14, 3800); // RECAUDADO
            for (int c = 15; c <= lastColIdx; c++) {
                sheet.setColumnWidth(c, 4200); // Diagnósticos legibles
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    /**
     * Genera el archivo Excel (.xlsx) con el Top N de diagnósticos más comunes
     * para el mes y año seleccionados.
     */
    @Transactional(readOnly = true)
    public byte[] generarExcelTopDiagnosticos(int anio, int mes, int limite) throws IOException {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        List<Consulta> consultasMes = consultaRepository.findByFechaConsultaBetweenOrderByFechaConsultaAsc(inicioMes, finMes);
        List<Long> idsConsultasMes = consultasMes.stream()
                .map(Consulta::getIdConsulta)
                .filter(Objects::nonNull)
                .toList();

        List<DashboardHospitalarioResponse.ItemTopDiagnostico> topDiagnosticos = Collections.emptyList();
        if (!idsConsultasMes.isEmpty()) {
            List<Diagnostico> todosDiag = diagnosticoRepository.findByConsulta_IdConsultaIn(idsConsultasMes);

            Map<String, List<Diagnostico>> diagPorClave = todosDiag.stream()
                    .filter(d -> (d.getCodigoCie10() != null && !d.getCodigoCie10().isBlank()) || (d.getDescripcion() != null && !d.getDescripcion().isBlank()))
                    .collect(Collectors.groupingBy(d -> {
                        if (d.getCodigoCie10() != null && !d.getCodigoCie10().isBlank()) {
                            return d.getCodigoCie10().trim().toUpperCase();
                        }
                        return d.getDescripcion().trim().toUpperCase();
                    }));

            topDiagnosticos = diagPorClave.entrySet().stream()
                    .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                    .limit(limite)
                    .map(entry -> {
                        List<Diagnostico> lista = entry.getValue();
                        Diagnostico primer = lista.get(0);
                        String cod = (primer.getCodigoCie10() != null && !primer.getCodigoCie10().isBlank())
                                ? primer.getCodigoCie10()
                                : "S/C";
                        String desc = (primer.getDescripcion() != null && !primer.getDescripcion().isBlank())
                                ? primer.getDescripcion()
                                : "Sin descripción";
                        long cant = lista.size();

                        return DashboardHospitalarioResponse.ItemTopDiagnostico.builder()
                                .codigo(cod)
                                .descripcion(desc)
                                .cantidad(cant)
                                .build();
                    })
                    .toList();
        }

        String[] nombresMeses = {
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        };
        String nombreMes = (mes >= 1 && mes <= 12) ? nombresMeses[mes - 1] : String.valueOf(mes);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Top Diagnósticos");
            sheet.setDisplayGridlines(true);

            // Fuente Negrita
            Font fontBold = wb.createFont();
            fontBold.setBold(true);

            // Fuente Título Principal
            Font fontHeaderTitle = wb.createFont();
            fontHeaderTitle.setBold(true);
            fontHeaderTitle.setFontHeightInPoints((short) 12);
            fontHeaderTitle.setColor(IndexedColors.WHITE.getIndex());

            // Fuente Subtítulo
            Font fontSubTitle = wb.createFont();
            fontSubTitle.setFontHeightInPoints((short) 10);
            fontSubTitle.setColor(IndexedColors.BLACK.getIndex());
            fontSubTitle.setBold(true);

            // Fuente Cabecera Columnas
            Font fontColHeader = wb.createFont();
            fontColHeader.setBold(true);
            fontColHeader.setFontHeightInPoints((short) 11);
            fontColHeader.setColor(IndexedColors.WHITE.getIndex());

            // Fuente Normal
            Font fontRegular = wb.createFont();
            fontRegular.setFontHeightInPoints((short) 10);

            // Estilo Título Principal
            CellStyle styleMainTitle = wb.createCellStyle();
            styleMainTitle.setFont(fontHeaderTitle);
            styleMainTitle.setAlignment(HorizontalAlignment.CENTER);
            styleMainTitle.setVerticalAlignment(VerticalAlignment.CENTER);
            styleMainTitle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            styleMainTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleMainTitle);

            // Estilo Subtítulo
            CellStyle styleSubTitle = wb.createCellStyle();
            styleSubTitle.setFont(fontSubTitle);
            styleSubTitle.setAlignment(HorizontalAlignment.CENTER);
            styleSubTitle.setVerticalAlignment(VerticalAlignment.CENTER);
            styleSubTitle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            styleSubTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleSubTitle);

            // Estilo Encabezado Columnas
            CellStyle styleColHeader = wb.createCellStyle();
            styleColHeader.setFont(fontColHeader);
            styleColHeader.setAlignment(HorizontalAlignment.CENTER);
            styleColHeader.setVerticalAlignment(VerticalAlignment.CENTER);
            styleColHeader.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            styleColHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleColHeader);

            // Estilos Celdas de Datos
            CellStyle styleTextLeft = wb.createCellStyle();
            styleTextLeft.setFont(fontRegular);
            styleTextLeft.setAlignment(HorizontalAlignment.LEFT);
            styleTextLeft.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleTextLeft);

            CellStyle styleNumCenter = wb.createCellStyle();
            styleNumCenter.setFont(fontRegular);
            styleNumCenter.setAlignment(HorizontalAlignment.CENTER);
            styleNumCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleNumCenter);

            // Estilos Fila Total
            CellStyle styleTotalText = wb.createCellStyle();
            styleTotalText.setFont(fontBold);
            styleTotalText.setAlignment(HorizontalAlignment.RIGHT);
            styleTotalText.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTotalText.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            styleTotalText.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTotalText);

            CellStyle styleTotalNum = wb.createCellStyle();
            styleTotalNum.setFont(fontBold);
            styleTotalNum.setAlignment(HorizontalAlignment.CENTER);
            styleTotalNum.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTotalNum.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            styleTotalNum.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTotalNum);

            // Fila 0: Título Principal
            Row row0 = sheet.createRow(0);
            row0.setHeightInPoints(32);
            crearCeldaConBorde(row0, 0, "Diagnósticos Más Comunes del Programa de salud HYMA", styleMainTitle);
            crearCeldaConBorde(row0, 1, "", styleMainTitle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

            // Fila 1: Subtítulo de Período
            Row row1 = sheet.createRow(1);
            row1.setHeightInPoints(22);
            crearCeldaConBorde(row1, 0, "Período: " + nombreMes + " " + anio, styleSubTitle);
            crearCeldaConBorde(row1, 1, "", styleSubTitle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 1));

            // Fila 2: Encabezados de Tabla
            Row row2 = sheet.createRow(2);
            row2.setHeightInPoints(26);
            crearCeldaConBorde(row2, 0, "Diagnósticos", styleColHeader);
            crearCeldaConBorde(row2, 1, "Pacientes", styleColHeader);

            int currentRowIdx = 3;
            long totalPacientes = 0;

            if (topDiagnosticos.isEmpty()) {
                Row rowEmpty = sheet.createRow(currentRowIdx++);
                rowEmpty.setHeightInPoints(22);
                crearCeldaConBorde(rowEmpty, 0, "No se registraron diagnósticos en este mes", styleTextLeft);
                crearCeldaNumerica(rowEmpty, 1, 0, styleNumCenter);
            } else {
                for (DashboardHospitalarioResponse.ItemTopDiagnostico item : topDiagnosticos) {
                    Row rowData = sheet.createRow(currentRowIdx++);
                    rowData.setHeightInPoints(22);
                    crearCeldaConBorde(rowData, 0, item.getDescripcion(), styleTextLeft);
                    crearCeldaNumerica(rowData, 1, (int) item.getCantidad(), styleNumCenter);
                    totalPacientes += item.getCantidad();
                }

                // Fila Total
                Row rowTotal = sheet.createRow(currentRowIdx);
                rowTotal.setHeightInPoints(24);
                crearCeldaConBorde(rowTotal, 0, "TOTAL", styleTotalText);
                crearCeldaNumerica(rowTotal, 1, (int) totalPacientes, styleTotalNum);
            }

            // Anchos de Columna
            sheet.setColumnWidth(0, 16000); // Diagnósticos con suficiente espacio
            sheet.setColumnWidth(1, 4500);  // Pacientes

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    private byte[] hexToRgb(String hex) {
        if (hex == null || !hex.startsWith("#") || hex.length() < 7) {
            return new byte[]{(byte) 252, (byte) 228, (byte) 214};
        }
        try {
            int r = Integer.parseInt(hex.substring(1, 3), 16);
            int g = Integer.parseInt(hex.substring(3, 5), 16);
            int b = Integer.parseInt(hex.substring(5, 7), 16);
            return new byte[]{(byte) r, (byte) g, (byte) b};
        } catch (Exception e) {
            return new byte[]{(byte) 252, (byte) 228, (byte) 214};
        }
    }

    private void crearCeldaConBorde(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private void crearCeldaNumerica(Row row, int col, int value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    @Transactional(readOnly = true)
    public DashboardHospitalarioResponse generarDashboardHospitalario(int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioHoy = hoy.atStartOfDay();

        // 1. Consultas del mes
        List<Consulta> consultasMes = consultaRepository.findByFechaConsultaBetweenOrderByFechaConsultaAsc(inicioMes, finMes);
        long totalConsultasMes = consultasMes.size();

        // Determinar Nuevos vs Reconsulta
        Map<Long, LocalDateTime> primerConsultaMap = new HashMap<>();
        try {
            List<Object[]> minConsultas = consultaRepository.findMinFechaConsultaPorPaciente();
            for (Object[] row : minConsultas) {
                if (row == null || row.length < 2 || row[0] == null) continue;

                Long idPac = null;
                if (row[0] instanceof Number num) {
                    idPac = num.longValue();
                } else {
                    try {
                        idPac = Long.valueOf(row[0].toString());
                    } catch (Exception ignored) {}
                }

                LocalDateTime minFecha = null;
                if (row[1] instanceof LocalDateTime ldt) {
                    minFecha = ldt;
                } else if (row[1] instanceof java.sql.Timestamp ts) {
                    minFecha = ts.toLocalDateTime();
                } else if (row[1] instanceof java.util.Date d) {
                    minFecha = d.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
                } else if (row[1] != null) {
                    try {
                        minFecha = LocalDateTime.parse(row[1].toString().replace(" ", "T"));
                    } catch (Exception ignored) {}
                }

                if (idPac != null && minFecha != null) {
                    primerConsultaMap.put(idPac, minFecha);
                }
            }
        } catch (Exception ex) {
            log.warn("Error calculando primer consulta para dashboard: {}", ex.getMessage());
        }

        long pacientesNuevos = 0;
        long pacientesReconsulta = 0;

        for (Consulta c : consultasMes) {
            if (c.getPaciente() != null && c.getPaciente().getIdPaciente() != null) {
                LocalDateTime minFecha = primerConsultaMap.get(c.getPaciente().getIdPaciente());
                if (minFecha == null || !minFecha.isBefore(inicioMes)) {
                    pacientesNuevos++;
                } else {
                    pacientesReconsulta++;
                }
            }
        }

        double pctNuevos = totalConsultasMes > 0 ? Math.round((pacientesNuevos * 1000.0) / totalConsultasMes) / 10.0 : 0.0;
        double pctReconsulta = totalConsultasMes > 0 ? Math.round((pacientesReconsulta * 1000.0) / totalConsultasMes) / 10.0 : 0.0;

        // 2. Pacientes hoy y Cola de atención
        List<ColaAtencion> todasCola = colaAtencionRepository.findAll();
        long atendidosHoy = todasCola.stream()
                .filter(c -> c.getEstado() == EstadoCola.FINALIZADO && c.getFechaAtencion() != null && !c.getFechaAtencion().isBefore(inicioHoy))
                .count();

        long enEsperaPreconsulta = todasCola.stream()
                .filter(c -> c.getEstado() == EstadoCola.PENDIENTE || c.getEstado() == EstadoCola.EN_PRECONSULTA)
                .count();

        long enEsperaClinica = todasCola.stream()
                .filter(c -> c.getEstado() == EstadoCola.ESPERA_CONSULTA || c.getEstado() == EstadoCola.EN_CONSULTA)
                .count();

        long enEsperaFarmacia = todasCola.stream()
                .filter(c -> c.getEstado() == EstadoCola.EN_FARMACIA)
                .count();

        long enEsperaHoy = enEsperaPreconsulta + enEsperaClinica + enEsperaFarmacia;

        // 3. Recaudación y Salidas
        List<Long> idsConsultasMes = consultasMes.stream()
                .map(Consulta::getIdConsulta)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        BigDecimal totalRecaudacionConsultas = BigDecimal.ZERO;
        BigDecimal totalRecaudacionMeds = BigDecimal.ZERO;

        Map<Long, Long> unidadesPorMedicamento = new HashMap<>();
        Map<Long, BigDecimal> montoPorMedicamento = new HashMap<>();
        Map<Long, Medicamento> medObjMap = new HashMap<>();

        if (!idsConsultasMes.isEmpty()) {
            List<SalidaMedicamento> salidas = salidaMedicamentoRepository.findByConsulta_IdConsultaIn(idsConsultasMes);
            Map<Long, SalidaMedicamento> salidaMap = salidas.stream().collect(Collectors.toMap(SalidaMedicamento::getIdSalida, s -> s, (s1, s2) -> s1));
            for (SalidaMedicamento s : salidas) {
                boolean esCasoEsp = "CASO_ESPECIAL".equalsIgnoreCase(s.getTipoSalida());
                if (!esCasoEsp && s.getCostoConsulta() != null) {
                    totalRecaudacionConsultas = totalRecaudacionConsultas.add(s.getCostoConsulta());
                }
            }

            List<Long> idsSalidas = salidas.stream().map(SalidaMedicamento::getIdSalida).filter(Objects::nonNull).toList();
            if (!idsSalidas.isEmpty()) {
                List<DetalleSalidaMedicamento> detalles = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidas);
                for (DetalleSalidaMedicamento d : detalles) {
                    int cant = d.getCantidad() != null ? d.getCantidad() : 0;
                    BigDecimal pUnit = d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO;
                    BigDecimal sub = pUnit.multiply(BigDecimal.valueOf(cant));

                    SalidaMedicamento parent = d.getSalida() != null ? salidaMap.get(d.getSalida().getIdSalida()) : null;
                    boolean esCasoEsp = parent != null && "CASO_ESPECIAL".equalsIgnoreCase(parent.getTipoSalida());
                    if (!esCasoEsp) {
                        totalRecaudacionMeds = totalRecaudacionMeds.add(sub);
                    }

                    LoteMedicamento l = d.getLote();
                    Medicamento m = l != null ? l.getMedicamento() : null;
                    if (m != null && m.getIdMedicamento() != null) {
                        Long medId = m.getIdMedicamento();
                        medObjMap.putIfAbsent(medId, m);
                        unidadesPorMedicamento.put(medId, unidadesPorMedicamento.getOrDefault(medId, 0L) + cant);
                        montoPorMedicamento.put(medId, montoPorMedicamento.getOrDefault(medId, BigDecimal.ZERO).add(sub));
                    }
                }
            }
        }

        // Salidas externas (sin consulta) para el dashboard
        List<SalidaMedicamento> salidasExtDash = salidaMedicamentoRepository.findByTipoSalidaIgnoreCaseAndFechaSalidaBetweenOrderByFechaSalidaDesc("VENTA_EXTERNA", inicioMes, finMes);
        if (salidasExtDash != null && !salidasExtDash.isEmpty()) {
            List<Long> idsSalidasExt = salidasExtDash.stream().map(SalidaMedicamento::getIdSalida).filter(Objects::nonNull).toList();
            if (!idsSalidasExt.isEmpty()) {
                List<DetalleSalidaMedicamento> detallesExt = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidasExt);
                for (DetalleSalidaMedicamento d : detallesExt) {
                    int cant = d.getCantidad() != null ? d.getCantidad() : 0;
                    BigDecimal pUnit = d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO;
                    BigDecimal sub = pUnit.multiply(BigDecimal.valueOf(cant));
                    totalRecaudacionMeds = totalRecaudacionMeds.add(sub);

                    LoteMedicamento l = d.getLote();
                    Medicamento m = l != null ? l.getMedicamento() : null;
                    if (m != null && m.getIdMedicamento() != null) {
                        Long medId = m.getIdMedicamento();
                        medObjMap.putIfAbsent(medId, m);
                        unidadesPorMedicamento.put(medId, unidadesPorMedicamento.getOrDefault(medId, 0L) + cant);
                        montoPorMedicamento.put(medId, montoPorMedicamento.getOrDefault(medId, BigDecimal.ZERO).add(sub));
                    }
                }
            }
        }

        BigDecimal recaudacionTotal = totalRecaudacionConsultas.add(totalRecaudacionMeds);

        // 4. Alertas de inventario
        long lotesPorVencer30 = loteMedicamentoRepository.countByEstadoAndFechaExpiracionBetween(
                EstadoLote.ACTIVO, hoy, hoy.plusDays(30)
        );

        List<LoteMedicamento> lotesActivos = loteMedicamentoRepository.buscar(EstadoLote.ACTIVO, null, null);
        Set<Long> medsConStock = lotesActivos.stream()
                .filter(l -> l.getCantidadInicial() != null && l.getCantidadInicial() > 0)
                .map(l -> l.getMedicamento() != null ? l.getMedicamento().getIdMedicamento() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        long totalMedicamentosCatalogo = medicamentoRepository.count();
        long medicamentosAgotados = Math.max(0, totalMedicamentosCatalogo - medsConStock.size());

        // 5. Top 10 Diagnósticos
        List<DashboardHospitalarioResponse.ItemTopDiagnostico> topDiagnosticos = Collections.emptyList();
        if (!idsConsultasMes.isEmpty()) {
            List<Diagnostico> todosDiag = diagnosticoRepository.findByConsulta_IdConsultaIn(idsConsultasMes);
            long totalDiag = todosDiag.size();

            Map<String, List<Diagnostico>> diagPorClave = todosDiag.stream()
                    .filter(d -> (d.getCodigoCie10() != null && !d.getCodigoCie10().isBlank()) || (d.getDescripcion() != null && !d.getDescripcion().isBlank()))
                    .collect(Collectors.groupingBy(d -> {
                        if (d.getCodigoCie10() != null && !d.getCodigoCie10().isBlank()) {
                            return d.getCodigoCie10().trim().toUpperCase();
                        }
                        return d.getDescripcion().trim().toUpperCase();
                    }));

            topDiagnosticos = diagPorClave.entrySet().stream()
                    .sorted((a, b) -> Integer.compare(b.getValue().size(), a.getValue().size()))
                    .limit(10)
                    .map(entry -> {
                        List<Diagnostico> lista = entry.getValue();
                        Diagnostico primer = lista.get(0);
                        String cod = (primer.getCodigoCie10() != null && !primer.getCodigoCie10().isBlank())
                                ? primer.getCodigoCie10()
                                : "S/C";
                        String desc = (primer.getDescripcion() != null && !primer.getDescripcion().isBlank())
                                ? primer.getDescripcion()
                                : "Sin descripción";
                        String cat = (primer.getCategoria() != null && primer.getCategoria().getNombre() != null)
                                ? primer.getCategoria().getNombre()
                                : "General";
                        long cant = lista.size();
                        double pct = totalDiag > 0 ? Math.round((cant * 1000.0) / totalDiag) / 10.0 : 0.0;

                        return DashboardHospitalarioResponse.ItemTopDiagnostico.builder()
                                .codigo(cod)
                                .descripcion(desc)
                                .categoria(cat)
                                .cantidad(cant)
                                .porcentaje(pct)
                                .build();
                    })
                    .toList();
        }

        // 6. Demografía (Sexo y Edad)
        Map<Long, Paciente> pacientesUnicos = new HashMap<>();
        for (Consulta c : consultasMes) {
            if (c.getPaciente() != null && c.getPaciente().getIdPaciente() != null) {
                pacientesUnicos.putIfAbsent(c.getPaciente().getIdPaciente(), c.getPaciente());
            }
        }

        long totalPacientes = pacientesUnicos.size();
        long hombres = 0;
        long mujeres = 0;
        long pediatricos = 0;
        long jovenes = 0;
        long adultos = 0;
        long adultosMayores = 0;

        for (Paciente p : pacientesUnicos.values()) {
            if (p.getSexo() == Sexo.M) hombres++;
            else if (p.getSexo() == Sexo.F) mujeres++;

            if (p.getFechaNacimiento() != null) {
                int edad = Period.between(p.getFechaNacimiento(), hoy).getYears();
                if (edad <= 12) pediatricos++;
                else if (edad <= 18) jovenes++;
                else if (edad <= 59) adultos++;
                else adultosMayores++;
            }
        }

        double pctH = totalPacientes > 0 ? Math.round((hombres * 1000.0) / totalPacientes) / 10.0 : 0.0;
        double pctM = totalPacientes > 0 ? Math.round((mujeres * 1000.0) / totalPacientes) / 10.0 : 0.0;

        double pctPed = totalPacientes > 0 ? Math.round((pediatricos * 1000.0) / totalPacientes) / 10.0 : 0.0;
        double pctJov = totalPacientes > 0 ? Math.round((jovenes * 1000.0) / totalPacientes) / 10.0 : 0.0;
        double pctAdu = totalPacientes > 0 ? Math.round((adultos * 1000.0) / totalPacientes) / 10.0 : 0.0;
        double pctMay = totalPacientes > 0 ? Math.round((adultosMayores * 1000.0) / totalPacientes) / 10.0 : 0.0;

        DashboardHospitalarioResponse.DemografiaDashboard demografia = DashboardHospitalarioResponse.DemografiaDashboard.builder()
                .totalPacientes(totalPacientes)
                .hombres(hombres)
                .porcentajeHombres(pctH)
                .mujeres(mujeres)
                .porcentajeMujeres(pctM)
                .pediatricos(pediatricos)
                .porcentajePediatricos(pctPed)
                .jovenes(jovenes)
                .porcentajeJovenes(pctJov)
                .adultos(adultos)
                .porcentajeAdultos(pctAdu)
                .adultosMayores(adultosMayores)
                .porcentajeAdultosMayores(pctMay)
                .build();

        // 7. Top 10 Medicamentos
        List<DashboardHospitalarioResponse.ItemTopMedicamento> topMedicamentos = unidadesPorMedicamento.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(10)
                .map(entry -> {
                    Long medId = entry.getKey();
                    Medicamento m = medObjMap.get(medId);
                    String nombre = m != null ? m.getNombre() : "Medicamento";
                    String pres = m != null ? m.getPresentacion() : "";
                    String conc = m != null ? m.getConcentracion() : "";
                    String cat = (m != null && m.getCategoria() != null) ? m.getCategoria().getNombre() : "Farmacia";

                    return DashboardHospitalarioResponse.ItemTopMedicamento.builder()
                            .idMedicamento(medId)
                            .nombre(nombre)
                            .presentacion(pres)
                            .concentracion(conc)
                            .categoria(cat)
                            .unidadesDispensadas(entry.getValue())
                            .totalGenerado(montoPorMedicamento.getOrDefault(medId, BigDecimal.ZERO))
                            .build();
                })
                .toList();

        // 8. Construir respuesta final
        DashboardHospitalarioResponse.KpisDashboard kpis = DashboardHospitalarioResponse.KpisDashboard.builder()
                .pacientesMesTotal(totalConsultasMes)
                .pacientesNuevos(pacientesNuevos)
                .pacientesReconsulta(pacientesReconsulta)
                .porcentajeNuevos(pctNuevos)
                .porcentajeReconsulta(pctReconsulta)
                .atendidosHoy(atendidosHoy)
                .enEsperaHoy(enEsperaHoy)
                .enEsperaPreconsulta(enEsperaPreconsulta)
                .enEsperaClinica(enEsperaClinica)
                .enEsperaFarmacia(enEsperaFarmacia)
                .recaudacionMesTotal(recaudacionTotal)
                .recaudacionConsultas(totalRecaudacionConsultas)
                .recaudacionMedicamentos(totalRecaudacionMeds)
                .medicamentosAgotados(medicamentosAgotados)
                .lotesPorVencer30Dias(lotesPorVencer30)
                .build();

        return DashboardHospitalarioResponse.builder()
                .anio(anio)
                .mes(mes)
                .kpis(kpis)
                .topDiagnosticos(topDiagnosticos)
                .demografia(demografia)
                .topMedicamentos(topMedicamentos)
                .build();
    }

    /**
     * Genera el listado estructurado de Casos Especiales (Exoneraciones) para el mes y año dados.
     */
    @Transactional(readOnly = true)
    public ReporteCasosEspecialesResponse generarReporteCasosEspeciales(int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        List<SalidaMedicamento> salidas = salidaMedicamentoRepository
                .findByTipoSalidaIgnoreCaseAndFechaSalidaBetweenOrderByFechaSalidaDesc("CASO_ESPECIAL", inicioMes, finMes);

        List<ReporteCasosEspecialesResponse.ItemCasoEspecial> items = new ArrayList<>();
        BigDecimal totalMontoExonerado = BigDecimal.ZERO;
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        for (SalidaMedicamento s : salidas) {
            Consulta c = s.getConsulta();
            Paciente p = c != null ? c.getPaciente() : null;

            String nombrePac = p != null
                    ? (p.getNombres() + " " + p.getApellidos()).trim()
                    : "Paciente Desconocido";

            Integer edad = null;
            if (p != null && p.getFechaNacimiento() != null) {
                edad = Period.between(p.getFechaNacimiento(), LocalDate.now()).getYears();
            }

            String sexo = (p != null && p.getSexo() != null) ? p.getSexo().toString() : "N/E";

            // Diagnósticos de la consulta
            List<String> diagnosticos = Collections.emptyList();
            if (c != null && c.getIdConsulta() != null) {
                diagnosticos = diagnosticoRepository.findByConsulta_IdConsulta(c.getIdConsulta()).stream()
                        .map(d -> (d.getDescripcion() != null && !d.getDescripcion().isBlank())
                                ? d.getDescripcion()
                                : (d.getCodigoCie10() != null ? d.getCodigoCie10() : "Sin diagnóstico"))
                        .toList();
            }

            // Medicamentos dispensados en esta salida
            List<DetalleSalidaMedicamento> detalles = detalleSalidaMedicamentoRepository.findBySalida_IdSalida(s.getIdSalida());
            List<ReporteCasosEspecialesResponse.MedicamentoItem> medItems = new ArrayList<>();
            BigDecimal subtotalMeds = BigDecimal.ZERO;

            for (DetalleSalidaMedicamento det : detalles) {
                int cant = det.getCantidad() != null ? det.getCantidad() : 0;
                BigDecimal pUnit = det.getPrecioUnitario() != null ? det.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal sub = pUnit.multiply(BigDecimal.valueOf(cant));
                subtotalMeds = subtotalMeds.add(sub);

                Medicamento m = (det.getLote() != null) ? det.getLote().getMedicamento() : null;
                medItems.add(ReporteCasosEspecialesResponse.MedicamentoItem.builder()
                        .nombre(m != null ? m.getNombre() : "Medicamento")
                        .presentacion(m != null ? m.getPresentacion() : "")
                        .concentracion(m != null ? m.getConcentracion() : "")
                        .cantidad(cant)
                        .precioUnitario(pUnit)
                        .subtotal(sub)
                        .build());
            }

            BigDecimal subtotalConsulta = (c != null && c.getPrecioConsulta() != null)
                    ? c.getPrecioConsulta()
                    : BigDecimal.ZERO;

            BigDecimal totalCaso = subtotalMeds.add(subtotalConsulta);
            totalMontoExonerado = totalMontoExonerado.add(totalCaso);

            items.add(ReporteCasosEspecialesResponse.ItemCasoEspecial.builder()
                    .idSalida(s.getIdSalida())
                    .idConsulta(c != null ? c.getIdConsulta() : null)
                    .idPaciente(p != null ? p.getIdPaciente() : null)
                    .fecha(s.getFechaSalida() != null ? s.getFechaSalida().format(dtf) : "")
                    .nombrePaciente(nombrePac)
                    .edad(edad)
                    .sexo(sexo)
                    .diagnosticos(diagnosticos)
                    .medicamentos(medItems)
                    .subtotalConsulta(subtotalConsulta)
                    .subtotalMedicamentos(subtotalMeds)
                    .totalExonerado(totalCaso)
                    .observaciones(s.getObservaciones() != null ? s.getObservaciones() : "")
                    .build());
        }

        return ReporteCasosEspecialesResponse.builder()
                .anio(anio)
                .mes(mes)
                .totalCasos(items.size())
                .totalMontoExonerado(totalMontoExonerado)
                .items(items)
                .build();
    }

    /**
     * Genera el archivo Excel (.xlsx) con el listado detallado de Casos Especiales.
     */
    @Transactional(readOnly = true)
    public byte[] generarExcelCasosEspeciales(int anio, int mes) throws IOException {
        ReporteCasosEspecialesResponse data = generarReporteCasosEspeciales(anio, mes);

        String[] nombresMeses = {
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        };
        String nombreMes = (mes >= 1 && mes <= 12) ? nombresMeses[mes - 1] : String.valueOf(mes);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Casos Especiales");
            sheet.setDisplayGridlines(true);

            Font fontBold = wb.createFont();
            fontBold.setBold(true);

            Font fontHeaderTitle = wb.createFont();
            fontHeaderTitle.setBold(true);
            fontHeaderTitle.setFontHeightInPoints((short) 12);
            fontHeaderTitle.setColor(IndexedColors.WHITE.getIndex());

            Font fontSubTitle = wb.createFont();
            fontSubTitle.setFontHeightInPoints((short) 10);
            fontSubTitle.setColor(IndexedColors.BLACK.getIndex());
            fontSubTitle.setBold(true);

            Font fontColHeader = wb.createFont();
            fontColHeader.setBold(true);
            fontColHeader.setFontHeightInPoints((short) 10);
            fontColHeader.setColor(IndexedColors.WHITE.getIndex());

            Font fontRegular = wb.createFont();
            fontRegular.setFontHeightInPoints((short) 10);

            // Estilos
            CellStyle styleMainTitle = wb.createCellStyle();
            styleMainTitle.setFont(fontHeaderTitle);
            styleMainTitle.setAlignment(HorizontalAlignment.CENTER);
            styleMainTitle.setVerticalAlignment(VerticalAlignment.CENTER);
            styleMainTitle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            styleMainTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleMainTitle);

            CellStyle styleSubTitle = wb.createCellStyle();
            styleSubTitle.setFont(fontSubTitle);
            styleSubTitle.setAlignment(HorizontalAlignment.CENTER);
            styleSubTitle.setVerticalAlignment(VerticalAlignment.CENTER);
            styleSubTitle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            styleSubTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleSubTitle);

            CellStyle styleColHeader = wb.createCellStyle();
            styleColHeader.setFont(fontColHeader);
            styleColHeader.setAlignment(HorizontalAlignment.CENTER);
            styleColHeader.setVerticalAlignment(VerticalAlignment.CENTER);
            styleColHeader.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            styleColHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleColHeader);

            CellStyle styleTextLeft = wb.createCellStyle();
            styleTextLeft.setFont(fontRegular);
            styleTextLeft.setAlignment(HorizontalAlignment.LEFT);
            styleTextLeft.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleTextLeft);

            CellStyle styleTextCenter = wb.createCellStyle();
            styleTextCenter.setFont(fontRegular);
            styleTextCenter.setAlignment(HorizontalAlignment.CENTER);
            styleTextCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleTextCenter);

            CellStyle styleCurrency = wb.createCellStyle();
            styleCurrency.setFont(fontRegular);
            styleCurrency.setAlignment(HorizontalAlignment.RIGHT);
            styleCurrency.setVerticalAlignment(VerticalAlignment.CENTER);
            DataFormat df = wb.createDataFormat();
            styleCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            setBorders(styleCurrency);

            CellStyle styleTotalLabel = wb.createCellStyle();
            styleTotalLabel.setFont(fontBold);
            styleTotalLabel.setAlignment(HorizontalAlignment.RIGHT);
            styleTotalLabel.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTotalLabel.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            styleTotalLabel.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTotalLabel);

            CellStyle styleTotalCurrency = wb.createCellStyle();
            styleTotalCurrency.setFont(fontBold);
            styleTotalCurrency.setAlignment(HorizontalAlignment.RIGHT);
            styleTotalCurrency.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTotalCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            styleTotalCurrency.setFillForegroundColor(IndexedColors.LIGHT_TURQUOISE.getIndex());
            styleTotalCurrency.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTotalCurrency);

            // Fila 0: Título Principal
            Row row0 = sheet.createRow(0);
            row0.setHeightInPoints(32);
            for (int c = 0; c <= 6; c++) {
                crearCeldaConBorde(row0, c, c == 0 ? "Reporte de Casos Especiales (Exoneraciones) - HYMA" : "", styleMainTitle);
            }
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 6));

            // Fila 1: Subtítulo
            Row row1 = sheet.createRow(1);
            row1.setHeightInPoints(22);
            for (int c = 0; c <= 6; c++) {
                crearCeldaConBorde(row1, c, c == 0 ? "Período: " + nombreMes + " " + anio : "", styleSubTitle);
            }
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 6));

            // Fila 2: Cabeceras
            Row row2 = sheet.createRow(2);
            row2.setHeightInPoints(26);
            crearCeldaConBorde(row2, 0, "FECHA", styleColHeader);
            crearCeldaConBorde(row2, 1, "PACIENTE", styleColHeader);
            crearCeldaConBorde(row2, 2, "EDAD", styleColHeader);
            crearCeldaConBorde(row2, 3, "GÉNERO", styleColHeader);
            crearCeldaConBorde(row2, 4, "DIAGNÓSTICOS", styleColHeader);
            crearCeldaConBorde(row2, 5, "MEDICAMENTOS ENTREGADOS", styleColHeader);
            crearCeldaConBorde(row2, 6, "TOTAL EXONERADO", styleColHeader);

            int currentIdx = 3;
            if (data.getItems().isEmpty()) {
                Row emptyRow = sheet.createRow(currentIdx++);
                emptyRow.setHeightInPoints(24);
                crearCeldaConBorde(emptyRow, 0, "No se registraron casos especiales en este período", styleTextLeft);
                for (int c = 1; c <= 6; c++) {
                    crearCeldaConBorde(emptyRow, c, "", styleTextLeft);
                }
                sheet.addMergedRegion(new CellRangeAddress(3, 3, 0, 6));
            } else {
                for (ReporteCasosEspecialesResponse.ItemCasoEspecial item : data.getItems()) {
                    Row r = sheet.createRow(currentIdx++);
                    r.setHeightInPoints(22);

                    crearCeldaConBorde(r, 0, item.getFecha(), styleTextCenter);
                    crearCeldaConBorde(r, 1, item.getNombrePaciente(), styleTextLeft);
                    crearCeldaConBorde(r, 2, item.getEdad() != null ? String.valueOf(item.getEdad()) : "-", styleTextCenter);
                    crearCeldaConBorde(r, 3, item.getSexo() != null ? item.getSexo() : "-", styleTextCenter);

                    String diagsText = item.getDiagnosticos() != null && !item.getDiagnosticos().isEmpty()
                            ? String.join(", ", item.getDiagnosticos())
                            : "Sin diagnósticos";
                    crearCeldaConBorde(r, 4, diagsText, styleTextLeft);

                    String medsText = item.getMedicamentos() != null && !item.getMedicamentos().isEmpty()
                            ? item.getMedicamentos().stream()
                                    .map(m -> m.getCantidad() + "x " + m.getNombre() + " (" + m.getPresentacion() + ")")
                                    .collect(Collectors.joining(", "))
                            : "Ninguno";
                    crearCeldaConBorde(r, 5, medsText, styleTextLeft);

                    Cell cVal = r.createCell(6);
                    double val = item.getTotalExonerado() != null ? item.getTotalExonerado().doubleValue() : 0.0;
                    cVal.setCellValue(val);
                    cVal.setCellStyle(styleCurrency);
                }

                // Fila Total
                Row rTotal = sheet.createRow(currentIdx);
                rTotal.setHeightInPoints(25);
                for (int c = 0; c <= 5; c++) {
                    crearCeldaConBorde(rTotal, c, c == 5 ? "TOTAL GENERAL EXONERADO" : "", styleTotalLabel);
                }
                sheet.addMergedRegion(new CellRangeAddress(currentIdx, currentIdx, 0, 5));

                Cell cTotalVal = rTotal.createCell(6);
                double totalVal = data.getTotalMontoExonerado() != null ? data.getTotalMontoExonerado().doubleValue() : 0.0;
                cTotalVal.setCellValue(totalVal);
                cTotalVal.setCellStyle(styleTotalCurrency);
            }

            sheet.setColumnWidth(0, 4800);
            sheet.setColumnWidth(1, 9000);
            sheet.setColumnWidth(2, 2400);
            sheet.setColumnWidth(3, 2600);
            sheet.setColumnWidth(4, 9500);
            sheet.setColumnWidth(5, 13000);
            sheet.setColumnWidth(6, 4800);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    // ==========================================
    // REPORTE DE INVENTARIO FARMACIA (MENSUAL)
    // ==========================================

    @Transactional(readOnly = true)
    public ReporteInventarioFarmaciaResponse generarReporteInventarioFarmacia(int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59);

        // 1. Cargar entradas del mes por lote
        List<EntradaMedicamento> entradas = entradaMedicamentoRepository.buscarPorRango(inicioMes, finMes.plusSeconds(1));
        Map<Long, Integer> pedidosComprasPorLote = new HashMap<>();
        Map<Long, Integer> donacionesPorLote = new HashMap<>();

        if (entradas != null) {
            for (EntradaMedicamento e : entradas) {
                if (e.getDetalles() == null) continue;
                boolean esDonacion = e.getTipoEntrada() == TipoEntrada.DONACION;
                for (DetalleEntradaMedicamento det : e.getDetalles()) {
                    if (det != null && det.getLote() != null && det.getLote().getIdLote() != null) {
                        int cant = det.getCantidad() != null ? det.getCantidad() : 0;
                        if (esDonacion) {
                            donacionesPorLote.merge(det.getLote().getIdLote(), cant, Integer::sum);
                        } else {
                            pedidosComprasPorLote.merge(det.getLote().getIdLote(), cant, Integer::sum);
                        }
                    }
                }
            }
        }

        // 2. Cargar salidas del mes por semana y por lote
        List<SalidaMedicamento> salidas = salidaMedicamentoRepository.findByFechaSalidaBetweenOrderByFechaSalidaDesc(inicioMes, finMes);
        Map<Long, Integer> s1PorLote = new HashMap<>();
        Map<Long, Integer> s2PorLote = new HashMap<>();
        Map<Long, Integer> s3PorLote = new HashMap<>();
        Map<Long, Integer> s4PorLote = new HashMap<>();

        if (salidas != null && !salidas.isEmpty()) {
            List<Long> idsSalidas = salidas.stream().map(SalidaMedicamento::getIdSalida).filter(Objects::nonNull).toList();
            if (!idsSalidas.isEmpty()) {
                List<DetalleSalidaMedicamento> detallesSalida = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidas);
                for (DetalleSalidaMedicamento det : detallesSalida) {
                    if (det != null && det.getLote() != null && det.getLote().getIdLote() != null && det.getSalida() != null) {
                        LocalDateTime fSal = det.getSalida().getFechaSalida();
                        if (fSal != null) {
                            int dia = fSal.getDayOfMonth();
                            int cant = det.getCantidad() != null ? det.getCantidad() : 0;
                            long idLote = det.getLote().getIdLote();
                            if (dia <= 7) {
                                s1PorLote.merge(idLote, cant, Integer::sum);
                            } else if (dia <= 14) {
                                s2PorLote.merge(idLote, cant, Integer::sum);
                            } else if (dia <= 21) {
                                s3PorLote.merge(idLote, cant, Integer::sum);
                            } else {
                                s4PorLote.merge(idLote, cant, Integer::sum);
                            }
                        }
                    }
                }
            }
        }

        // 3. Obtener todos los lotes de medicamentos
        List<LoteMedicamento> lotes = loteMedicamentoRepository.findAll().stream()
                .sorted(Comparator
                        .comparing((LoteMedicamento l) -> l.getMedicamento() != null && l.getMedicamento().getNombre() != null ? l.getMedicamento().getNombre().toLowerCase() : "")
                        .thenComparing(l -> l.getFechaExpiracion() != null ? l.getFechaExpiracion() : LocalDate.MAX))
                .toList();

        DateTimeFormatter dtfExp = DateTimeFormatter.ofPattern("MMM-yy", Locale.forLanguageTag("es-GT"));
        DateTimeFormatter dtfCompleta = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        List<FilaReporteInventarioFarmacia> filas = new ArrayList<>();

        for (LoteMedicamento lote : lotes) {
            if (lote == null) continue;
            Medicamento m = lote.getMedicamento();
            if (m == null) continue;

            long idLote = lote.getIdLote();
            int pedidos = pedidosComprasPorLote.getOrDefault(idLote, 0);
            int donaciones = donacionesPorLote.getOrDefault(idLote, 0);
            int s1 = s1PorLote.getOrDefault(idLote, 0);
            int s2 = s2PorLote.getOrDefault(idLote, 0);
            int s3 = s3PorLote.getOrDefault(idLote, 0);
            int s4 = s4PorLote.getOrDefault(idLote, 0);
            int totalEntregado = s1 + s2 + s3 + s4;
            int vencido = 0;
            int saldoActual = lote.getCantidadInicial() != null ? lote.getCantidadInicial() : 0;

            int mesAnterior = Math.max(0, saldoActual - pedidos - donaciones + totalEntregado + vencido);
            int totalFisicoMes = mesAnterior + pedidos + donaciones;
            int inventarioFisico = saldoActual;
            int diferencia = saldoActual - inventarioFisico; // 0
            BigDecimal precioUnit = lote.getPrecioUnitario() != null ? lote.getPrecioUnitario() : BigDecimal.ZERO;
            BigDecimal total = BigDecimal.valueOf(diferencia).multiply(precioUnit);
            BigDecimal valorSaldoActual = BigDecimal.valueOf(saldoActual).multiply(precioUnit);

            String fechaExp = lote.getFechaExpiracion() != null ? lote.getFechaExpiracion().format(dtfExp).toLowerCase() : "S/F";
            String fechaExpComp = lote.getFechaExpiracion() != null ? lote.getFechaExpiracion().format(dtfCompleta) : "—";

            String nombreMed = m.getNombre() != null ? m.getNombre() : "—";
            if (m.getConcentracion() != null && !m.getConcentracion().isBlank() && !nombreMed.contains(m.getConcentracion())) {
                nombreMed = nombreMed + " " + m.getConcentracion();
            }

            String presentacion = m.getPresentacion() != null ? m.getPresentacion() : "—";
            String casa = m.getCasaFarmaceutica() != null && m.getCasaFarmaceutica().getNombre() != null
                    ? m.getCasaFarmaceutica().getNombre()
                    : "—";

            filas.add(FilaReporteInventarioFarmacia.builder()
                    .idMedicamento(m.getIdMedicamento())
                    .idLote(lote.getIdLote())
                    .numeroLote(lote.getNumeroLote())
                    .fechaExpiracion(fechaExp)
                    .fechaExpiracionCompleta(fechaExpComp)
                    .nombre(nombreMed)
                    .presentacion(presentacion)
                    .casaFarmaceutica(casa)
                    .totalFisicoMesAnterior(mesAnterior)
                    .pedidosCompras(pedidos)
                    .donaciones(donaciones)
                    .totalFisicoParaElMes(totalFisicoMes)
                    .semana1(s1)
                    .semana2(s2)
                    .semana3(s3)
                    .semana4(s4)
                    .medicamentoVencido(vencido)
                    .totalEntregado(totalEntregado)
                    .saldoActual(saldoActual)
                    .inventarioFisico(inventarioFisico)
                    .diferencia(diferencia)
                    .precioPorUnidad(precioUnit)
                    .total(total)
                    .valorSaldoActual(valorSaldoActual)
                    .build());
        }

        // Totales consolidados
        int sumFisicoMesAnt = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getTotalFisicoMesAnterior).sum();
        int sumPedidos = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getPedidosCompras).sum();
        int sumDonaciones = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getDonaciones).sum();
        int sumTotalFisico = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getTotalFisicoParaElMes).sum();
        int sumS1 = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getSemana1).sum();
        int sumS2 = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getSemana2).sum();
        int sumS3 = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getSemana3).sum();
        int sumS4 = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getSemana4).sum();
        int sumVenc = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getMedicamentoVencido).sum();
        int sumEntregado = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getTotalEntregado).sum();
        int sumSaldo = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getSaldoActual).sum();
        int sumInvFisico = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getInventarioFisico).sum();
        int sumDif = filas.stream().mapToInt(FilaReporteInventarioFarmacia::getDiferencia).sum();
        BigDecimal sumTot = filas.stream().map(FilaReporteInventarioFarmacia::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal sumValorInv = filas.stream().map(FilaReporteInventarioFarmacia::getValorSaldoActual).reduce(BigDecimal.ZERO, BigDecimal::add);

        TotalesReporteInventarioFarmacia totales = TotalesReporteInventarioFarmacia.builder()
                .totalMedicamentos(filas.size())
                .sumFisicoMesAnterior(sumFisicoMesAnt)
                .sumPedidosCompras(sumPedidos)
                .sumDonaciones(sumDonaciones)
                .sumFisicoParaElMes(sumTotalFisico)
                .sumSemana1(sumS1)
                .sumSemana2(sumS2)
                .sumSemana3(sumS3)
                .sumSemana4(sumS4)
                .sumMedicamentoVencido(sumVenc)
                .sumTotalEntregado(sumEntregado)
                .sumSaldoActual(sumSaldo)
                .sumInventarioFisico(sumInvFisico)
                .sumDiferencia(sumDif)
                .sumTotal(sumTot)
                .sumValorTotalInventario(sumValorInv)
                .build();

        return ReporteInventarioFarmaciaResponse.builder()
                .anio(anio)
                .mes(mes)
                .nombreMes(obtenerNombreMes(mes))
                .filas(filas)
                .totales(totales)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] generarExcelInventarioFarmacia(int anio, int mes) throws IOException {
        ReporteInventarioFarmaciaResponse data = generarReporteInventarioFarmacia(anio, mes);

        try (XSSFWorkbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Inventario Farmacia " + data.getNombreMes() + " " + anio);
            sheet.setDisplayGridlines(true);

            // Colores Institucionales Exactos de la Plantilla
            byte[] colorRojo = new byte[]{(byte) 220, (byte) 38, (byte) 38};         // #DC2626
            byte[] colorVerdeOsc = new byte[]{(byte) 5, (byte) 150, (byte) 105};     // #059669
            byte[] colorNaranja = new byte[]{(byte) 217, (byte) 119, (byte) 6};      // #D97706
            byte[] colorRosa = new byte[]{(byte) 219, (byte) 39, (byte) 119};        // #DB2777
            byte[] colorVerde = new byte[]{(byte) 22, (byte) 163, (byte) 74};        // #16A34A
            byte[] colorMorado = new byte[]{(byte) 124, (byte) 58, (byte) 237};      // #7C3AED
            byte[] colorRojoOsc = new byte[]{(byte) 185, (byte) 28, (byte) 28};      // #B91C1C
            byte[] colorAzul = new byte[]{(byte) 37, (byte) 99, (byte) 235};         // #2563EB
            byte[] colorDorado = new byte[]{(byte) 202, (byte) 138, (byte) 4};       // #CA8A04
            byte[] colorTeal = new byte[]{(byte) 13, (byte) 148, (byte) 136};        // #0D9488
            byte[] colorCeleste = new byte[]{(byte) 79, (byte) 70, (byte) 229};      // #4F46E5

            XSSFCellStyle hRojo = crearEstiloEncabezadoColor(wb, colorRojo);
            XSSFCellStyle hVerdeOsc = crearEstiloEncabezadoColor(wb, colorVerdeOsc);
            XSSFCellStyle hNaranja = crearEstiloEncabezadoColor(wb, colorNaranja);
            XSSFCellStyle hRosa = crearEstiloEncabezadoColor(wb, colorRosa);
            XSSFCellStyle hVerde = crearEstiloEncabezadoColor(wb, colorVerde);
            XSSFCellStyle hMorado = crearEstiloEncabezadoColor(wb, colorMorado);
            XSSFCellStyle hRojoOsc = crearEstiloEncabezadoColor(wb, colorRojoOsc);
            XSSFCellStyle hAzul = crearEstiloEncabezadoColor(wb, colorAzul);
            XSSFCellStyle hDorado = crearEstiloEncabezadoColor(wb, colorDorado);
            XSSFCellStyle hTeal = crearEstiloEncabezadoColor(wb, colorTeal);
            XSSFCellStyle hCeleste = crearEstiloEncabezadoColor(wb, colorCeleste);

            // Estilos de Celdas de Datos
            XSSFCellStyle cellTextLeft = crearEstiloDato(wb, HorizontalAlignment.LEFT, false, null);
            XSSFCellStyle cellTextCenter = crearEstiloDato(wb, HorizontalAlignment.CENTER, false, null);
            XSSFCellStyle cellNumber = crearEstiloDato(wb, HorizontalAlignment.CENTER, false, "#,##0");
            XSSFCellStyle cellCurrency = crearEstiloDato(wb, HorizontalAlignment.RIGHT, false, "\"Q\"#,##0.00");

            // Estilos Totales
            XSSFCellStyle totalLabel = crearEstiloDato(wb, HorizontalAlignment.RIGHT, true, null);
            XSSFCellStyle totalNumber = crearEstiloDato(wb, HorizontalAlignment.CENTER, true, "#,##0");
            XSSFCellStyle totalCurrency = crearEstiloDato(wb, HorizontalAlignment.RIGHT, true, "\"Q\"#,##0.00");

            // Encabezado institucional de la hoja
            Row r0 = sheet.createRow(0);
            r0.setHeightInPoints(24);
            Cell cTitle = r0.createCell(0);
            cTitle.setCellValue("OBRAS SOCIALES SAN MARTÍN - CONTROL MENSUAL DE INVENTARIO FARMACÉUTICO");
            XSSFCellStyle styleBanner = wb.createCellStyle();
            Font fb = wb.createFont();
            fb.setBold(true);
            fb.setFontHeightInPoints((short) 13);
            fb.setColor(IndexedColors.DARK_BLUE.getIndex());
            styleBanner.setFont(fb);
            cTitle.setCellStyle(styleBanner);

            Row r1 = sheet.createRow(1);
            r1.setHeightInPoints(18);
            Cell cSub = r1.createCell(0);
            cSub.setCellValue("Mes: " + data.getNombreMes().toUpperCase() + " " + anio);
            XSSFCellStyle styleSub = wb.createCellStyle();
            Font fs = wb.createFont();
            fs.setItalic(true);
            fs.setFontHeightInPoints((short) 10);
            styleSub.setFont(fs);
            cSub.setCellStyle(styleSub);

            // Fila de Encabezados de Columnas (Fila 3)
            int headerRowIdx = 3;
            Row headerRow = sheet.createRow(headerRowIdx);
            headerRow.setHeightInPoints(34);

            String[] titulos = {
                    "FECHA EXPIRACION", "NOMBRE", "PRESENTACION", "CASA FARMACEUTICA",
                    "TOTAL FISICO DEL MES ANTERIOR", "PEDIDOS / COMPRAS", "DONACIÓN",
                    "TOTAL FISICO PARA EL MES", "SEMANA 1", "SEMANA 2", "SEMANA 3", "SEMANA 4",
                    "MEDICAMENTO VENCIDO", "TOTAL ENTREGADO", "SALDO ACTUAL",
                    "INVENTARIO FÍSICO", "DIFERENCIA", "PRECIO POR UNIDAD", "TOTAL"
            };

            XSSFCellStyle[] estilosH = {
                    hRojo, hRojo, hRojo, hRojo,
                    hVerdeOsc, hNaranja, hRosa,
                    hVerde, hMorado, hMorado, hMorado, hMorado,
                    hRojoOsc, hRojoOsc, hAzul,
                    hDorado, hTeal, hCeleste, hCeleste
            };

            for (int i = 0; i < titulos.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(titulos[i]);
                cell.setCellStyle(estilosH[i]);
            }

            // Datos
            int rowIdx = 4;
            for (FilaReporteInventarioFarmacia f : data.getFilas()) {
                Row row = sheet.createRow(rowIdx++);
                row.setHeightInPoints(20);

                crearCeldaDato(row, 0, f.getFechaExpiracion(), cellTextCenter);
                crearCeldaDato(row, 1, f.getNombre(), cellTextLeft);
                crearCeldaDato(row, 2, f.getPresentacion(), cellTextLeft);
                crearCeldaDato(row, 3, f.getCasaFarmaceutica(), cellTextLeft);

                crearCeldaNum(row, 4, f.getTotalFisicoMesAnterior(), cellNumber);
                crearCeldaNum(row, 5, f.getPedidosCompras() > 0 ? f.getPedidosCompras() : null, cellNumber);
                crearCeldaNum(row, 6, f.getDonaciones() > 0 ? f.getDonaciones() : null, cellNumber);
                crearCeldaNum(row, 7, f.getTotalFisicoParaElMes(), cellNumber);

                crearCeldaNum(row, 8, f.getSemana1() > 0 ? f.getSemana1() : null, cellNumber);
                crearCeldaNum(row, 9, f.getSemana2() > 0 ? f.getSemana2() : null, cellNumber);
                crearCeldaNum(row, 10, f.getSemana3() > 0 ? f.getSemana3() : null, cellNumber);
                crearCeldaNum(row, 11, f.getSemana4() > 0 ? f.getSemana4() : null, cellNumber);

                crearCeldaNum(row, 12, f.getMedicamentoVencido() > 0 ? f.getMedicamentoVencido() : null, cellNumber);
                crearCeldaNum(row, 13, f.getTotalEntregado(), cellNumber);
                crearCeldaNum(row, 14, f.getSaldoActual(), cellNumber);
                crearCeldaNum(row, 15, f.getInventarioFisico(), cellNumber);
                crearCeldaNum(row, 16, f.getDiferencia(), cellNumber);

                crearCeldaMoney(row, 17, f.getPrecioPorUnidad(), cellCurrency);
                crearCeldaMoney(row, 18, f.getTotal(), cellCurrency);
            }

            // Fila de Totales
            Row rowTot = sheet.createRow(rowIdx);
            rowTot.setHeightInPoints(24);

            for (int i = 0; i < 4; i++) {
                Cell c = rowTot.createCell(i);
                c.setCellStyle(totalLabel);
                if (i == 3) c.setCellValue("TOTALES:");
            }

            TotalesReporteInventarioFarmacia t = data.getTotales();
            crearCeldaNum(rowTot, 4, t.getSumFisicoMesAnterior(), totalNumber);
            crearCeldaNum(rowTot, 5, t.getSumPedidosCompras(), totalNumber);
            crearCeldaNum(rowTot, 6, t.getSumDonaciones(), totalNumber);
            crearCeldaNum(rowTot, 7, t.getSumFisicoParaElMes(), totalNumber);

            crearCeldaNum(rowTot, 8, t.getSumSemana1(), totalNumber);
            crearCeldaNum(rowTot, 9, t.getSumSemana2(), totalNumber);
            crearCeldaNum(rowTot, 10, t.getSumSemana3(), totalNumber);
            crearCeldaNum(rowTot, 11, t.getSumSemana4(), totalNumber);

            crearCeldaNum(rowTot, 12, t.getSumMedicamentoVencido(), totalNumber);
            crearCeldaNum(rowTot, 13, t.getSumTotalEntregado(), totalNumber);
            crearCeldaNum(rowTot, 14, t.getSumSaldoActual(), totalNumber);
            crearCeldaNum(rowTot, 15, t.getSumInventarioFisico(), totalNumber);
            crearCeldaNum(rowTot, 16, t.getSumDiferencia(), totalNumber);

            Cell cVacio = rowTot.createCell(17);
            cVacio.setCellStyle(totalLabel);

            crearCeldaMoney(rowTot, 18, t.getSumTotal(), totalCurrency);

            // Ajustar anchos de columnas
            int[] anchos = {
                    2800, 7500, 5500, 4800,
                    3800, 3600, 3400,
                    3800, 2600, 2600, 2600, 2600,
                    3500, 3600, 3400,
                    3600, 2800, 3600, 3600
            };
            for (int i = 0; i < anchos.length; i++) {
                sheet.setColumnWidth(i, anchos[i]);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    private XSSFCellStyle crearEstiloEncabezadoColor(XSSFWorkbook wb, byte[] rgb) {
        XSSFCellStyle style = wb.createCellStyle();
        XSSFColor color = new XSSFColor(rgb, new DefaultIndexedColorMap());
        style.setFillForegroundColor(color);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 9);
        font.setFontName("Calibri");
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setWrapText(true);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private XSSFCellStyle crearEstiloDato(XSSFWorkbook wb, HorizontalAlignment align, boolean bold, String formatPattern) {
        XSSFCellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(bold);
        font.setFontHeightInPoints((short) 9);
        font.setFontName("Calibri");
        style.setFont(font);
        style.setAlignment(align);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        if (formatPattern != null) {
            DataFormat format = wb.createDataFormat();
            style.setDataFormat(format.getFormat(formatPattern));
        }
        return style;
    }

    private void crearCeldaDato(Row row, int col, String val, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(val != null ? val : "—");
        c.setCellStyle(style);
    }

    private void crearCeldaNum(Row row, int col, Integer val, CellStyle style) {
        Cell c = row.createCell(col);
        if (val != null) {
            c.setCellValue(val);
        } else {
            c.setCellValue("");
        }
        c.setCellStyle(style);
    }

    private void crearCeldaMoney(Row row, int col, BigDecimal val, CellStyle style) {
        Cell c = row.createCell(col);
        c.setCellValue(val != null ? val.doubleValue() : 0.0);
        c.setCellStyle(style);
    }

    private String obtenerNombreMes(int mes) {
        String[] nombresMeses = {
                "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        };
        return (mes >= 1 && mes <= 12) ? nombresMeses[mes - 1] : String.valueOf(mes);
    }
}

