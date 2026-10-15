import api from '../../../api/axios';

export const listarParametros = async () => (await api.get('/farmacia/parametros')).data;

export const actualizarParametro = async (clave, data) => (
  await api.put(`/farmacia/parametros/${encodeURIComponent(clave)}`, data)
).data;

export const obtenerPorcentajeMedicamento = async () => (
  await api.get('/farmacia/parametros/porcentaje-medicamento')
).data;

export const actualizarPorcentajeMedicamento = async (porcentaje) => (
  await api.put('/farmacia/parametros/porcentaje-medicamento', { porcentaje })
).data;
