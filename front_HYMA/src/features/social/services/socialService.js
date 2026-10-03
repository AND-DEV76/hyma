import api from '../../../api/axios';

export const buscarEspecialidades = async (buscar = '') => {
  const response = await api.get('/social/especialidades', { params: { buscar } });
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
  getDashboard: obtenerDashboard,
  obtenerDashboard,
  exportarExcelDashboard,
  getPacientesRecientes: listarPacientes,
  listarPacientes,
  getExpedientePaciente: obtenerExpediente,
  obtenerExpediente
};

export default socialService;

