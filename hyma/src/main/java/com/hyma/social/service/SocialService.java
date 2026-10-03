package com.hyma.social.service;

import com.hyma.clinica.model.Diagnostico;
import com.hyma.clinica.repository.DiagnosticoRepository;
import com.hyma.consulta.model.Consulta;
import com.hyma.consulta.repository.ConsultaRepository;
import com.hyma.recepcion.model.Paciente;
import com.hyma.recepcion.repository.PacienteRepository;
import com.hyma.recepcion.service.PacienteNotFoundException;
import com.hyma.social.dto.*;
import com.hyma.social.model.EspecialidadReferencia;
import com.hyma.social.model.ReferenciaMedica;
import com.hyma.social.repository.EspecialidadReferenciaRepository;
import com.hyma.social.repository.ReferenciaMedicaRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final EspecialidadReferenciaRepository especialidadReferenciaRepository;
    private final ReferenciaMedicaRepository referenciaMedicaRepository;
    private final PacienteRepository pacienteRepository;
    private final ConsultaRepository consultaRepository;
    private final DiagnosticoRepository diagnosticoRepository;

    private static final String[] MESES_ES = {
            "", "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    };

    @Transactional(readOnly = true)
    public List<EspecialidadReferenciaResponse> listarEspecialidades(String buscar) {
        List<EspecialidadReferencia> lista;
        if (buscar != null && !buscar.trim().isEmpty()) {
            lista = especialidadReferenciaRepository.findByNombreContainingIgnoreCaseAndActivoTrueOrderByNombreAsc(buscar.trim());
        } else {
            lista = especialidadReferenciaRepository.findByActivoTrueOrderByNombreAsc();
        }

        return lista.stream()
                .map(e -> EspecialidadReferenciaResponse.builder()
                        .idEspecialidad(e.getIdEspecialidad())
                        .nombre(e.getNombre())
                        .descripcion(e.getDescripcion())
                        .activo(e.getActivo())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public DashboardReferenciasResponse obtenerDashboard(Integer anio, Integer mes) {
        LocalDate hoy = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : hoy.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : hoy.getMonthValue();

        List<Object[]> rawCounts = referenciaMedicaRepository.contarReferenciasPorMesYAño(a, m);
        
        long total = 0;
        List<FilaEspecialidadReferencia> filas = new ArrayList<>();

        for (Object[] row : rawCounts) {
            String esp = (String) row[0];
            Long count = ((Number) row[1]).longValue();
            total += count;
            filas.add(FilaEspecialidadReferencia.builder()
                    .especialidad(esp)
                    .referencias(count)
                    .porcentaje(0.0)
                    .build());
        }

        final double finalTotal = (double) total;
        if (total > 0) {
            for (FilaEspecialidadReferencia f : filas) {
                f.setPorcentaje(Math.round((f.getReferencias() / finalTotal * 100.0) * 10.0) / 10.0);
            }
        }

        String nombreMes = (m >= 1 && m <= 12 ? MESES_ES[m] : "MES " + m) + " " + a;

        return DashboardReferenciasResponse.builder()
                .anio(a)
                .mes(m)
                .nombreMes(nombreMes)
                .totalReferencias(total)
                .filas(filas)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] exportarExcelDashboard(Integer anio, Integer mes) throws IOException {
        DashboardReferenciasResponse data = obtenerDashboard(anio, mes);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Referencias Médicas");

            // Configurar estilos con fuente Times New Roman
            Font fontHeaderTitle = workbook.createFont();
            fontHeaderTitle.setFontName("Times New Roman");
            fontHeaderTitle.setFontHeightInPoints((short) 12);
            fontHeaderTitle.setBold(true);

            Font fontColHeader = workbook.createFont();
            fontColHeader.setFontName("Times New Roman");
            fontColHeader.setFontHeightInPoints((short) 11);
            fontColHeader.setBold(true);

            Font fontData = workbook.createFont();
            fontData.setFontName("Times New Roman");
            fontData.setFontHeightInPoints((short) 11);

            Font fontTotal = workbook.createFont();
            fontTotal.setFontName("Times New Roman");
            fontTotal.setFontHeightInPoints((short) 11);
            fontTotal.setBold(true);

            // Estilo Título Principal (Merged A1:B1)
            CellStyle styleTitle = workbook.createCellStyle();
            styleTitle.setFont(fontHeaderTitle);
            styleTitle.setAlignment(HorizontalAlignment.CENTER);
            styleTitle.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTitle.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            styleTitle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            styleTitle.setBorderTop(BorderStyle.THIN);
            styleTitle.setBorderBottom(BorderStyle.THIN);
            styleTitle.setBorderLeft(BorderStyle.THIN);
            styleTitle.setBorderRight(BorderStyle.THIN);

            // Estilo Encabezados de Columna
            CellStyle styleColHeaderLeft = workbook.createCellStyle();
            styleColHeaderLeft.setFont(fontColHeader);
            styleColHeaderLeft.setAlignment(HorizontalAlignment.LEFT);
            styleColHeaderLeft.setVerticalAlignment(VerticalAlignment.CENTER);
            styleColHeaderLeft.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            styleColHeaderLeft.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            styleColHeaderLeft.setBorderTop(BorderStyle.THIN);
            styleColHeaderLeft.setBorderBottom(BorderStyle.THIN);
            styleColHeaderLeft.setBorderLeft(BorderStyle.THIN);
            styleColHeaderLeft.setBorderRight(BorderStyle.THIN);

            CellStyle styleColHeaderCenter = workbook.createCellStyle();
            styleColHeaderCenter.cloneStyleFrom(styleColHeaderLeft);
            styleColHeaderCenter.setAlignment(HorizontalAlignment.CENTER);

            // Estilo Filas de Datos
            CellStyle styleDataLeft = workbook.createCellStyle();
            styleDataLeft.setFont(fontData);
            styleDataLeft.setAlignment(HorizontalAlignment.LEFT);
            styleDataLeft.setVerticalAlignment(VerticalAlignment.CENTER);
            styleDataLeft.setBorderTop(BorderStyle.THIN);
            styleDataLeft.setBorderBottom(BorderStyle.THIN);
            styleDataLeft.setBorderLeft(BorderStyle.THIN);
            styleDataLeft.setBorderRight(BorderStyle.THIN);

            CellStyle styleDataCenter = workbook.createCellStyle();
            styleDataCenter.cloneStyleFrom(styleDataLeft);
            styleDataCenter.setAlignment(HorizontalAlignment.CENTER);

            // Estilo Fila TOTAL
            CellStyle styleTotalLeft = workbook.createCellStyle();
            styleTotalLeft.setFont(fontTotal);
            styleTotalLeft.setAlignment(HorizontalAlignment.LEFT);
            styleTotalLeft.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTotalLeft.setFillForegroundColor(IndexedColors.PALE_BLUE.getIndex());
            styleTotalLeft.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            styleTotalLeft.setBorderTop(BorderStyle.THIN);
            styleTotalLeft.setBorderBottom(BorderStyle.DOUBLE);
            styleTotalLeft.setBorderLeft(BorderStyle.THIN);
            styleTotalLeft.setBorderRight(BorderStyle.THIN);

            CellStyle styleTotalCenter = workbook.createCellStyle();
            styleTotalCenter.cloneStyleFrom(styleTotalLeft);
            styleTotalCenter.setAlignment(HorizontalAlignment.CENTER);

            // 1. Fila de Título (Fila 0)
            Row rowTitle = sheet.createRow(0);
            rowTitle.setHeightInPoints(24);
            Cell cellTitle0 = rowTitle.createCell(0);
            cellTitle0.setCellValue("REFERENCIAS MÉDICAS " + data.getNombreMes());
            cellTitle0.setCellStyle(styleTitle);
            Cell cellTitle1 = rowTitle.createCell(1);
            cellTitle1.setCellStyle(styleTitle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

            // 2. Fila de Encabezados (Fila 1)
            Row rowHeader = sheet.createRow(1);
            rowHeader.setHeightInPoints(20);
            Cell cHead0 = rowHeader.createCell(0);
            cHead0.setCellValue("Specialty");
            cHead0.setCellStyle(styleColHeaderLeft);

            Cell cHead1 = rowHeader.createCell(1);
            cHead1.setCellValue("Referencias");
            cHead1.setCellStyle(styleColHeaderCenter);

            // 3. Filas de Especialidades con Referencias > 0
            int rowIdx = 2;
            for (FilaEspecialidadReferencia f : data.getFilas()) {
                Row row = sheet.createRow(rowIdx++);
                row.setHeightInPoints(18);

                Cell cEsp = row.createCell(0);
                cEsp.setCellValue(f.getEspecialidad());
                cEsp.setCellStyle(styleDataLeft);

                Cell cRef = row.createCell(1);
                cRef.setCellValue(f.getReferencias());
                cRef.setCellStyle(styleDataCenter);
            }

            // 4. Fila TOTAL
            Row rowTotal = sheet.createRow(rowIdx);
            rowTotal.setHeightInPoints(22);
            Cell cTotLabel = rowTotal.createCell(0);
            cTotLabel.setCellValue("TOTAL");
            cTotLabel.setCellStyle(styleTotalLeft);

            Cell cTotVal = rowTotal.createCell(1);
            cTotVal.setCellValue(data.getTotalReferencias());
            cTotVal.setCellStyle(styleTotalCenter);

            // Ajustar anchos de columnas
            sheet.setColumnWidth(0, 30 * 256);
            sheet.setColumnWidth(1, 16 * 256);

            // 5. Generar Gráfico de Columnas Verticales en Excel (XDDFChart)
            if (data.getFilas() != null && !data.getFilas().isEmpty()) {
                XSSFSheet xssfSheet = (XSSFSheet) sheet;
                XSSFDrawing drawing = xssfSheet.createDrawingPatriarch();
                // Ubicación: Desde columna D (col 3), fila 1 (row 0) hasta columna P (col 15), fila 20 (row 19)
                XSSFClientAnchor anchor = drawing.createAnchor(0, 0, 0, 0, 3, 0, 15, 20);

                XSSFChart chart = drawing.createChart(anchor);
                chart.setTitleText("REFERENCIAS MÉDICAS " + data.getNombreMes());
                chart.setTitleOverlay(false);

                // Ejes
                XDDFCategoryAxis bottomAxis = chart.createCategoryAxis(AxisPosition.BOTTOM);
                XDDFValueAxis leftAxis = chart.createValueAxis(AxisPosition.LEFT);
                leftAxis.setCrosses(AxisCrosses.AUTO_ZERO);

                // Rango de categorías (incluyendo especialidades y fila TOTAL)
                XDDFDataSource<String> categories = XDDFDataSourcesFactory.fromStringCellRange(xssfSheet,
                        new CellRangeAddress(2, rowIdx, 0, 0));
                XDDFNumericalDataSource<Double> values = XDDFDataSourcesFactory.fromNumericCellRange(xssfSheet,
                        new CellRangeAddress(2, rowIdx, 1, 1));

                XDDFBarChartData barChartData = (XDDFBarChartData) chart.createData(ChartTypes.BAR, bottomAxis, leftAxis);
                barChartData.setBarDirection(BarDirection.COL);
                barChartData.setVaryColors(false);

                XDDFBarChartData.Series series = (XDDFBarChartData.Series) barChartData.addSeries(categories, values);
                series.setTitle("Referencias", null);

                chart.plot(barChartData);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    @Transactional(readOnly = true)
    public List<PacienteResumenSocialResponse> listarPacientesRecientes(String buscar) {
        PageRequest pageRequest = PageRequest.of(0, 10);
        List<Paciente> pacientes;
        if (buscar != null && !buscar.trim().isEmpty()) {
            pacientes = pacienteRepository.buscarPaginado(buscar.trim(), pageRequest);
        } else {
            pacientes = pacienteRepository.findTopRecientes(pageRequest);
        }

        return pacientes.stream().map(this::mapToResumen).toList();
    }

    @Transactional(readOnly = true)
    public ExpedienteSocialResponse obtenerExpediente(Long idPaciente) {
        Paciente paciente = pacienteRepository.findById(idPaciente)
                .orElseThrow(() -> new PacienteNotFoundException(idPaciente));

        PacienteResumenSocialResponse resumen = mapToResumen(paciente);

        // 1. Obtener historial de referencias médicas
        List<ReferenciaMedica> refs = referenciaMedicaRepository.findByPaciente_IdPacienteOrderByFechaReferenciaDesc(idPaciente);
        List<ExpedienteSocialResponse.ReferenciaItemSocialResponse> refList = refs.stream()
                .map(r -> ExpedienteSocialResponse.ReferenciaItemSocialResponse.builder()
                        .idReferencia(r.getIdReferencia())
                        .fechaReferencia(r.getFechaReferencia())
                        .especialidad(r.getEspecialidad() != null ? r.getEspecialidad().getNombre() : "No especificada")
                        .medico(r.getMedico() != null ? (r.getMedico().getNombres() + " " + r.getMedico().getApellidos()) : "Médico")
                        .motivoReferencia(r.getMotivoReferencia())
                        .build())
                .toList();

        // 2. Obtener historial de consultas médicas y diagnósticos (sin signos vitales)
        List<Consulta> consultas = consultaRepository.findByPacienteOrderByFechaConsultaDesc(paciente);
        List<ExpedienteSocialResponse.ConsultaItemSocialResponse> consultaList = consultas.stream()
                .map(c -> {
                    List<Diagnostico> diags = diagnosticoRepository.findByConsulta_IdConsulta(c.getIdConsulta());
                    List<String> diagNames = diags.stream()
                            .map(Diagnostico::getDescripcion)
                            .filter(d -> d != null && !d.trim().isEmpty())
                            .toList();

                    return ExpedienteSocialResponse.ConsultaItemSocialResponse.builder()
                            .idConsulta(c.getIdConsulta())
                            .fechaConsulta(c.getFechaConsulta())
                            .medico(c.getMedico() != null ? (c.getMedico().getNombres() + " " + c.getMedico().getApellidos()) : "Médico")
                            .motivoConsulta(c.getMotivoConsulta())
                            .historiaEnfermedadActual(c.getHistoriaEnfermedadActual())
                            .impresionClinica(c.getImpresionClinica())
                            .planMedico(c.getPlanMedico())
                            .diagnosticos(diagNames)
                            .build();
                })
                .toList();

        return ExpedienteSocialResponse.builder()
                .paciente(resumen)
                .referencias(refList)
                .consultas(consultaList)
                .build();
    }

    private PacienteResumenSocialResponse mapToResumen(Paciente p) {
        Integer edad = null;
        if (p.getFechaNacimiento() != null) {
            edad = Period.between(p.getFechaNacimiento(), LocalDate.now()).getYears();
        }

        long totalRefs = referenciaMedicaRepository.countByPaciente_IdPaciente(p.getIdPaciente());

        return PacienteResumenSocialResponse.builder()
                .idPaciente(p.getIdPaciente())
                .nombres(p.getNombres())
                .apellidos(p.getApellidos())
                .sexo(p.getSexo() != null ? p.getSexo().name() : null)
                .fechaNacimiento(p.getFechaNacimiento())
                .edad(edad)
                .telefono(p.getTelefono())
                .comunidad(p.getComunidad())
                .ultimaAtencion(p.getFechaRegistro())
                .totalReferencias(totalRefs)
                .build();
    }
}
