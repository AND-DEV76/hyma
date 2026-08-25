package com.hyma.recepcion.mapper;

import com.hyma.alergia.model.Alergia;
import com.hyma.recepcion.dto.PacienteCreateRequest;
import com.hyma.recepcion.dto.PacienteResponse;
import com.hyma.recepcion.dto.PacienteResumenResponse;
import com.hyma.recepcion.model.Paciente;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.stream.Collectors;

@Component
public class PacienteMapper {

    public Paciente toEntity(PacienteCreateRequest request) {
        return Paciente.builder()
                .nombres(request.getNombres())
                .apellidos(request.getApellidos())
                .fechaNacimiento(request.getFechaNacimiento())
                .sexo(request.getSexo())
                .telefono(request.getTelefono())
                .comunidad(request.getComunidad())
                .antecedentesPersonalesPatologicos(
                        request.getAntecedentesPersonalesPatologicos()
                )
                .antecedentesPersonalesFamiliares(
                        request.getAntecedentesPersonalesFamiliares()
                )
                .build();
    }

    public void updateEntity(
            Paciente paciente,
            com.hyma.recepcion.dto.PacienteUpdateRequest request
    ) {
        paciente.setNombres(request.getNombres());
        paciente.setApellidos(request.getApellidos());
        paciente.setFechaNacimiento(request.getFechaNacimiento());
        paciente.setSexo(request.getSexo());
        paciente.setTelefono(request.getTelefono());
        paciente.setComunidad(request.getComunidad());
        paciente.setAntecedentesPersonalesPatologicos(
                request.getAntecedentesPersonalesPatologicos()
        );
        paciente.setAntecedentesPersonalesFamiliares(
                request.getAntecedentesPersonalesFamiliares()
        );
    }

    public PacienteResponse toResponse(Paciente paciente) {

        var alergiaIds = paciente.getAlergias() == null
                ? Collections.<Long>emptySet()
                : paciente.getAlergias()
                    .stream()
                    .map(Alergia::getIdAlergia)
                    .collect(Collectors.toSet());

        return PacienteResponse.builder()
                .idPaciente(paciente.getIdPaciente())
                .nombres(paciente.getNombres())
                .apellidos(paciente.getApellidos())
                .fechaNacimiento(paciente.getFechaNacimiento())
                .sexo(paciente.getSexo())
                .telefono(paciente.getTelefono())
                .comunidad(paciente.getComunidad())
                .fechaRegistro(paciente.getFechaRegistro())
                .antecedentesPersonalesPatologicos(
                        paciente.getAntecedentesPersonalesPatologicos()
                )
                .antecedentesPersonalesFamiliares(
                        paciente.getAntecedentesPersonalesFamiliares()
                )
                .alergiaIds(alergiaIds)
                .build();
    }

    public PacienteResumenResponse toResumenResponse(Paciente paciente) {
        return PacienteResumenResponse.builder()
                .idPaciente(paciente.getIdPaciente())
                .nombres(paciente.getNombres())
                .apellidos(paciente.getApellidos())
                .fechaNacimiento(paciente.getFechaNacimiento())
                .sexo(paciente.getSexo())
                .telefono(paciente.getTelefono())
                .comunidad(paciente.getComunidad())
                .build();
    }
}