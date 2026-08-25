import api from "../../../api/axios.js";

export const buscarPacientes = async (buscar) => {
  const response = await api.get('/recepcion/pacientes', {
    params: { buscar },
  });

  return response.data;
};

export const obtenerPaciente = async (id) => {
  const response = await api.get(`/recepcion/pacientes/${id}`);

  return response.data;
};

export const crearPaciente = async (paciente) => {
  const response = await api.post('/recepcion/pacientes', paciente);

  return response.data;
};

export const actualizarPaciente = async (id, paciente) => {
  const response = await api.put(
    `/recepcion/pacientes/${id}`,
    paciente
  );

  return response.data;
};

export const obtenerCola = async (estado = null) => {
    const response = await api.get('/recepcion/cola', {
        params: estado ? { estado } : {},
    });

    return response.data;
};

export const cancelarCola = async (idCola) => {
    const response = await api.patch(
        `/recepcion/cola/${idCola}/estado`,
        {
            estado: 'CANCELADO',
        }
    );

    return response.data;
};

export const agregarACola = async (idPaciente, prioridad = 0) => {
  const response = await api.post('/recepcion/cola', {
    idPaciente,
    prioridad,
  });

  return response.data;
};

export const cambiarEstadoCola = async (idCola, estado) => {
  const response = await api.patch(
    `/recepcion/cola/${idCola}/estado`,
    { estado }
  );

  return response.data;
};