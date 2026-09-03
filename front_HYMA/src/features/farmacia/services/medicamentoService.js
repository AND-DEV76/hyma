import api from '../../../api/axios';

export const listarMedicamentos = async (params = {}) => (
  await api.get('/farmacia/medicamentos', { params })
).data;

export const crearMedicamento = async (data) => (
  await api.post('/farmacia/medicamentos', data)
).data;

export const actualizarMedicamento = async (id, data) => (
  await api.put(`/farmacia/medicamentos/${id}`, data)
).data;
