package com.hyma.doctor.service;


import com.hyma.doctor.dto.MedicoRequestDTO;
import com.hyma.doctor.dto.MedicoResponseDTO;

import com.hyma.doctor.repository.MedicoRepository;

import com.hyma.usuario.repository.UsuarioRepository; // Asume existencia de tu repo de usuario
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.hyma.usuario.model.Usuario;


import com.hyma.doctor.model.Medico;
import com.hyma.exception.MedicoNotFoundException;
import com.hyma.exception.UsuarioRolInvalidoException;

@Service
@RequiredArgsConstructor
public class MedicoServiceImpl implements MedicoService {

    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository; // Inyecta el repositorio de usuarios

    private static final String ROL_DOCTOR = "MEDICO"; // O "MEDICO", ajusta al nombre exacto en tu BD

    @Override
    @Transactional(readOnly = true)
    public List<MedicoResponseDTO> obtenerTodos() {
        return medicoRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MedicoResponseDTO obtenerPorId(Long id) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new MedicoNotFoundException("Médico no encontrado con el ID: " + id));
        return mapToDTO(medico);
    }

    @Override
    @Transactional
    public MedicoResponseDTO crear(MedicoRequestDTO requestDTO) {
        Usuario usuario = validarAsignacionUsuario(requestDTO.getIdUsuario(), null);

        Medico medico = Medico.builder()
                .nombres(requestDTO.getNombres())
                .apellidos(requestDTO.getApellidos())
                .especialidad(requestDTO.getEspecialidad())
                .telefono(requestDTO.getTelefono())
                .correo(requestDTO.getCorreo())
                .usuario(usuario)
                .build();

        return mapToDTO(medicoRepository.save(medico));
    }

    @Override
    @Transactional
    public MedicoResponseDTO actualizar(Long id, MedicoRequestDTO requestDTO) {
        Medico medicoExistent = medicoRepository.findById(id)
                .orElseThrow(() -> new MedicoNotFoundException("Médico no encontrado con el ID: " + id));

        Usuario usuario = validarAsignacionUsuario(requestDTO.getIdUsuario(), id);

        medicoExistent.setNombres(requestDTO.getNombres());
        medicoExistent.setApellidos(requestDTO.getApellidos());
        medicoExistent.setEspecialidad(requestDTO.getEspecialidad());
        medicoExistent.setTelefono(requestDTO.getTelefono());
        medicoExistent.setCorreo(requestDTO.getCorreo());
        medicoExistent.setUsuario(usuario);

        return mapToDTO(medicoRepository.save(medicoExistent));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!medicoRepository.existsById(id)) {
            throw new MedicoNotFoundException("No se puede eliminar. Médico no encontrado con el ID: " + id);
        }
        medicoRepository.deleteById(id);
    }

    // --- MÉTODOS AUXILIARES ---

    private Usuario validarAsignacionUsuario(Long idUsuario, Long idMedicoActual) {
        if (idUsuario == null) {
            return null;
        }

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("El usuario ingresado no existe."));

        // Validar que el usuario tenga el rol de DOCTOR/MEDICO
        if (!ROL_DOCTOR.equalsIgnoreCase(usuario.getRol().getNombre())) {
            throw new UsuarioRolInvalidoException("El usuario seleccionado no posee el rol de " + ROL_DOCTOR);
        }

        // Validar que el usuario no esté ya asignado a otro médico (Relación 1 a 1)
        boolean yaAsignado = (idMedicoActual == null)
                ? medicoRepository.existsByUsuarioIdUsuario(idUsuario)
                : medicoRepository.existsByUsuarioIdUsuarioAndIdMedicoNot(idUsuario, idMedicoActual);

        if (yaAsignado) {
            throw new UsuarioRolInvalidoException("El usuario ingresado ya está vinculado a otro perfil médico.");
        }

        return usuario;
    }

    private MedicoResponseDTO mapToDTO(Medico medico) {
        return MedicoResponseDTO.builder()
                .idMedico(medico.getIdMedico())
                .nombres(medico.getNombres())
                .apellidos(medico.getApellidos())
                .especialidad(medico.getEspecialidad())
                .telefono(medico.getTelefono())
                .correo(medico.getCorreo())
                .idUsuario(medico.getUsuario() != null ? medico.getUsuario().getIdUsuario() : null)
                .username(medico.getUsuario() != null ? medico.getUsuario().getUsername() : null)
                .build();
    }
}