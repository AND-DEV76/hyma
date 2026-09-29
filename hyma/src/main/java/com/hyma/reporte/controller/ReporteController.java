package com.hyma.reporte.controller;

import com.hyma.reporte.dto.DashboardHospitalarioResponse;
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

    @GetMapping("/dashboard/hospital")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA')")
    public ResponseEntity<DashboardHospitalarioResponse> obtenerDashboardHospitalario(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) {

        LocalDate now = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : now.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : now.getMonthValue();

        return ResponseEntity.ok(reporteService.generarDashboardHospitalario(a, m));
    }

    @GetMapping("/estadistica-mensual")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA')")
    public ResponseEntity<ReporteEstadisticaResponse> obtenerEstadisticaMensual(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes) {

        LocalDate now = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : now.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : now.getMonthValue();

        return ResponseEntity.ok(reporteService.generarReporteEstadistica(a, m));
    }

    @GetMapping("/estadistica-mensual/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA')")
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

    @GetMapping("/diagnosticos/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMACIA', 'MEDICO')")
    public ResponseEntity<byte[]> descargarExcelTopDiagnosticos(
            @RequestParam(name = "anio", required = false) Integer anio,
            @RequestParam(name = "mes", required = false) Integer mes,
            @RequestParam(name = "limite", required = false, defaultValue = "10") Integer limite) throws IOException {

        LocalDate now = LocalDate.now();
        int a = (anio != null && anio > 2000) ? anio : now.getYear();
        int m = (mes != null && mes >= 1 && mes <= 12) ? mes : now.getMonthValue();
        int lim = (limite != null && limite > 0 && limite <= 100) ? limite : 10;

        byte[] excelBytes = reporteService.generarExcelTopDiagnosticos(a, m, lim);
        String filename = String.format("top_%d_diagnosticos_%02d_%d.xlsx", lim, m, a);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }
}
