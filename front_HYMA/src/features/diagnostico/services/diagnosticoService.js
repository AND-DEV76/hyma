import api from '../../../api/axios';

export const listarCie10 = async (buscar = '', page = 0, size = 10) => {
  const response = await api.get('/diagnosticos/catalogo', { params: { buscar, page, size } });
  return response.data;
};

export const crearCie10 = async (data) => {
  const response = await api.post('/diagnosticos/catalogo', data);
  return response.data;
};

export const actualizarCie10 = async (id, data) => {
  const response = await api.put(`/diagnosticos/catalogo/${id}`, data);
  return response.data;
};

export const eliminarCie10 = async (id) => {
  await api.delete(`/diagnosticos/catalogo/${id}`);
};
