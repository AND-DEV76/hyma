import api from '../../../api/axios';

export const listarLotes = async (params = {}) => (
  await api.get('/farmacia/lotes', { params })
).data;

export const actualizarLote = async (id, data) => (
  await api.put(`/farmacia/lotes/${id}`, data)
).data;

export const desecharLote = async (id, data = {}) => (
  await api.post(`/farmacia/lotes/${id}/desechar`, data)
).data;

