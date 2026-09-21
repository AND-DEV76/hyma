import api from '../../../api/axios';

export const listarSalidas = async () => (
  await api.get('/farmacia/salidas')
).data;
