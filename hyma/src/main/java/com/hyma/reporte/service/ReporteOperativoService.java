package com.hyma.reporte.service;

import com.hyma.consulta.model.Consulta;
import com.hyma.consulta.repository.ConsultaRepository;
import com.hyma.farmacia.model.DetalleSalidaMedicamento;
import com.hyma.farmacia.model.SalidaMedicamento;
import com.hyma.farmacia.repository.DetalleSalidaMedicamentoRepository;
import com.hyma.farmacia.repository.SalidaMedicamentoRepository;
import com.hyma.procedimiento.model.ConsultaProcedimiento;
import com.hyma.procedimiento.repository.ConsultaProcedimientoRepository;
import com.hyma.recepcion.model.Paciente;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReporteOperativoService {

    private final ConsultaRepository consultaRepository;
    private final SalidaMedicamentoRepository salidaMedicamentoRepository;
    private final DetalleSalidaMedicamentoRepository detalleSalidaMedicamentoRepository;
    private final ConsultaProcedimientoRepository consultaProcedimientoRepository;

    private static final String[] NOMBRES_MESES = {
            "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
            "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
    };

    private static final String[] NOMBRES_MESES_ABR = {
            "ene", "feb", "mar", "abr", "may", "jun",
            "jul", "ago", "sep", "oct", "nov", "dic"
    };

    private String getNombreMes(int mes) {
        if (mes >= 1 && mes <= 12) {
            return NOMBRES_MESES[mes - 1];
        }
        return String.valueOf(mes);
    }

    private String getNombreMesAbr(int mes) {
        if (mes >= 1 && mes <= 12) {
            return NOMBRES_MESES_ABR[mes - 1];
        }
        return String.valueOf(mes);
    }

    private void setBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    private void setMediumBorders(CellStyle style) {
        style.setBorderTop(BorderStyle.MEDIUM);
        style.setBorderBottom(BorderStyle.MEDIUM);
        style.setBorderLeft(BorderStyle.MEDIUM);
        style.setBorderRight(BorderStyle.MEDIUM);
    }

    private void applyBordersToRegion(Sheet sheet, CellRangeAddress region, CellStyle style) {
        for (int r = region.getFirstRow(); r <= region.getLastRow(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) row = sheet.createRow(r);
            for (int c = region.getFirstColumn(); c <= region.getLastColumn(); c++) {
                Cell cell = row.getCell(c);
                if (cell == null) cell = row.createCell(c);
                cell.setCellStyle(style);
            }
        }
    }

    // =========================================================================
    // 1. REPORTE PACIENTES ATENDIDOS POR DÍA EN EL MES (PacientesMES)
    // =========================================================================
    @Transactional(readOnly = true)
    public byte[] generarExcelPacientesMes(int anio, int mes) throws IOException {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        List<Consulta> consultas = consultaRepository.findByFechaConsultaBetweenOrderByFechaConsultaAsc(inicioMes, finMes);

        // Mapear salidas asociadas a consultas
        List<Long> idsConsultas = consultas.stream()
                .map(Consulta::getIdConsulta)
                .filter(Objects::nonNull)
                .toList();

        Map<Long, SalidaMedicamento> salidasPorConsulta = new HashMap<>();
        Map<Long, BigDecimal> costoMedicamentosPorSalida = new HashMap<>();

        if (!idsConsultas.isEmpty()) {
            List<SalidaMedicamento> salidas = salidaMedicamentoRepository.findByConsulta_IdConsultaIn(idsConsultas);
            List<Long> idsSalidas = new ArrayList<>();
            for (SalidaMedicamento s : salidas) {
                if (s.getConsulta() != null && s.getConsulta().getIdConsulta() != null) {
                    salidasPorConsulta.put(s.getConsulta().getIdConsulta(), s);
                    if (s.getIdSalida() != null) idsSalidas.add(s.getIdSalida());
                }
            }

            if (!idsSalidas.isEmpty()) {
                List<DetalleSalidaMedicamento> detalles = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidas);
                for (DetalleSalidaMedicamento d : detalles) {
                    if (d.getSalida() != null && d.getSalida().getIdSalida() != null) {
                        Long idS = d.getSalida().getIdSalida();
                        BigDecimal sub = (d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO)
                                .multiply(BigDecimal.valueOf(d.getCantidad() != null ? d.getCantidad() : 0));
                        costoMedicamentosPorSalida.merge(idS, sub, BigDecimal::add);
                    }
                }
            }
        }

        // Procedimientos del mes para el resumen financiero
        List<ConsultaProcedimiento> procsMes = consultaProcedimientoRepository
                .findByFechaRegistroBetweenOrderByFechaRegistroAsc(inicioMes, finMes);
        BigDecimal totalIngresoProcedimientos = BigDecimal.ZERO;
        for (ConsultaProcedimiento cp : procsMes) {
            if ("ATENDIDO".equalsIgnoreCase(cp.getEstado()) || "FINALIZADO".equalsIgnoreCase(cp.getEstado())) {
                BigDecimal costo = cp.getSubtotal() != null ? cp.getSubtotal()
                        : (cp.getPrecioUnitario() != null ? cp.getPrecioUnitario().multiply(BigDecimal.valueOf(cp.getCantidad() != null ? cp.getCantidad() : 1)) : BigDecimal.ZERO);
                totalIngresoProcedimientos = totalIngresoProcedimientos.add(costo);
            }
        }

        // Ventas externas del mes para el resumen financiero
        List<SalidaMedicamento> ventasExternas = salidaMedicamentoRepository
                .findByTipoSalidaIgnoreCaseAndFechaSalidaBetweenOrderByFechaSalidaDesc("VENTA_EXTERNA", inicioMes, finMes);
        BigDecimal totalIngresoVentasExternas = BigDecimal.ZERO;
        if (!ventasExternas.isEmpty()) {
            List<Long> idsVentasExt = ventasExternas.stream().map(SalidaMedicamento::getIdSalida).filter(Objects::nonNull).toList();
            if (!idsVentasExt.isEmpty()) {
                List<DetalleSalidaMedicamento> detsExt = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsVentasExt);
                for (DetalleSalidaMedicamento d : detsExt) {
                    BigDecimal sub = (d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO)
                            .multiply(BigDecimal.valueOf(d.getCantidad() != null ? d.getCantidad() : 0));
                    totalIngresoVentasExternas = totalIngresoVentasExternas.add(sub);
                }
            }
        }

        // Agrupar consultas por día del mes
        Map<LocalDate, List<Consulta>> consultasPorDia = consultas.stream()
                .collect(Collectors.groupingBy(c -> c.getFechaConsulta().toLocalDate(), TreeMap::new, Collectors.toList()));

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Pacientes Atendidos");
            sheet.setDisplayGridlines(true);

            DataFormat df = wb.createDataFormat();

            // Fuentes
            Font fontTitle = wb.createFont();
            fontTitle.setBold(true);
            fontTitle.setFontHeightInPoints((short) 12);

            Font fontSubtitle = wb.createFont();
            fontSubtitle.setBold(true);
            fontSubtitle.setFontHeightInPoints((short) 10);

            Font fontBold = wb.createFont();
            fontBold.setBold(true);
            fontBold.setFontHeightInPoints((short) 10);

            Font fontRegular = wb.createFont();
            fontRegular.setFontHeightInPoints((short) 9.5);

            // Estilos
            CellStyle styleMainHeader = wb.createCellStyle();
            styleMainHeader.setFont(fontTitle);
            styleMainHeader.setAlignment(HorizontalAlignment.CENTER);
            styleMainHeader.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle styleSubHeader = wb.createCellStyle();
            styleSubHeader.setFont(fontSubtitle);
            styleSubHeader.setAlignment(HorizontalAlignment.CENTER);
            styleSubHeader.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle styleDateBanner = wb.createCellStyle();
            styleDateBanner.setFont(fontBold);
            styleDateBanner.setAlignment(HorizontalAlignment.CENTER);
            styleDateBanner.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleDateBanner);

            CellStyle styleColHeader = wb.createCellStyle();
            styleColHeader.setFont(fontBold);
            styleColHeader.setAlignment(HorizontalAlignment.CENTER);
            styleColHeader.setVerticalAlignment(VerticalAlignment.CENTER);
            styleColHeader.setWrapText(true);
            setBorders(styleColHeader);

            CellStyle styleCellText = wb.createCellStyle();
            styleCellText.setFont(fontRegular);
            styleCellText.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleCellText);

            CellStyle styleCellCenter = wb.createCellStyle();
            styleCellCenter.setFont(fontRegular);
            styleCellCenter.setAlignment(HorizontalAlignment.CENTER);
            styleCellCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleCellCenter);

            CellStyle styleCellNum = wb.createCellStyle();
            styleCellNum.setFont(fontRegular);
            styleCellNum.setAlignment(HorizontalAlignment.RIGHT);
            styleCellNum.setVerticalAlignment(VerticalAlignment.CENTER);
            styleCellNum.setDataFormat(df.getFormat("#,##0.00"));
            setBorders(styleCellNum);

            CellStyle styleCellTotalDay = wb.createCellStyle();
            styleCellTotalDay.setFont(fontBold);
            styleCellTotalDay.setAlignment(HorizontalAlignment.RIGHT);
            styleCellTotalDay.setVerticalAlignment(VerticalAlignment.CENTER);
            styleCellTotalDay.setDataFormat(df.getFormat("#,##0.00"));
            setBorders(styleCellTotalDay);

            CellStyle styleYellowHighlight = wb.createCellStyle();
            styleYellowHighlight.setFont(fontBold);
            styleYellowHighlight.setAlignment(HorizontalAlignment.RIGHT);
            styleYellowHighlight.setVerticalAlignment(VerticalAlignment.CENTER);
            styleYellowHighlight.setDataFormat(df.getFormat("#,##0.00"));
            styleYellowHighlight.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
            styleYellowHighlight.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            setBorders(styleYellowHighlight);

            CellStyle styleResumenBorder = wb.createCellStyle();
            styleResumenBorder.setFont(fontBold);
            styleResumenBorder.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleResumenBorder);

            CellStyle styleCurrencyFormat = wb.createCellStyle();
            styleCurrencyFormat.setFont(fontBold);
            styleCurrencyFormat.setAlignment(HorizontalAlignment.RIGHT);
            styleCurrencyFormat.setVerticalAlignment(VerticalAlignment.CENTER);
            styleCurrencyFormat.setDataFormat(df.getFormat("Q#,##0.00"));
            setBorders(styleCurrencyFormat);

            int rowIdx = 0;

            // 1. Títulos superiores
            Row r0 = sheet.createRow(rowIdx++);
            Cell c0 = r0.createCell(0);
            c0.setCellValue("Asociación Hombres y Mujeres en Acción");
            c0.setCellStyle(styleMainHeader);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));

            Row r1 = sheet.createRow(rowIdx++);
            Cell c1 = r1.createCell(0);
            c1.setCellValue("Programa De Salud Obras Sociales San Martín");
            c1.setCellStyle(styleSubHeader);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 8));

            Row r2 = sheet.createRow(rowIdx++);
            Cell c2 = r2.createCell(0);
            c2.setCellValue("Pacientes atendidos Clínica Santo Domingo");
            c2.setCellStyle(styleSubHeader);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 8));

            Row r3 = sheet.createRow(rowIdx++);
            Cell cMesLabel = r3.createCell(5);
            cMesLabel.setCellValue("Mes");
            cMesLabel.setCellStyle(styleColHeader);

            Cell cMesVal = r3.createCell(6);
            cMesVal.setCellValue(getNombreMesAbr(mes) + "-" + String.valueOf(anio).substring(2));
            cMesVal.setCellStyle(styleColHeader);

            rowIdx++; // Fila en blanco

            // Variables acumuladoras mensuales
            int totalPacientesMes = 0;
            int totalSinRecursosMes = 0;
            int totalBecadosMes = 0;
            int totalPagaronMes = 0;
            BigDecimal totalRecaudadoConsultasMes = BigDecimal.ZERO;

            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

            // Recorrer cada día
            for (Map.Entry<LocalDate, List<Consulta>> entry : consultasPorDia.entrySet()) {
                LocalDate fechaDia = entry.getKey();
                List<Consulta> listaDia = entry.getValue();

                // Encabezado de Fecha del Día
                Row rFecha = sheet.createRow(rowIdx);
                Cell cFecha = rFecha.createCell(0);
                cFecha.setCellValue("FECHA  " + fechaDia.getDayOfMonth() + "/" + getNombreMes(fechaDia.getMonthValue()) + "/" + fechaDia.getYear());
                cFecha.setCellStyle(styleDateBanner);
                CellRangeAddress regionFecha = new CellRangeAddress(rowIdx, rowIdx, 0, 8);
                sheet.addMergedRegion(regionFecha);
                applyBordersToRegion(sheet, regionFecha, styleDateBanner);
                rowIdx++;

                // Fila de Columnas
                Row rCols = sheet.createRow(rowIdx++);
                String[] cols = {"No", "Nombre", "Apellido", "No pagan", "Consulta\nRegular", "Tratamiento", "Total", "Observaciones", "Hora"};
                for (int i = 0; i < cols.length; i++) {
                    Cell c = rCols.createCell(i);
                    c.setCellValue(cols[i]);
                    c.setCellStyle(styleColHeader);
                }

                int noDia = 1;
                BigDecimal sumaConsultaDia = BigDecimal.ZERO;
                BigDecimal sumaTratamientoDia = BigDecimal.ZERO;
                BigDecimal sumaTotalDia = BigDecimal.ZERO;
                int sinRecursosDia = 0;
                int becadosDia = 0;

                for (Consulta c : listaDia) {
                    Paciente p = c.getPaciente();
                    SalidaMedicamento s = salidasPorConsulta.get(c.getIdConsulta());

                    String tipoSalida = s != null && s.getTipoSalida() != null ? s.getTipoSalida().trim().toUpperCase() : "";
                    boolean esSR = "SR".equals(tipoSalida) || "S/R".equals(tipoSalida);
                    boolean esBecado = "BECADO".equals(tipoSalida);
                    boolean esNoPaga = esSR || esBecado;

                    String noPagaText = "";
                    if (esBecado) {
                        noPagaText = "Becado";
                        becadosDia++;
                        totalBecadosMes++;
                    } else if (esSR) {
                        noPagaText = "S/R";
                        sinRecursosDia++;
                        totalSinRecursosMes++;
                    } else {
                        totalPagaronMes++;
                    }

                    BigDecimal precioConsulta = (c.getPrecioConsulta() != null && !esNoPaga)
                            ? c.getPrecioConsulta() : BigDecimal.ZERO;

                    BigDecimal costoTratamiento = BigDecimal.ZERO;
                    if (s != null && s.getIdSalida() != null && !esNoPaga) {
                        costoTratamiento = costoMedicamentosPorSalida.getOrDefault(s.getIdSalida(), BigDecimal.ZERO);
                    }

                    BigDecimal totalFila = esNoPaga ? BigDecimal.ZERO : precioConsulta.add(costoTratamiento);

                    sumaConsultaDia = sumaConsultaDia.add(precioConsulta);
                    sumaTratamientoDia = sumaTratamientoDia.add(costoTratamiento);
                    sumaTotalDia = sumaTotalDia.add(totalFila);
                    totalPacientesMes++;

                    String obs = s != null && s.getObservaciones() != null ? s.getObservaciones() : "";
                    String hora = c.getFechaConsulta() != null ? c.getFechaConsulta().format(timeFormatter) : "";

                    Row rD = sheet.createRow(rowIdx++);

                    // Col 0: No
                    Cell cellNo = rD.createCell(0);
                    cellNo.setCellValue(noDia++);
                    cellNo.setCellStyle(styleCellCenter);

                    // Col 1: Nombre
                    Cell cellNom = rD.createCell(1);
                    cellNom.setCellValue(p != null && p.getNombres() != null ? p.getNombres() : "");
                    cellNom.setCellStyle(styleCellText);

                    // Col 2: Apellido
                    Cell cellApe = rD.createCell(2);
                    cellApe.setCellValue(p != null && p.getApellidos() != null ? p.getApellidos() : "");
                    cellApe.setCellStyle(styleCellText);

                    // Col 3: No pagan
                    Cell cellNoPagan = rD.createCell(3);
                    cellNoPagan.setCellValue(noPagaText);
                    cellNoPagan.setCellStyle(styleCellCenter);

                    // Col 4: Consulta Regular
                    Cell cellCons = rD.createCell(4);
                    if (precioConsulta.compareTo(BigDecimal.ZERO) > 0) {
                        cellCons.setCellValue(precioConsulta.doubleValue());
                    }
                    cellCons.setCellStyle(styleCellNum);

                    // Col 5: Tratamiento
                    Cell cellTrat = rD.createCell(5);
                    if (costoTratamiento.compareTo(BigDecimal.ZERO) > 0) {
                        cellTrat.setCellValue(costoTratamiento.doubleValue());
                    }
                    cellTrat.setCellStyle(styleCellNum);

                    // Col 6: Total
                    Cell cellTot = rD.createCell(6);
                    cellTot.setCellValue(totalFila.doubleValue());
                    cellTot.setCellStyle(styleCellNum);

                    // Col 7: Observaciones
                    Cell cellObs = rD.createCell(7);
                    cellObs.setCellValue(obs);
                    cellObs.setCellStyle(styleCellText);

                    // Col 8: Hora
                    Cell cellHora = rD.createCell(8);
                    cellHora.setCellValue(hora);
                    cellHora.setCellStyle(styleCellCenter);
                }

                totalRecaudadoConsultasMes = totalRecaudadoConsultasMes.add(sumaTotalDia);

                // Fila de Resumen Diario: Pacientes que no pagaron / Totales del día
                Row rTotDia = sheet.createRow(rowIdx);
                Cell cTotLabel = rTotDia.createCell(0);
                cTotLabel.setCellValue("Pacientes que no pagaron");
                cTotLabel.setCellStyle(styleResumenBorder);
                CellRangeAddress regTot = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
                sheet.addMergedRegion(regTot);
                applyBordersToRegion(sheet, regTot, styleResumenBorder);

                Cell cSumCons = rTotDia.createCell(4);
                cSumCons.setCellValue(sumaConsultaDia.doubleValue());
                cSumCons.setCellStyle(styleCellTotalDay);

                Cell cSumTrat = rTotDia.createCell(5);
                cSumTrat.setCellValue(sumaTratamientoDia.doubleValue());
                cSumTrat.setCellStyle(styleCellTotalDay);

                Cell cSumTot = rTotDia.createCell(6);
                cSumTot.setCellValue(sumaTotalDia.doubleValue());
                cSumTot.setCellStyle(styleYellowHighlight);

                Cell cVoid7 = rTotDia.createCell(7);
                cVoid7.setCellStyle(styleCellText);
                Cell cVoid8 = rTotDia.createCell(8);
                cVoid8.setCellStyle(styleCellText);
                rowIdx++;

                // Fila Sin Recursos
                Row rSR = sheet.createRow(rowIdx);
                Cell cSRLabel = rSR.createCell(0);
                cSRLabel.setCellValue("Sin recursos");
                cSRLabel.setCellStyle(styleResumenBorder);
                CellRangeAddress regSRLabel = new CellRangeAddress(rowIdx, rowIdx, 0, 2);
                sheet.addMergedRegion(regSRLabel);
                applyBordersToRegion(sheet, regSRLabel, styleResumenBorder);

                Cell cSRVal = rSR.createCell(3);
                cSRVal.setCellValue(sinRecursosDia);
                cSRVal.setCellStyle(styleCellCenter);
                rowIdx++;

                // Fila Becado
                Row rBec = sheet.createRow(rowIdx);
                Cell cBecLabel = rBec.createCell(0);
                cBecLabel.setCellValue("Becado");
                cBecLabel.setCellStyle(styleResumenBorder);
                CellRangeAddress regBecLabel = new CellRangeAddress(rowIdx, rowIdx, 0, 2);
                sheet.addMergedRegion(regBecLabel);
                applyBordersToRegion(sheet, regBecLabel, styleResumenBorder);

                Cell cBecVal = rBec.createCell(3);
                cBecVal.setCellValue(becadosDia);
                cBecVal.setCellStyle(styleCellCenter);
                rowIdx++;

                rowIdx++; // Espacio antes del siguiente día
            }

            // =========================================================================
            // RESUMEN MENSUAL AL FINAL DE LA HOJA (Imagen 2)
            // =========================================================================
            Row rResHead = sheet.createRow(rowIdx++);
            Cell cResHead = rResHead.createCell(0);
            cResHead.setCellValue("RESUMEN REPORTE CLINICA");
            cResHead.setCellStyle(styleMainHeader);
            sheet.addMergedRegion(new CellRangeAddress(rowIdx - 1, rowIdx - 1, 0, 4));

            Row rTotPac = sheet.createRow(rowIdx);
            Cell cTotPacLabel = rTotPac.createCell(0);
            cTotPacLabel.setCellValue("Total pacientes atendidos durante el mes");
            cTotPacLabel.setCellStyle(styleResumenBorder);
            CellRangeAddress regTotPac = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regTotPac);
            applyBordersToRegion(sheet, regTotPac, styleResumenBorder);

            Cell cTotPacVal = rTotPac.createCell(4);
            cTotPacVal.setCellValue(totalPacientesMes);
            cTotPacVal.setCellStyle(styleCellCenter);
            rowIdx += 2;

            // Tabla No Pagan / Pagan
            int totalNoPagan = totalSinRecursosMes + totalBecadosMes;

            Row rNPHead = sheet.createRow(rowIdx);
            Cell cNPLabel = rNPHead.createCell(0);
            cNPLabel.setCellValue("Pacientes que no pagaron");
            cNPLabel.setCellStyle(styleResumenBorder);
            CellRangeAddress regNP1 = new CellRangeAddress(rowIdx, rowIdx, 0, 2);
            sheet.addMergedRegion(regNP1);
            applyBordersToRegion(sheet, regNP1, styleResumenBorder);

            Cell cNPTotLabel = rNPHead.createCell(3);
            cNPTotLabel.setCellValue("TOTAL");
            cNPTotLabel.setCellStyle(styleCellCenter);

            Cell cNPTotVal = rNPHead.createCell(4);
            cNPTotVal.setCellValue(totalNoPagan);
            cNPTotVal.setCellStyle(styleCellCenter);
            rowIdx++;

            Row rSRMes = sheet.createRow(rowIdx);
            Cell cSRMesLab = rSRMes.createCell(0);
            cSRMesLab.setCellValue("Sin recursos");
            cSRMesLab.setCellStyle(styleCellText);
            CellRangeAddress regSRM = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regSRM);
            applyBordersToRegion(sheet, regSRM, styleCellText);

            Cell cSRMesVal = rSRMes.createCell(4);
            cSRMesVal.setCellValue(totalSinRecursosMes);
            cSRMesVal.setCellStyle(styleCellCenter);
            rowIdx++;

            Row rBecMes = sheet.createRow(rowIdx);
            Cell cBecMesLab = rBecMes.createCell(0);
            cBecMesLab.setCellValue("Becados");
            cBecMesLab.setCellStyle(styleCellText);
            CellRangeAddress regBecM = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regBecM);
            applyBordersToRegion(sheet, regBecM, styleCellText);

            Cell cBecMesVal = rBecMes.createCell(4);
            cBecMesVal.setCellValue(totalBecadosMes);
            cBecMesVal.setCellStyle(styleCellCenter);
            rowIdx++;

            Row rPagMes = sheet.createRow(rowIdx);
            Cell cPagLab = rPagMes.createCell(0);
            cPagLab.setCellValue("Pacientes que pagaron");
            cPagLab.setCellStyle(styleResumenBorder);
            CellRangeAddress regPagM = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regPagM);
            applyBordersToRegion(sheet, regPagM, styleResumenBorder);

            Cell cPagVal = rPagMes.createCell(4);
            cPagVal.setCellValue(totalPagaronMes);
            cPagVal.setCellStyle(styleCellCenter);
            rowIdx++;

            Row rTotGen = sheet.createRow(rowIdx);
            Cell cTotGenLab = rTotGen.createCell(0);
            cTotGenLab.setCellValue("TOTAL");
            cTotGenLab.setCellStyle(styleResumenBorder);
            CellRangeAddress regTotGM = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regTotGM);
            applyBordersToRegion(sheet, regTotGM, styleResumenBorder);

            Cell cTotGenVal = rTotGen.createCell(4);
            cTotGenVal.setCellValue(totalPacientesMes);
            cTotGenVal.setCellStyle(styleCellCenter);
            rowIdx += 2;

            // Tabla Ingreso en Efectivo
            Row rIngHead = sheet.createRow(rowIdx);
            Cell cIngHead = rIngHead.createCell(0);
            cIngHead.setCellValue("INGRESO EN EFECTIVO");
            cIngHead.setCellStyle(styleResumenBorder);
            CellRangeAddress regIngH = new CellRangeAddress(rowIdx, rowIdx, 0, 4);
            sheet.addMergedRegion(regIngH);
            applyBordersToRegion(sheet, regIngH, styleResumenBorder);
            rowIdx++;

            Row rIngCons = sheet.createRow(rowIdx);
            Cell cIngConsLab = rIngCons.createCell(0);
            cIngConsLab.setCellValue("Consulta y medicina");
            cIngConsLab.setCellStyle(styleCellText);
            CellRangeAddress regIngC = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regIngC);
            applyBordersToRegion(sheet, regIngC, styleCellText);

            Cell cIngConsVal = rIngCons.createCell(4);
            cIngConsVal.setCellValue(totalRecaudadoConsultasMes.doubleValue());
            cIngConsVal.setCellStyle(styleCurrencyFormat);
            rowIdx++;

            Row rIngVentExt = sheet.createRow(rowIdx);
            Cell cIngExtLab = rIngVentExt.createCell(0);
            cIngExtLab.setCellValue("Venta de medicamentos");
            cIngExtLab.setCellStyle(styleCellText);
            CellRangeAddress regIngE = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regIngE);
            applyBordersToRegion(sheet, regIngE, styleCellText);

            Cell cIngExtVal = rIngVentExt.createCell(4);
            cIngExtVal.setCellValue(totalIngresoVentasExternas.doubleValue());
            cIngExtVal.setCellStyle(styleCurrencyFormat);
            rowIdx++;

            Row rIngProc = sheet.createRow(rowIdx);
            Cell cIngProcLab = rIngProc.createCell(0);
            cIngProcLab.setCellValue("Cobro por procedimientos");
            cIngProcLab.setCellStyle(styleCellText);
            CellRangeAddress regIngP = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regIngP);
            applyBordersToRegion(sheet, regIngP, styleCellText);

            Cell cIngProcVal = rIngProc.createCell(4);
            cIngProcVal.setCellValue(totalIngresoProcedimientos.doubleValue());
            cIngProcVal.setCellStyle(styleCurrencyFormat);
            rowIdx++;

            BigDecimal totalEfectivoGlobal = totalRecaudadoConsultasMes
                    .add(totalIngresoVentasExternas)
                    .add(totalIngresoProcedimientos);

            Row rIngTot = sheet.createRow(rowIdx);
            Cell cIngTotLab = rIngTot.createCell(0);
            cIngTotLab.setCellValue("TOTAL");
            cIngTotLab.setCellStyle(styleResumenBorder);
            CellRangeAddress regIngT = new CellRangeAddress(rowIdx, rowIdx, 0, 3);
            sheet.addMergedRegion(regIngT);
            applyBordersToRegion(sheet, regIngT, styleResumenBorder);

            Cell cIngTotVal = rIngTot.createCell(4);
            cIngTotVal.setCellValue(totalEfectivoGlobal.doubleValue());
            cIngTotVal.setCellStyle(styleCurrencyFormat);

            // Ajuste de columnas
            sheet.setColumnWidth(0, 1800);  // No
            sheet.setColumnWidth(1, 5500);  // Nombre
            sheet.setColumnWidth(2, 5500);  // Apellido
            sheet.setColumnWidth(3, 3200);  // No pagan
            sheet.setColumnWidth(4, 3400);  // Consulta Regular
            sheet.setColumnWidth(5, 3400);  // Tratamiento
            sheet.setColumnWidth(6, 3400);  // Total
            sheet.setColumnWidth(7, 6000);  // Observaciones
            sheet.setColumnWidth(8, 2800);  // Hora

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    // =========================================================================
    // 2. REPORTE CONTROL DE PROCEDIMIENTOS DE CLÍNICA (ProcedimientosMES)
    // =========================================================================
    @Transactional(readOnly = true)
    public byte[] generarExcelProcedimientosMes(int anio, int mes) throws IOException {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        List<ConsultaProcedimiento> procedimientos = consultaProcedimientoRepository
                .findByFechaRegistroBetweenOrderByFechaRegistroAsc(inicioMes, finMes);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Procedimientos");
            sheet.setDisplayGridlines(true);

            DataFormat df = wb.createDataFormat();

            Font fontTitle = wb.createFont();
            fontTitle.setBold(true);
            fontTitle.setFontHeightInPoints((short) 11);

            Font fontBold = wb.createFont();
            fontBold.setBold(true);
            fontBold.setFontHeightInPoints((short) 10);

            Font fontRegular = wb.createFont();
            fontRegular.setFontHeightInPoints((short) 10);

            // Estilos
            CellStyle styleTitle = wb.createCellStyle();
            styleTitle.setFont(fontTitle);
            styleTitle.setAlignment(HorizontalAlignment.CENTER);
            styleTitle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle styleMes = wb.createCellStyle();
            styleMes.setFont(fontRegular);
            styleMes.setAlignment(HorizontalAlignment.RIGHT);
            styleMes.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle styleColHeader = wb.createCellStyle();
            styleColHeader.setFont(fontBold);
            styleColHeader.setAlignment(HorizontalAlignment.CENTER);
            styleColHeader.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleColHeader);

            CellStyle styleCellText = wb.createCellStyle();
            styleCellText.setFont(fontRegular);
            styleCellText.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleCellText);

            CellStyle styleCellCenter = wb.createCellStyle();
            styleCellCenter.setFont(fontRegular);
            styleCellCenter.setAlignment(HorizontalAlignment.CENTER);
            styleCellCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleCellCenter);

            CellStyle styleCellCurrency = wb.createCellStyle();
            styleCellCurrency.setFont(fontRegular);
            styleCellCurrency.setAlignment(HorizontalAlignment.RIGHT);
            styleCellCurrency.setVerticalAlignment(VerticalAlignment.CENTER);
            styleCellCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            setBorders(styleCellCurrency);

            CellStyle styleTotal = wb.createCellStyle();
            styleTotal.setFont(fontBold);
            styleTotal.setAlignment(HorizontalAlignment.CENTER);
            styleTotal.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleTotal);

            CellStyle styleTotalCurrency = wb.createCellStyle();
            styleTotalCurrency.setFont(fontBold);
            styleTotalCurrency.setAlignment(HorizontalAlignment.RIGHT);
            styleTotalCurrency.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTotalCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            setBorders(styleTotalCurrency);

            int rowIdx = 0;

            // Encabezados institucionales
            Row r0 = sheet.createRow(rowIdx++);
            Cell c0 = r0.createCell(0);
            c0.setCellValue("ASOCIACION HOMBRES Y MUJERES EN ACCION");
            c0.setCellStyle(styleTitle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

            Row r1 = sheet.createRow(rowIdx++);
            Cell c1 = r1.createCell(0);
            c1.setCellValue("OBRAS SOCIALES SAN MARTIN");
            c1.setCellStyle(styleTitle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 4));

            Row r2 = sheet.createRow(rowIdx++);
            Cell c2 = r2.createCell(0);
            c2.setCellValue("CONTROL DE PROCEDIMIENTOS DE CLINICA");
            c2.setCellStyle(styleTitle);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 0, 4));

            Row r3 = sheet.createRow(rowIdx++);
            Cell cMes = r3.createCell(3);
            cMes.setCellValue("Mes: " + getNombreMes(mes) + " " + anio);
            cMes.setCellStyle(styleMes);
            sheet.addMergedRegion(new CellRangeAddress(3, 3, 3, 4));

            // Columnas (Imagen 4): Num. | Nombre | Procedimiento | Observaciones | Costo
            Row rCols = sheet.createRow(rowIdx++);
            String[] cols = {"Num.", "Nombre", "Procedimiento", "Observaciones", "Costo"};
            for (int i = 0; i < cols.length; i++) {
                Cell c = rCols.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(styleColHeader);
            }

            int num = 1;
            BigDecimal sumaTotal = BigDecimal.ZERO;

            for (ConsultaProcedimiento cp : procedimientos) {
                Paciente p = cp.getPaciente();
                String nombreCompleto = p != null
                        ? ((p.getNombres() != null ? p.getNombres() : "") + " " + (p.getApellidos() != null ? p.getApellidos() : "")).trim()
                        : "Paciente Desconocido";

                String nombreProc = cp.getProcedimiento() != null && cp.getProcedimiento().getNombre() != null
                        ? cp.getProcedimiento().getNombre()
                        : "Procedimiento";

                String obs = cp.getInstrucciones() != null ? cp.getInstrucciones() : "";

                BigDecimal costo = cp.getSubtotal() != null ? cp.getSubtotal()
                        : (cp.getPrecioUnitario() != null
                            ? cp.getPrecioUnitario().multiply(BigDecimal.valueOf(cp.getCantidad() != null ? cp.getCantidad() : 1))
                            : BigDecimal.ZERO);

                sumaTotal = sumaTotal.add(costo);

                Row rData = sheet.createRow(rowIdx++);

                Cell cNum = rData.createCell(0);
                cNum.setCellValue(num++);
                cNum.setCellStyle(styleCellCenter);

                Cell cNom = rData.createCell(1);
                cNom.setCellValue(nombreCompleto);
                cNom.setCellStyle(styleCellText);

                Cell cProc = rData.createCell(2);
                cProc.setCellValue(nombreProc);
                cProc.setCellStyle(styleCellText);

                Cell cObs = rData.createCell(3);
                cObs.setCellValue(obs);
                cObs.setCellStyle(styleCellText);

                Cell cCosto = rData.createCell(4);
                cCosto.setCellValue(costo.doubleValue());
                cCosto.setCellStyle(styleCellCurrency);
            }

            // Fila Total
            Row rTotal = sheet.createRow(rowIdx);
            Cell cTotLabel = rTotal.createCell(3);
            cTotLabel.setCellValue("TOTAL");
            cTotLabel.setCellStyle(styleTotal);

            Cell cTotVal = rTotal.createCell(4);
            cTotVal.setCellValue(sumaTotal.doubleValue());
            cTotVal.setCellStyle(styleTotalCurrency);

            // Anchos de columna
            sheet.setColumnWidth(0, 2000);  // Num.
            sheet.setColumnWidth(1, 8000);  // Nombre
            sheet.setColumnWidth(2, 8500);  // Procedimiento
            sheet.setColumnWidth(3, 6000);  // Observaciones
            sheet.setColumnWidth(4, 3800);  // Costo

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    // =========================================================================
    // 3. REPORTE MEDICAMENTOS VENDIDOS EN VENTAS EXTERNAS (MedicamentosVendidosMES)
    // =========================================================================
    @Transactional(readOnly = true)
    public byte[] generarExcelMedicamentosVendidosMes(int anio, int mes) throws IOException {
        YearMonth ym = YearMonth.of(anio, mes);
        LocalDateTime inicioMes = ym.atDay(1).atStartOfDay();
        LocalDateTime finMes = ym.atEndOfMonth().atTime(23, 59, 59, 999999999);

        // Solo ventas externas (mostrador sin consulta)
        List<SalidaMedicamento> ventasExternas = salidaMedicamentoRepository
                .findByTipoSalidaIgnoreCaseAndFechaSalidaBetweenOrderByFechaSalidaDesc("VENTA_EXTERNA", inicioMes, finMes);

        List<DetalleSalidaMedicamento> detalles = new ArrayList<>();
        if (!ventasExternas.isEmpty()) {
            List<Long> idsSalidas = ventasExternas.stream()
                    .map(SalidaMedicamento::getIdSalida)
                    .filter(Objects::nonNull)
                    .toList();
            if (!idsSalidas.isEmpty()) {
                detalles = detalleSalidaMedicamentoRepository.findBySalida_IdSalidaIn(idsSalidas);
            }
        }

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Medicamentos Vendidos");
            sheet.setDisplayGridlines(true);

            DataFormat df = wb.createDataFormat();

            Font fontTitle = wb.createFont();
            fontTitle.setBold(true);
            fontTitle.setFontHeightInPoints((short) 12);

            Font fontSubtitle = wb.createFont();
            fontSubtitle.setBold(true);
            fontSubtitle.setFontHeightInPoints((short) 11);

            Font fontBold = wb.createFont();
            fontBold.setBold(true);
            fontBold.setFontHeightInPoints((short) 10);

            Font fontRegular = wb.createFont();
            fontRegular.setFontHeightInPoints((short) 10);

            // Estilos
            CellStyle styleTitle = wb.createCellStyle();
            styleTitle.setFont(fontTitle);
            styleTitle.setAlignment(HorizontalAlignment.CENTER);
            styleTitle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle styleSubHeader = wb.createCellStyle();
            styleSubHeader.setFont(fontSubtitle);
            styleSubHeader.setAlignment(HorizontalAlignment.CENTER);
            styleSubHeader.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle styleColHeader = wb.createCellStyle();
            styleColHeader.setFont(fontBold);
            styleColHeader.setAlignment(HorizontalAlignment.CENTER);
            styleColHeader.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleColHeader);

            CellStyle styleCellText = wb.createCellStyle();
            styleCellText.setFont(fontRegular);
            styleCellText.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleCellText);

            CellStyle styleCellCenter = wb.createCellStyle();
            styleCellCenter.setFont(fontRegular);
            styleCellCenter.setAlignment(HorizontalAlignment.CENTER);
            styleCellCenter.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleCellCenter);

            CellStyle styleCellNum = wb.createCellStyle();
            styleCellNum.setFont(fontRegular);
            styleCellNum.setAlignment(HorizontalAlignment.RIGHT);
            styleCellNum.setVerticalAlignment(VerticalAlignment.CENTER);
            styleCellNum.setDataFormat(df.getFormat("#,##0.##"));
            setBorders(styleCellNum);

            CellStyle styleCellCurrency = wb.createCellStyle();
            styleCellCurrency.setFont(fontRegular);
            styleCellCurrency.setAlignment(HorizontalAlignment.RIGHT);
            styleCellCurrency.setVerticalAlignment(VerticalAlignment.CENTER);
            styleCellCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            setBorders(styleCellCurrency);

            CellStyle styleTotalLabel = wb.createCellStyle();
            styleTotalLabel.setFont(fontBold);
            styleTotalLabel.setAlignment(HorizontalAlignment.RIGHT);
            styleTotalLabel.setVerticalAlignment(VerticalAlignment.CENTER);
            setBorders(styleTotalLabel);

            CellStyle styleTotalCurrency = wb.createCellStyle();
            styleTotalCurrency.setFont(fontBold);
            styleTotalCurrency.setAlignment(HorizontalAlignment.RIGHT);
            styleTotalCurrency.setVerticalAlignment(VerticalAlignment.CENTER);
            styleTotalCurrency.setDataFormat(df.getFormat("Q#,##0.00"));
            setBorders(styleTotalCurrency);

            int rowIdx = 0;

            // 1. Encabezados (Imagen 5)
            Row r0 = sheet.createRow(rowIdx++);
            Cell c0 = r0.createCell(0);
            c0.setCellValue("PROGRAMA DE SALUD");
            c0.setCellStyle(styleTitle);
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 4));

            Row r1 = sheet.createRow(rowIdx++);
            Cell c1 = r1.createCell(0);
            c1.setCellValue("OBRAS SOCIALES SAN MARTIN");
            c1.setCellStyle(styleTitle);
            sheet.addMergedRegion(new CellRangeAddress(1, 1, 0, 4));

            Row r2 = sheet.createRow(rowIdx++);
            Cell cMesLab = r2.createCell(2);
            cMesLab.setCellValue("Mes");
            cMesLab.setCellStyle(styleColHeader);

            Cell cMesVal = r2.createCell(3);
            cMesVal.setCellValue(getNombreMesAbr(mes) + "-" + String.valueOf(anio).substring(2));
            cMesVal.setCellStyle(styleColHeader);
            sheet.addMergedRegion(new CellRangeAddress(2, 2, 3, 4));

            Row r3 = sheet.createRow(rowIdx++);
            Cell cSec = r3.createCell(0);
            cSec.setCellValue("Medicamentos Vendidos");
            cSec.setCellStyle(styleSubHeader);
            CellRangeAddress regSec = new CellRangeAddress(3, 3, 0, 4);
            sheet.addMergedRegion(regSec);
            applyBordersToRegion(sheet, regSec, styleSubHeader);

            // Columnas: Cantidad | Nombre | Precio | 25% mas | Total
            Row rCols = sheet.createRow(rowIdx++);
            String[] cols = {"Cantidad", "Nombre", "Precio", "25% mas", "Total"};
            for (int i = 0; i < cols.length; i++) {
                Cell c = rCols.createCell(i);
                c.setCellValue(cols[i]);
                c.setCellStyle(styleColHeader);
            }

            BigDecimal sumaTotal = BigDecimal.ZERO;

            for (DetalleSalidaMedicamento d : detalles) {
                int cant = d.getCantidad() != null ? d.getCantidad() : 0;
                String nomMed = (d.getLote() != null && d.getLote().getMedicamento() != null)
                        ? d.getLote().getMedicamento().getNombre()
                        : "Medicamento";

                // Precio de venta total de este detalle
                BigDecimal precioUnitarioVenta = d.getPrecioUnitario() != null ? d.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal totalFila = precioUnitarioVenta.multiply(BigDecimal.valueOf(cant));

                // Desglose del 25% de incremento
                // total = precioBase + 0.25 * precioBase = 1.25 * precioBase
                // precioBase = total / 1.25
                BigDecimal precioBase;
                BigDecimal incremento25;

                if (totalFila.compareTo(BigDecimal.ZERO) > 0) {
                    precioBase = totalFila.divide(BigDecimal.valueOf(1.25), 2, RoundingMode.HALF_UP);
                    incremento25 = totalFila.subtract(precioBase);
                } else {
                    precioBase = BigDecimal.ZERO;
                    incremento25 = BigDecimal.ZERO;
                }

                sumaTotal = sumaTotal.add(totalFila);

                Row rData = sheet.createRow(rowIdx++);

                Cell cCant = rData.createCell(0);
                cCant.setCellValue(cant);
                cCant.setCellStyle(styleCellCenter);

                Cell cNom = rData.createCell(1);
                cNom.setCellValue(nomMed);
                cNom.setCellStyle(styleCellText);

                Cell cPrecio = rData.createCell(2);
                cPrecio.setCellValue(precioBase.doubleValue());
                cPrecio.setCellStyle(styleCellNum);

                Cell cInc = rData.createCell(3);
                cInc.setCellValue(incremento25.doubleValue());
                cInc.setCellStyle(styleCellNum);

                Cell cTot = rData.createCell(4);
                cTot.setCellValue(totalFila.doubleValue());
                cTot.setCellStyle(styleCellCurrency);
            }

            // Fila Total
            Row rTotal = sheet.createRow(rowIdx);
            Cell cTotLabel = rTotal.createCell(3);
            cTotLabel.setCellValue("TOTAL");
            cTotLabel.setCellStyle(styleTotalLabel);

            Cell cTotVal = rTotal.createCell(4);
            cTotVal.setCellValue(sumaTotal.doubleValue());
            cTotVal.setCellStyle(styleTotalCurrency);

            // Anchos de columna
            sheet.setColumnWidth(0, 2400);  // Cantidad
            sheet.setColumnWidth(1, 9500);  // Nombre
            sheet.setColumnWidth(2, 3400);  // Precio
            sheet.setColumnWidth(3, 3400);  // 25% mas
            sheet.setColumnWidth(4, 4000);  // Total

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            wb.write(baos);
            return baos.toByteArray();
        }
    }
}
