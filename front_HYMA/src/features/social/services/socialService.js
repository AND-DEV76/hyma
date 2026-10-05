import api from '../../../api/axios';

export const buscarEspecialidades = async (buscar = '') => {
  const response = await api.get('/social/especialidades', { params: { buscar } });
  return response.data;
};

export const listarEspecialidadesConContactos = async (buscar = '') => {
  const response = await api.get('/social/especialidades-contactos', { params: { buscar } });
  return response.data;
};

export const crearEspecialidad = async (data) => {
  const response = await api.post('/social/especialidades', data);
  return response.data;
};

export const actualizarEspecialidad = async (id, data) => {
  const response = await api.put(`/social/especialidades/${id}`, data);
  return response.data;
};

export const eliminarEspecialidad = async (id) => {
  const response = await api.delete(`/social/especialidades/${id}`);
  return response.data;
};

export const listarCentros = async (idEspecialidad = null) => {
  const params = idEspecialidad ? { idEspecialidad } : {};
  const response = await api.get('/social/centros', { params });
  return response.data;
};

export const crearCentro = async (data) => {
  const response = await api.post('/social/centros', data);
  return response.data;
};

export const actualizarCentro = async (id, data) => {
  const response = await api.put(`/social/centros/${id}`, data);
  return response.data;
};

export const eliminarCentro = async (id) => {
  const response = await api.delete(`/social/centros/${id}`);
  return response.data;
};

export const obtenerDashboard = async (anio, mes) => {
  const response = await api.get('/social/dashboard', { params: { anio, mes } });
  return response.data;
};

export const exportarExcelDashboard = async (anio, mes) => {
  const response = await api.get('/social/dashboard/excel', {
    params: { anio, mes },
    responseType: 'blob',
  });
  return response.data;
};

export const listarPacientes = async (buscar = '') => {
  const response = await api.get('/social/pacientes', { params: { buscar } });
  return response.data;
};

export const obtenerExpediente = async (idPaciente) => {
  const response = await api.get(`/social/pacientes/${idPaciente}/expediente`);
  return response.data;
};

const socialService = {
  buscarEspecialidades,
  listarEspecialidadesConContactos,
  crearEspecialidad,
  actualizarEspecialidad,
  eliminarEspecialidad,
  listarCentros,
  crearCentro,
  actualizarCentro,
  eliminarCentro,
  getDashboard: obtenerDashboard,
  obtenerDashboard,
  exportarExcelDashboard,
  getPacientesRecientes: listarPacientes,
  listarPacientes,
  getExpedientePaciente: obtenerExpediente,
  obtenerExpediente
};

export default socialService;
