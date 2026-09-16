package com.hyma.reporte.service;

import com.hyma.clinica.model.Diagnostico;
import com.hyma.clinica.repository.DiagnosticoRepository;
import com.hyma.consulta.model.Consulta;
import com.hyma.consulta.repository.ConsultaRepository;
import com.hyma.recepcion.model.Paciente;
import com.hyma.reporte.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
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

    public static final List<DiagnosticoColumnaInfo> COLUMNAS_DIAGNOSTICOS = List.of(
            // INFECCIOSOS (11)
            new DiagnosticoColumnaInfo(0, "INFECCIOSOS", "Infección respiratoria"),
            new DiagnosticoColumnaInfo(1, "INFECCIOSOS", "Asma"),
            new DiagnosticoColumnaInfo(2, "INFECCIOSOS", "Infección intestinal"),
            new DiagnosticoColumnaInfo(3, "INFECCIOSOS", "Infección en la piel"),
            new DiagnosticoColumnaInfo(4, "INFECCIOSOS", "Infección de vías urinarias"),
            new DiagnosticoColumnaInfo(5, "INFECCIOSOS", "Infección en el oído"),
            new DiagnosticoColumnaInfo(6, "INFECCIOSOS", "Bronquitis"),
            new DiagnosticoColumnaInfo(7, "INFECCIOSOS", "Hepatitis"),
            new DiagnosticoColumnaInfo(8, "INFECCIOSOS", "Neumonía"),
            new DiagnosticoColumnaInfo(9, "INFECCIOSOS", "Septicemia"),
            new DiagnosticoColumnaInfo(10, "INFECCIOSOS", "Apendicitis aguda"),

            // CRONICOS (6)
            new DiagnosticoColumnaInfo(11, "CRONICOS", "Diabetes Mellitus"),
            new DiagnosticoColumnaInfo(12, "CRONICOS", "Enfermedades pépticas"),
            new DiagnosticoColumnaInfo(13, "CRONICOS", "Hipertensión arterial"),
            new DiagnosticoColumnaInfo(14, "CRONICOS", "Síndrome del intestino irritable"),
            new DiagnosticoColumnaInfo(15, "CRONICOS", "Artritis Reumatoide"),
            new DiagnosticoColumnaInfo(16, "CRONICOS", "Enfermedad pulmonar obstructiva crónica"),

            // GINECOLOGICO (4)
            new DiagnosticoColumnaInfo(17, "GINECOLOGICO", "Cuidado prenatal"),
            new DiagnosticoColumnaInfo(18, "GINECOLOGICO", "Ginecología"),
            new DiagnosticoColumnaInfo(19, "GINECOLOGICO", "Planificación familiar"),
            new DiagnosticoColumnaInfo(20, "GINECOLOGICO", "Papanicolau"),

            // NUTRICIONAL (10)
            new DiagnosticoColumnaInfo(21, "NUTRICIONAL", "Anemia"),
            new DiagnosticoColumnaInfo(22, "NUTRICIONAL", "Niño sano"),
            new DiagnosticoColumnaInfo(23, "NUTRICIONAL", "Bajo peso para la edad del niño"),
            new DiagnosticoColumnaInfo(24, "NUTRICIONAL", "Desnutrición aguda moderada"),
            new DiagnosticoColumnaInfo(25, "NUTRICIONAL", "Desnutrición aguda severa"),
            new DiagnosticoColumnaInfo(26, "NUTRICIONAL", "Desnutrición crónica"),
            new DiagnosticoColumnaInfo(27, "NUTRICIONAL", "Retraso en el desarrollo"),
            new DiagnosticoColumnaInfo(28, "NUTRICIONAL", "Sobrepeso y obesidad"),
            new DiagnosticoColumnaInfo(29, "NUTRICIONAL", "Carencia de Vitamina A"),
            new DiagnosticoColumnaInfo(30, "NUTRICIONAL", "Otras deficiencias nutricionales"),

            // OTROS (21)
            new DiagnosticoColumnaInfo(31, "OTROS", "Amigdalitis aguda"),
            new DiagnosticoColumnaInfo(32, "OTROS", "Faringitis aguda"),
            new DiagnosticoColumnaInfo(33, "OTROS", "Otitis media"),
            new DiagnosticoColumnaInfo(34, "OTROS", "Resfriado común"),
            new DiagnosticoColumnaInfo(35, "OTROS", "Sinusitis aguda"),
            new DiagnosticoColumnaInfo(36, "OTROS", "COVID-19"),
            new DiagnosticoColumnaInfo(37, "OTROS", "Celulitis"),
            new DiagnosticoColumnaInfo(38, "OTROS", "Dermatitis"),
            new DiagnosticoColumnaInfo(39, "OTROS", "Escabiosis"),
            new DiagnosticoColumnaInfo(40, "OTROS", "Micosis superficial"),
            new DiagnosticoColumnaInfo(41, "OTROS", "Colecistitis aguda"),
            new DiagnosticoColumnaInfo(42, "OTROS", "Gastritis aguda"),
            new DiagnosticoColumnaInfo(43, "OTROS", "Gastroenteritis infecciosa"),
            new DiagnosticoColumnaInfo(44, "OTROS", "Infección urinaria recurrente"),
            new DiagnosticoColumnaInfo(45, "OTROS", "Cistitis aguda"),
            new DiagnosticoColumnaInfo(46, "OTROS", "Insuficiencia cardíaca"),
            new DiagnosticoColumnaInfo(47, "OTROS", "Dislipidemia"),
            new DiagnosticoColumnaInfo(48, "OTROS", "Lumbalgia"),
            new DiagnosticoColumnaInfo(49, "OTROS", "Cefalea tensional"),
            new DiagnosticoColumnaInfo(50, "OTROS", "Migraña"),
            new DiagnosticoColumnaInfo(51, "OTROS", "Ansiedad / Depresión")
    );

    @Transactional(readOnly = true)
    public ReporteEstadisticaResponse generarReporteEstadistica(int anio, int mes) {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

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
                // Fila vacía para ese día
                List<Integer> diagsCero = new ArrayList<>(Collections.nCopies(52, 0));
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
            int[] conteoDiag = new int[52];

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
                    e18a59++; // default si no tuviese fecha
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

                // Diagnósticos
                if (c.getIdConsulta() != null) {
                    List<Diagnostico> diags = diagPorConsulta.getOrDefault(c.getIdConsulta(), Collections.emptyList());
                    for (Diagnostico d : diags) {
                        if (d == null) continue;
                        int idx = clasificarDiagnostico(d.getDescripcion());
                        if (idx >= 0 && idx < 52) {
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

        int[] sumDiags = new int[52];
        for (FilaReporteEstadistica f : filas) {
            for (int i = 0; i < 52; i++) {
                sumDiags[i] += f.getDiagnosticos().get(i);
            }
        }
        List<Integer> listTotDiags = new ArrayList<>();
        for (int v : sumDiags) listTotDiags.add(v);

        TotalesReporteEstadistica totales = TotalesReporteEstadistica.builder()
                .totalDiasAtencion(totDiasAtencion)
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

        // Calcular Promedios (dividir entre totDiasAtencion)
        int divisor = totDiasAtencion > 0 ? totDiasAtencion : 1;
        TotalesReporteEstadistica promedios = TotalesReporteEstadistica.builder()
                .totalDiasAtencion(totDiasAtencion)
                .nuevos(Math.round((float) sumNuevos / divisor))
                .reconsulta(Math.round((float) sumReconsulta / divisor))
                .totalPacientes(Math.round((float) sumTotalPac / divisor))
                .edad0a5(Math.round((float) sum0a5 / divisor))
                .edad6a12(Math.round((float) sum6a12 / divisor))
                .edad13a17(Math.round((float) sum13a17 / divisor))
                .edad18a59(Math.round((float) sum18a59 / divisor))
                .edad60mas(Math.round((float) sum60mas / divisor))
                .totalEdades(Math.round((float) sumTotalEdades / divisor))
                .femenino(Math.round((float) sumFem / divisor))
                .masculino(Math.round((float) sumMasc / divisor))
                .totalGenero(Math.round((float) sumTotalGen / divisor))
                .totalRecaudado(sumRecaudado.divide(BigDecimal.valueOf(divisor), 2, RoundingMode.HALF_UP))
                .diagnosticos(listTotDiags.stream().map(v -> Math.round((float) v / divisor)).toList())
                .build();

        String periodoNombre = ym.getMonth().name().substring(0, 3).toLowerCase() + "-" + (anio % 100);

        return ReporteEstadisticaResponse.builder()
                .mes(mes)
                .anio(anio)
                .periodoNombre(periodoNombre)
                .titulo("ESTADISTICA MENSUAL OBRAS SOCIALES SAN MARTIN")
                .columnasDiagnosticos(COLUMNAS_DIAGNOSTICOS)
                .filas(filas)
                .totales(totales)
                .promedios(promedios)
                .build();
    }

    /**
     * Clasifica una descripción de diagnóstico en uno de los 52 índices.
     */
    public int clasificarDiagnostico(String descripcion) {
        if (descripcion == null || descripcion.isBlank()) {
            return 33; // Resfriado o similar como fallback seguro
        }
        String clean = Normalizer.normalize(descripcion.toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").trim();

        // 1. INFECCIOSOS (0..10)
        if (clean.contains("respirator") || clean.contains("iras") || clean.contains("ira ") || clean.equals("ira")) return 0;
        if (clean.contains("asma") || clean.contains("broncoespasmo")) return 1;
        if (clean.contains("intestin") || clean.contains("diarrea") || clean.contains("gastroenteritis bacteriana")) return 2;
        if (clean.contains("piel") || clean.contains("cutane") || clean.contains("pioderm")) return 3;
        if (clean.contains("urinari") || clean.contains("itu") || clean.contains("vias urinarias")) {
            if (clean.contains("recurrente")) return 44; // Infección urinaria recurrente
            return 4; // Infección de vías urinarias
        }
        if (clean.contains("oido")) return 5;
        if (clean.contains("bronqui")) return 6;
        if (clean.contains("hepatit")) return 7;
        if (clean.contains("neumon") || clean.contains("pulmonia")) return 8;
        if (clean.contains("septic") || clean.contains("sepsis")) return 9;
        if (clean.contains("apendic")) return 10;

        // 2. CRONICOS (11..16)
        if (clean.contains("diabet") || clean.contains("dm2") || clean.contains("dm1")) return 11;
        if (clean.contains("peptic") || clean.contains("reflujo") || clean.contains("dispepsia")) return 12;
        if (clean.contains("hipertens") || clean.contains("hta") || clean.contains("presion alta")) return 13;
        if (clean.contains("intestino irritable") || clean.contains("colon irritable") || clean.contains("sii")) return 14;
        if (clean.contains("artrit") || clean.contains("reumato")) return 15;
        if (clean.contains("epoc") || clean.contains("obstructiva cronica")) return 16;

        // 3. GINECOLOGICO (17..20)
        if (clean.contains("prenatal") || clean.contains("embaraz") || clean.contains("gestac")) return 17;
        if (clean.contains("ginecolog") || clean.contains("vagin") || clean.contains("flujo")) return 18;
        if (clean.contains("planific") || clean.contains("anticoncept")) return 19;
        if (clean.contains("papanicol") || clean.contains("pap") || clean.contains("citolog")) return 20;

        // 4. NUTRICIONAL (21..30)
        if (clean.contains("anemia")) return 21;
        if (clean.contains("sano") || clean.contains("control de nino")) return 22;
        if (clean.contains("bajo peso")) return 23;
        if (clean.contains("desnutricion aguda moderada")) return 24;
        if (clean.contains("desnutricion aguda severa") || clean.contains("desnutricion severa")) return 25;
        if (clean.contains("desnutricion cronica") || clean.contains("desnutri")) return 26;
        if (clean.contains("retraso en el desarrollo") || clean.contains("retraso psicomotor")) return 27;
        if (clean.contains("sobrepeso") || clean.contains("obesid")) return 28;
        if (clean.contains("vitamina a")) return 29;
        if (clean.contains("nutricion") || clean.contains("carencia") || clean.contains("deficit")) return 30;

        // 5. OTROS (31..51)
        if (clean.contains("amigdal")) return 31;
        if (clean.contains("faring")) return 32;
        if (clean.contains("otitis")) return 33;
        if (clean.contains("resfriad") || clean.contains("gripe") || clean.contains("catarro") || clean.contains("rinofaring")) return 34;
        if (clean.contains("sinusit")) return 35;
        if (clean.contains("covid") || clean.contains("sars")) return 36;
        if (clean.contains("celulit")) return 37;
        if (clean.contains("dermat") || clean.contains("eccema")) return 38;
        if (clean.contains("escabio") || clean.contains("sarna")) return 39;
        if (clean.contains("micos") || clean.contains("tinea") || clean.contains("hongo") || clean.contains("pie de atleta")) return 40;
        if (clean.contains("colecist")) return 41;
        if (clean.contains("gastrit")) return 42;
        if (clean.contains("gastroenter")) return 43;
        if (clean.contains("cistit")) return 45;
        if (clean.contains("cardiaca") || clean.contains("corazon")) return 46;
        if (clean.contains("dislipid") || clean.contains("colesterol") || clean.contains("triglic")) return 47;
        if (clean.contains("lumb") || clean.contains("espalda")) return 48;
        if (clean.contains("cefalea")) return 49;
        if (clean.contains("migran") || clean.contains("jaqueca")) return 50;
        if (clean.contains("ansied") || clean.contains("depres") || clean.contains("estres")) return 51;

        // Default al primer grupo infeccioso o a "Otros"
        return 34; // Resfriado común por defecto en atención primaria
    }

    /**
     * Genera el libro Excel (.xlsx) exactamente con el formato institucional solicitado.
     */
    public byte[] generarExcel(int anio, int mes) throws IOException {
        ReporteEstadisticaResponse data = generarReporteEstadistica(anio, mes);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Estadística Mensual");
            sheet.setDisplayGridlines(true);

            // Estilos
            Font fontBold = wb.createFont();
            fontBold.setBold(true);

            Font fontHeaderTitle = wb.createFont();
            fontHeaderTitle.setBold(true);
            fontHeaderTitle.setFontHeightInPoints((short) 12);
            fontHeaderTitle.setColor(IndexedColors.WHITE.getIndex());

            Font fontCategory = wb.createFont();
            fontCategory.setBold(true);
            fontCategory.setFontHeightInPoints((short) 10);
            fontCategory.setColor(IndexedColors.WHITE.getIndex());

            // Estilo Titulo Principal (Azul oscuro / Navy)
            CellStyle styleTitleMain = wb.createCellStyle();
            styleTitleMain.setFont(fontHeaderTitle);
            styleTitleMain.setAlignment(HorizontalAlignment.CENTER);
            styleTitleMain.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTitleMain.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            styleTitleMain.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTitleMain);

            // Estilo Titulo Diagnosticos (Gris / Azul petróleo)
            CellStyle styleTitleDiag = wb.createCellStyle();
            styleTitleDiag.setFont(fontHeaderTitle);
            styleTitleDiag.setAlignment(HorizontalAlignment.CENTER);
            styleTitleDiag.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTitleDiag.setFillForegroundColor(IndexedColors.DARK_TEAL.getIndex());
            styleTitleDiag.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleTitleDiag);

            // Estilos de Categorias
            CellStyle styleCatInfecciosos = crearEstiloCategoria(wb, IndexedColors.CORNFLOWER_BLUE.getIndex());
            CellStyle styleCatCronicos = crearEstiloCategoria(wb, IndexedColors.GREY_50_PERCENT.getIndex());
            CellStyle styleCatGinecologico = crearEstiloCategoria(wb, IndexedColors.ROSE.getIndex());
            CellStyle styleCatNutricional = crearEstiloCategoria(wb, IndexedColors.SEA_GREEN.getIndex());
            CellStyle styleCatOtros = crearEstiloCategoria(wb, IndexedColors.DARK_BLUE.getIndex());

            // Estilo Subencabezados
            CellStyle styleSubHeader = wb.createCellStyle();
            Font fontSub = wb.createFont();
            fontSub.setBold(true);
            fontSub.setFontHeightInPoints((short) 9);
            styleSubHeader.setFont(fontSub);
            styleSubHeader.setAlignment(HorizontalAlignment.CENTER);
            styleSubHeader.setVerticalAlignment(VerticalAlignment.CENTER);
            styleSubHeader.setWrapText(true);
            styleSubHeader.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            styleSubHeader.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleSubHeader);

            // Estilo Datos Numéricos
            CellStyle styleDataNum = wb.createCellStyle();
            styleDataNum.setAlignment(HorizontalAlignment.CENTER);
            setBorders(styleDataNum);

            // Estilo Moneda
            CellStyle styleCurrency = wb.createCellStyle();
            styleCurrency.setAlignment(HorizontalAlignment.RIGHT);
            DataFormat df = wb.createDataFormat();
            styleCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            setBorders(styleCurrency);

            // Estilo Totales / Promedios
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

            // Rellenar celdas intermedias para el merge de título principal (cols 1..14)
            for (int col = 2; col <= 14; col++) {
                Cell c = row0.createCell(col);
                c.setCellStyle(styleTitleMain);
            }
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 1, 14));

            // Merge de clasificación de diagnósticos (cols 15..66)
            Cell cDiagTitle = row0.createCell(15);
            cDiagTitle.setCellValue("CLASIFICACIÓN DE DIAGNÓSTICOS");
            cDiagTitle.setCellStyle(styleTitleDiag);
            for (int col = 16; col <= 66; col++) {
                Cell c = row0.createCell(col);
                c.setCellStyle(styleTitleDiag);
            }
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 15, 66));

            // -------------------------------------------------------------
            // FILA 1: Grupos mayores de encabezados
            // -------------------------------------------------------------
            Row row1 = sheet.createRow(1);
            row1.setHeightInPoints(22);

            // Col 0: FECHA (merge con fila 2)
            crearCeldaConBorde(row1, 0, "FECHA", styleSubHeader);

            // Col 1: TOTAL DIAS DE ATENCION (merge con fila 2)
            crearCeldaConBorde(row1, 1, "TOTAL DIAS DE ATENCION", styleSubHeader);

            // Col 2..4: No DE PACIENTES
            crearCeldaConBorde(row1, 2, "No DE PACIENTES", styleSubHeader);
            crearCeldaConBorde(row1, 3, "", styleSubHeader);
            crearCeldaConBorde(row1, 4, "", styleSubHeader);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 2, 4));

            // Col 5..10: GRUPO DE EDADES
            crearCeldaConBorde(row1, 5, "GRUPO DE EDADES", styleSubHeader);
            for (int c = 6; c <= 10; c++) crearCeldaConBorde(row1, c, "", styleSubHeader);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 5, 10));

            // Col 11..13: GENERO
            crearCeldaConBorde(row1, 11, "GENERO", styleSubHeader);
            crearCeldaConBorde(row1, 12, "", styleSubHeader);
            crearCeldaConBorde(row1, 13, "", styleSubHeader);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 11, 13));

            // Col 14: TOTAL RECAUDADO
            crearCeldaConBorde(row1, 14, "TOTAL RECAUDADO", styleSubHeader);

            // Col 15..25: INFECCIOSOS (11)
            crearCeldaConBorde(row1, 15, "INFECCIOSOS", styleCatInfecciosos);
            for (int c = 16; c <= 25; c++) crearCeldaConBorde(row1, c, "", styleCatInfecciosos);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 15, 25));

            // Col 26..31: CRONICOS (6)
            crearCeldaConBorde(row1, 26, "CRONICOS", styleCatCronicos);
            for (int c = 27; c <= 31; c++) crearCeldaConBorde(row1, c, "", styleCatCronicos);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 26, 31));

            // Col 32..35: GINECOLOGICO (4)
            crearCeldaConBorde(row1, 32, "GINECOLOGICO", styleCatGinecologico);
            for (int c = 33; c <= 35; c++) crearCeldaConBorde(row1, c, "", styleCatGinecologico);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 32, 35));

            // Col 36..45: NUTRICIONAL (10)
            crearCeldaConBorde(row1, 36, "NUTRICIONAL", styleCatNutricional);
            for (int c = 37; c <= 45; c++) crearCeldaConBorde(row1, c, "", styleCatNutricional);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 36, 45));

            // Col 46..66: OTROS (21)
            crearCeldaConBorde(row1, 46, "OTROS", styleCatOtros);
            for (int c = 47; c <= 66; c++) crearCeldaConBorde(row1, c, "", styleCatOtros);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 46, 66));

            // -------------------------------------------------------------
            // FILA 2: Sub-encabezados específicos de columnas
            // -------------------------------------------------------------
            Row row2 = sheet.createRow(2);
            row2.setHeightInPoints(45);

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

            // 52 Nombres de diagnósticos
            for (int i = 0; i < 52; i++) {
                DiagnosticoColumnaInfo colInfo = COLUMNAS_DIAGNOSTICOS.get(i);
                crearCeldaConBorde(row2, 15 + i, colInfo.getNombre(), styleSubHeader);
            }

            // -------------------------------------------------------------
            // FILAS DE DATOS (Días del mes)
            // -------------------------------------------------------------
            int rowIdx = 3;
            for (FilaReporteEstadistica f : data.getFilas()) {
                Row r = sheet.createRow(rowIdx++);
                r.setHeightInPoints(18);

                crearCeldaConBorde(r, 0, f.getFecha(), styleDataNum);
                crearCeldaNumerica(r, 1, f.getDiasAtencion() != null && f.getDiasAtencion() > 0 ? 1 : 0, styleDataNum);
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

                for (int i = 0; i < 52; i++) {
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

            crearCeldaConBorde(rTot, 0, "TOTAL", styleTotal);
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

            for (int i = 0; i < 52; i++) {
                int val = (tot.getDiagnosticos() != null && tot.getDiagnosticos().size() > i)
                        ? tot.getDiagnosticos().get(i) : 0;
                crearCeldaNumerica(rTot, 15 + i, val, styleTotal);
            }

            // -------------------------------------------------------------
            // FILA PROMEDIO
            // -------------------------------------------------------------
            Row rProm = sheet.createRow(rowIdx);
            rProm.setHeightInPoints(22);
            TotalesReporteEstadistica prom = data.getPromedios();

            crearCeldaConBorde(rProm, 0, "PROMEDIO", styleTotal);
            crearCeldaNumerica(rProm, 1, prom.getTotalDiasAtencion(), styleTotal);
            crearCeldaNumerica(rProm, 2, prom.getNuevos(), styleTotal);
            crearCeldaNumerica(rProm, 3, prom.getReconsulta(), styleTotal);
            crearCeldaNumerica(rProm, 4, prom.getTotalPacientes(), styleTotal);

            crearCeldaNumerica(rProm, 5, prom.getEdad0a5(), styleTotal);
            crearCeldaNumerica(rProm, 6, prom.getEdad6a12(), styleTotal);
            crearCeldaNumerica(rProm, 7, prom.getEdad13a17(), styleTotal);
            crearCeldaNumerica(rProm, 8, prom.getEdad18a59(), styleTotal);
            crearCeldaNumerica(rProm, 9, prom.getEdad60mas(), styleTotal);
            crearCeldaNumerica(rProm, 10, prom.getTotalEdades(), styleTotal);

            crearCeldaNumerica(rProm, 11, prom.getFemenino(), styleTotal);
            crearCeldaNumerica(rProm, 12, prom.getMasculino(), styleTotal);
            crearCeldaNumerica(rProm, 13, prom.getTotalGenero(), styleTotal);

            Cell cPromRec = rProm.createCell(14);
            cPromRec.setCellValue(prom.getTotalRecaudado() != null ? prom.getTotalRecaudado().doubleValue() : 0.0);
            cPromRec.setCellStyle(styleTotalCurrency);

            for (int i = 0; i < 52; i++) {
                int val = (prom.getDiagnosticos() != null && prom.getDiagnosticos().size() > i)
                        ? prom.getDiagnosticos().get(i) : 0;
                crearCeldaNumerica(rProm, 15 + i, val, styleTotal);
            }

            // Anchos de columna adecuados
            sheet.setColumnWidth(0, 3200);  // FECHA
            sheet.setColumnWidth(1, 2400);  // DÍAS
            for (int c = 2; c <= 13; c++) {
                sheet.setColumnWidth(c, 2400);
            }
            sheet.setColumnWidth(14, 3800); // RECAUDADO
            for (int c = 15; c <= 66; c++) {
                sheet.setColumnWidth(c, 3600); // Nombres de diagnósticos
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    private CellStyle crearEstiloCategoria(Workbook wb, short colorIndex) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        font.setFontHeightInPoints((short) 10);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setFillForegroundColor(colorIndex);
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        setBorders(style);
        return style;
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
