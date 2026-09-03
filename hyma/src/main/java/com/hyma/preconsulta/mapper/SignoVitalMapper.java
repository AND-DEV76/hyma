package com.hyma.preconsulta.mapper;

import com.hyma.preconsulta.dto.SignoVitalCreateRequest;
import com.hyma.preconsulta.dto.SignoVitalResponse;
import com.hyma.preconsulta.model.SignoVital;
import com.hyma.recepcion.model.Paciente;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Mapper para la conversión entre entidades SignoVital y DTOs,
 * incluyendo lógica para cálculo e interpretación del Índice de Masa Corporal (IMC).
 */
@Component
public class SignoVitalMapper {

    public SignoVital toEntity(SignoVitalCreateRequest request, Paciente paciente) {
        if (request == null) return null;

        return SignoVital.builder()
                .paciente(paciente)
                .peso(request.getPeso())
                .talla(request.getTalla())
                .presionArterial(request.getPresionArterial())
                .glicemia(request.getGlicemia())
                .frecuenciaCardiaca(request.getFrecuenciaCardiaca())
                .frecuenciaRespiratoria(request.getFrecuenciaRespiratoria())
                .saturacionOxigeno(request.getSaturacionOxigeno())
                .temperatura(request.getTemperatura())
                .build();
    }

    public SignoVitalResponse toResponse(SignoVital entity) {
        if (entity == null) return null;

        BigDecimal imc = calcularImc(entity.getPeso(), entity.getTalla());
        String clasificacion = clasificarImc(imc);

        String nombreCompleto = entity.getPaciente() != null
                ? entity.getPaciente().getNombres() + " " + entity.getPaciente().getApellidos()
                : null;

        Long idConsulta = entity.getConsulta() != null
                ? entity.getConsulta().getIdConsulta()
                : null;

        return SignoVitalResponse.builder()
                .idSignoVital(entity.getIdSignoVital())
                .idPaciente(entity.getPaciente() != null ? entity.getPaciente().getIdPaciente() : null)
                .nombreCompletoPaciente(nombreCompleto)
                .idConsulta(idConsulta)
                .peso(entity.getPeso())
                .talla(entity.getTalla())
                .presionArterial(entity.getPresionArterial())
                .glicemia(entity.getGlicemia())
                .frecuenciaCardiaca(entity.getFrecuenciaCardiaca())
                .frecuenciaRespiratoria(entity.getFrecuenciaRespiratoria())
                .saturacionOxigeno(entity.getSaturacionOxigeno())
                .temperatura(entity.getTemperatura())
                .imc(imc)
                .clasificacionImc(clasificacion)
                .fechaRegistro(entity.getFechaRegistro())
                .build();
    }

    /**
     * Calcula el IMC: peso (kg) / (talla (m))^2
     */
    private BigDecimal calcularImc(BigDecimal peso, BigDecimal talla) {
        if (peso == null || talla == null || talla.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }

        // Si la talla se ingresó en centímetros (ej: 170), convertir a metros (1.70)
        BigDecimal tallaMetros = talla.compareTo(BigDecimal.valueOf(3)) > 0
                ? talla.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP)
                : talla;

        BigDecimal tallaAlCuadrado = tallaMetros.multiply(tallaMetros);
        if (tallaAlCuadrado.compareTo(BigDecimal.ZERO) == 0) {
            return null;
        }

        return peso.divide(tallaAlCuadrado, 2, RoundingMode.HALF_UP);
    }

    /**
     * Clasifica el IMC según los estándares de la OMS.
     */
    private String clasificarImc(BigDecimal imc) {
        if (imc == null) return "No calculado";

        double val = imc.doubleValue();
        if (val < 18.5) return "Bajo peso";
        if (val < 25.0) return "Normal";
        if (val < 30.0) return "Sobrepeso";
        if (val < 35.0) return "Obesidad Grado I";
        if (val < 40.0) return "Obesidad Grado II";
        return "Obesidad Grado III (Mórbida)";
    }
}

