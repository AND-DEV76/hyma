package com.hyma.reporte.controller;

import com.hyma.reporte.service.ReporteOperativoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes/operativos")
@RequiredArgsConstructor
public class ReporteOperativoController {

    private final ReporteOperativoService reporteOperativoService;

    @GetMapping("/pacientes-mes/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA', 'MEDICO')")
    public ResponseEntity<byte[]> descargarExcelPacientesMes(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) throws IOException {

        LocalDate now = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : now.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : now.getMonthValue();

        byte[] excelBytes = reporteOperativoService.generarExcelPacientesMes(a, m);
        String filename = String.format("pacientes_atendidos_%02d_%d.xlsx", m, a);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @GetMapping("/procedimientos-mes/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA', 'MEDICO')")
    public ResponseEntity<byte[]> descargarExcelProcedimientosMes(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) throws IOException {

        LocalDate now = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : now.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : now.getMonthValue();

        byte[] excelBytes = reporteOperativoService.generarExcelProcedimientosMes(a, m);
        String filename = String.format("control_procedimientos_%02d_%d.xlsx", m, a);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @GetMapping("/medicamentos-vendidos-mes/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA', 'MEDICO')")
    public ResponseEntity<byte[]> descargarExcelMedicamentosVendidosMes(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) throws IOException {

        LocalDate now = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : now.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : now.getMonthValue();

        byte[] excelBytes = reporteOperativoService.generarExcelMedicamentosVendidosMes(a, m);
        String filename = String.format("medicamentos_vendidos_%02d_%d.xlsx", m, a);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
