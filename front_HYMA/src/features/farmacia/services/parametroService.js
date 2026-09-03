import api from '../../../api/axios';

export const listarParametros = async () => (await api.get('/farmacia/parametros')).data;

export const actualizarParametro = async (clave, data) => (
  await api.put(`/farmacia/parametros/${encodeURIComponent(clave)}`, data)
).data;
