import api from '../../../api/axios';

export const listarTodos = async () => {
  const response = await api.get('/procedimientos');
  return response.data;
};

export const listarActivos = async () => {
  const response = await api.get('/procedimientos/activos');
  return response.data;
};

export const listarProcedimientos = async (soloActivos = true) => {
  return soloActivos ? listarActivos() : listarTodos();
};

export const obtenerPorId = async (id) => {
  const response = await api.get(`/procedimientos/${id}`);
  return response.data;
};

export const actualizarPrecio = async (id, precio) => {
  const response = await api.put(`/procedimientos/${id}/precio`, { precio });
  return response.data;
};

export const listarPendientes = async () => {
  const response = await api.get('/procedimientos/pacientes/pendientes');
  return response.data;
};

export const listarPacientesPorEstado = async (estado) => {
  const params = estado && estado !== 'TODOS' ? { estado } : {};
  const response = await api.get('/procedimientos/pacientes', { params });
  return response.data;
};

export const conteoPendientes = async () => {
  const response = await api.get('/procedimientos/pacientes/conteo-pendientes');
  return response.data;
};

export const cancelarProcedimiento = async (id) => {
  const response = await api.put(`/procedimientos/pacientes/${id}/cancelar`);
  return response.data;
};

export const marcarAtendido = async (id) => {
  const response = await api.put(`/procedimientos/pacientes/${id}/atender`);
  return response.data;
};

export const obtenerPorConsulta = async (idConsulta) => {
  const response = await api.get(`/procedimientos/consulta/${idConsulta}`);
  return response.data;
};

export const procedimientoService = {
  listarTodos,
  listarActivos,
  listarProcedimientos,
  obtenerPorId,
  actualizarPrecio,
  listarPendientes,
  listarPacientesPorEstado,
  conteoPendientes,
  cancelarProcedimiento,
  marcarAtendido,
  obtenerPorConsulta,
};

export default procedimientoService;
