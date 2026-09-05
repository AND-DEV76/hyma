import api from '../../../api/axios';

// Diagnósticos (Catálogo)
export const listarCie10 = async (buscar = '', idCategoria = null, page = 0, size = 10) => {
  const params = { buscar, page, size };
  if (idCategoria) {
    params.idCategoria = idCategoria;
  }
  const response = await api.get('/diagnosticos/catalogo', { params });
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

// Categorías de Diagnóstico
export const listarCategoriasDiagnostico = async () => {
  const response = await api.get('/diagnosticos/categorias');
  return response.data;
};

export const crearCategoriaDiagnostico = async (data) => {
  const response = await api.post('/diagnosticos/categorias', data);
  return response.data;
};

export const actualizarCategoriaDiagnostico = async (id, data) => {
  const response = await api.put(`/diagnosticos/categorias/${id}`, data);
  return response.data;
};

export const eliminarCategoriaDiagnostico = async (id) => {
  await api.delete(`/diagnosticos/categorias/${id}`);
};

