import api from '../../../api/axios';

export const listarEntradas = async (params = {}) => (
  await api.get('/farmacia/entradas', { params })
).data;

export const registrarEntrada = async (data) => (
  await api.post('/farmacia/entradas', data)
).data;
