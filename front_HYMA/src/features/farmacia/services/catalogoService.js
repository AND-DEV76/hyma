import api from '../../../api/axios';

export const listarCategorias = async () => (await api.get('/farmacia/categorias')).data;
export const crearCategoria = async (data) => (await api.post('/farmacia/categorias', data)).data;
export const actualizarCategoria = async (id, data) => (await api.put(`/farmacia/categorias/${id}`, data)).data;
export const eliminarCategoria = async (id) => api.delete(`/farmacia/categorias/${id}`);

export const listarCasasFarmaceuticas = async () => (await api.get('/farmacia/casas-farmaceuticas')).data;
export const crearCasaFarmaceutica = async (data) => (await api.post('/farmacia/casas-farmaceuticas', data)).data;
export const actualizarCasaFarmaceutica = async (id, data) => (await api.put(`/farmacia/casas-farmaceuticas/${id}`, data)).data;
export const eliminarCasaFarmaceutica = async (id) => api.delete(`/farmacia/casas-farmaceuticas/${id}`);
