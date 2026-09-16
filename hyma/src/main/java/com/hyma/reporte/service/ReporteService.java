package com.hyma.reporte.service;

import com.hyma.clinica.model.CatalogoCie10;
import com.hyma.clinica.model.CategoriaDiagnostico;
import com.hyma.clinica.model.Diagnostico;
import com.hyma.clinica.repository.CatalogoCie10Repository;
import com.hyma.clinica.repository.CategoriaDiagnosticoRepository;
import com.hyma.clinica.repository.DiagnosticoRepository;
import com.hyma.consulta.model.Consulta;
import com.hyma.consulta.repository.ConsultaRepository;
import com.hyma.recepcion.model.Paciente;
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
    private final CategoriaDiagnosticoRepository categoriaDiagnosticoRepository;

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
        if (!idsConsultas.isEmpty()) {
            List<Diagnostico> todosDiag = diagnosticoRepository.findByConsulta_IdConsultaIn(idsConsultas);
            for (Diagnostico d : todosDiag) {
                if (d != null && d.getConsulta() != null && d.getConsulta().getIdConsulta() != null) {
                    diagPorConsulta.computeIfAbsent(d.getConsulta().getIdConsulta(), k -> new ArrayList<>()).add(d);
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
                        .totalRecaudado(BigDecimal.ZERO)
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

                // Recaudado
                if (c.getPrecioConsulta() != null) {
                    recaudado = recaudado.add(c.getPrecioConsulta());
                }

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
}
