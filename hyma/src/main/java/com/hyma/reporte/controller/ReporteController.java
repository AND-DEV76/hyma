package com.hyma.reporte.controller;

import com.hyma.reporte.dto.ReporteEstadisticaResponse;
import com.hyma.reporte.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/estadistica-mensual")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'ENFERMERA', 'FARMACIA')")
    public ResponseEntity<ReporteEstadisticaResponse> obtenerEstadisticaMensual(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) {

        LocalDate now = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : now.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : now.getMonthValue();

        return ResponseEntity.ok(reporteService.generarReporteEstadistica(a, m));
    }

    @GetMapping("/estadistica-mensual/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MEDICO', 'ENFERMERA', 'FARMACIA')")
    public ResponseEntity<byte[]> descargarExcelEstadisticaMensual(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) throws IOException {

        LocalDate now = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : now.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : now.getMonthValue();

        byte[] excelBytes = reporteService.generarExcel(a, m);
        String filename = String.format("estadistica_mensual_%02d_%d.xlsx", m, a);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
