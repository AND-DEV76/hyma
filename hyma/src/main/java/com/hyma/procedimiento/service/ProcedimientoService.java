package com.hyma.procedimiento.service;

import com.hyma.procedimiento.dto.ConsultaProcedimientoResponse;
import com.hyma.procedimiento.dto.ProcedimientoDTO;
import com.hyma.procedimiento.model.ConsultaProcedimiento;
import com.hyma.procedimiento.model.Procedimiento;
import com.hyma.procedimiento.repository.ConsultaProcedimientoRepository;
import com.hyma.procedimiento.repository.ProcedimientoRepository;
import com.hyma.recepcion.model.Paciente;
import com.hyma.usuario.model.Usuario;
import com.hyma.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProcedimientoService {

    private final ProcedimientoRepository procedimientoRepository;
    private final ConsultaProcedimientoRepository consultaProcedimientoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<ProcedimientoDTO> listarTodos() {
        return procedimientoRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProcedimientoDTO> listarActivos() {
        return procedimientoRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProcedimientoDTO obtenerPorId(Long id) {
        Procedimiento p = procedimientoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Procedimiento no encontrado con id: " + id));
        return toDTO(p);
    }

    @Transactional
    public ProcedimientoDTO actualizarPrecio(Long id, BigDecimal nuevoPrecio) {
        if (nuevoPrecio == null || nuevoPrecio.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("El precio no puede ser negativo");
        }
        Procedimiento p = procedimientoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Procedimiento no encontrado con id: " + id));
        p.setPrecio(nuevoPrecio);
        return toDTO(procedimientoRepository.save(p));
    }

    @Transactional(readOnly = true)
    public List<ConsultaProcedimientoResponse> listarPendientes() {
        return consultaProcedimientoRepository.findByEstadoWithDetails("ESPERA").stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ConsultaProcedimientoResponse> listarPorEstado(String estado) {
        if (estado == null || estado.isBlank() || "TODOS".equalsIgnoreCase(estado.trim())) {
            return consultaProcedimientoRepository.findAllWithDetails().stream()
                    .map(this::toResponse)
                    .toList();
        }
        return consultaProcedimientoRepository.findByEstadoWithDetails(estado.trim().toUpperCase()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long conteoPendientes() {
        return consultaProcedimientoRepository.countByEstado("ESPERA");
    }

    @Transactional(readOnly = true)
    public List<ConsultaProcedimientoResponse> obtenerPorConsulta(Long idConsulta) {
        return consultaProcedimientoRepository.findByConsultaIdWithDetails(idConsulta).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ConsultaProcedimientoResponse cancelarProcedimiento(Long idConsultaProcedimiento) {
        ConsultaProcedimiento cp = consultaProcedimientoRepository.findById(idConsultaProcedimiento)
                .orElseThrow(() -> new IllegalArgumentException("Procedimiento de consulta no encontrado con id: " + idConsultaProcedimiento));
        cp.setEstado("CANCELADO");
        return toResponse(consultaProcedimientoRepository.save(cp));
    }

    @Transactional
    public ConsultaProcedimientoResponse marcarAtendido(Long idConsultaProcedimiento, String username) {
        ConsultaProcedimiento cp = consultaProcedimientoRepository.findById(idConsultaProcedimiento)
                .orElseThrow(() -> new IllegalArgumentException("Procedimiento de consulta no encontrado con id: " + idConsultaProcedimiento));

        Usuario usuario = null;
        if (username != null && !username.isBlank()) {
            usuario = usuarioRepository.findByUsername(username).orElse(null);
        }

        cp.setEstado("ATENDIDO");
        cp.setFechaAtencion(LocalDateTime.now());
        if (usuario != null) {
            cp.setUsuarioAtendio(usuario);
        }
        return toResponse(consultaProcedimientoRepository.save(cp));
    }

    public ProcedimientoDTO toDTO(Procedimiento p) {
        return ProcedimientoDTO.builder()
                .idProcedimiento(p.getIdProcedimiento())
                .nombre(p.getNombre())
                .precio(p.getPrecio())
                .activo(p.getActivo())
                .build();
    }

    public ConsultaProcedimientoResponse toResponse(ConsultaProcedimiento cp) {
        Paciente p = cp.getPaciente();
        String pacienteNombre = "";
        String identificacion = "";
        Integer edad = null;

        if (p != null) {
            pacienteNombre = ((p.getNombres() != null ? p.getNombres() : "") + " " +
                             (p.getApellidos() != null ? p.getApellidos() : "")).trim();
            identificacion = p.getTelefono() != null ? p.getTelefono() : "";
            if (p.getFechaNacimiento() != null) {
                edad = Period.between(p.getFechaNacimiento(), LocalDate.now()).getYears();
            }
        }

        String medicoNombre = "";
        if (cp.getConsulta() != null && cp.getConsulta().getMedico() != null) {
            var med = cp.getConsulta().getMedico();
            medicoNombre = ((med.getNombres() != null ? med.getNombres() : "") + " " +
                           (med.getApellidos() != null ? med.getApellidos() : "")).trim();
        }

        String usuarioAtendio = "";
        if (cp.getUsuarioAtendio() != null) {
            usuarioAtendio = cp.getUsuarioAtendio().getUsername();
        }

        return ConsultaProcedimientoResponse.builder()
                .idConsultaProcedimiento(cp.getIdConsultaProcedimiento())
                .idConsulta(cp.getConsulta() != null ? cp.getConsulta().getIdConsulta() : null)
                .idPaciente(p != null ? p.getIdPaciente() : null)
                .pacienteNombreCompleto(pacienteNombre)
                .pacienteIdentificacion(identificacion)
                .pacienteEdad(edad)
                .medicoNombreCompleto(medicoNombre)
                .idProcedimiento(cp.getProcedimiento() != null ? cp.getProcedimiento().getIdProcedimiento() : null)
                .nombreProcedimiento(cp.getProcedimiento() != null ? cp.getProcedimiento().getNombre() : "—")
                .cantidad(cp.getCantidad())
                .precioUnitario(cp.getPrecioUnitario())
                .subtotal(cp.getSubtotal())
                .instrucciones(cp.getInstrucciones())
                .estado(cp.getEstado())
                .fechaRegistro(cp.getFechaRegistro())
                .fechaAtencion(cp.getFechaAtencion())
                .usuarioAtendio(usuarioAtendio)
                .build();
    }
}
