import api from '../../../api/axios';

export const listarLotes = async (params = {}) => (
  await api.get('/farmacia/lotes', { params })
).data;
