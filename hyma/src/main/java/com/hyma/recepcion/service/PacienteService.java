package com.hyma.recepcion.service;

import com.hyma.alergia.model.Alergia;
import com.hyma.recepcion.dto.*;
import com.hyma.recepcion.mapper.PacienteMapper;
import com.hyma.recepcion.model.Paciente;

import com.hyma.recepcion.repository.PacienteRepository;

import com.hyma.alergia.repository.AlergiaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final AlergiaRepository alergiaRepository;
    private final PacienteMapper pacienteMapper;

    @Transactional
    public PacienteResponse crearPaciente(PacienteCreateRequest request) {

        Paciente paciente = pacienteMapper.toEntity(request);

        paciente.setAlergias(
                obtenerAlergias(request.getAlergiaIds())
        );

        Paciente pacienteGuardado = pacienteRepository.save(paciente);

        return pacienteMapper.toResponse(pacienteGuardado);
    }

    @Transactional
    public PacienteResponse actualizarPaciente(
            Long id,
            PacienteUpdateRequest request
    ) {

        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new PacienteNotFoundException(id));

        pacienteMapper.updateEntity(paciente, request);

        paciente.setAlergias(
                obtenerAlergias(request.getAlergiaIds())
        );

        return pacienteMapper.toResponse(paciente);
    }

    @Transactional(readOnly = true)
    public PacienteResponse obtenerPorId(Long id) {

        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new PacienteNotFoundException(id));

        return pacienteMapper.toResponse(paciente);
    }

    @Transactional(readOnly = true)
    public List<PacienteResumenResponse> buscar(String buscar) {

        List<Paciente> pacientes;

        if (buscar == null || buscar.isBlank()) {
            pacientes = pacienteRepository.findAll();
        } else {
            pacientes = pacienteRepository.buscar(buscar.trim());
        }

        return pacientes.stream()
                .map(pacienteMapper::toResumenResponse)
                .toList();
    }

    private Set<Alergia> obtenerAlergias(Set<Long> alergiaIds) {

        if (alergiaIds == null || alergiaIds.isEmpty()) {
            return new HashSet<>();
        }

        Set<Alergia> alergias = new HashSet<>();

        for (Long idAlergia : alergiaIds) {

            Alergia alergia = alergiaRepository.findById(idAlergia)
                    .orElseThrow(() -> new AlergiaNotFoundException(idAlergia));

            alergias.add(alergia);
        }

        return alergias;
    }
}