import api from '../../../api/axios';

/**
 * Servicios para interactuar con los endpoints de Alergias.
 * Utiliza la instancia centralizada 'api' que incluye automáticamente
 * el token JWT en las cabeceras.
 */

export const getAlergias = async () => {
  const response = await api.get('/alergias');
  return response.data;
};

export const createAlergia = async (alergia) => {
  const response = await api.post('/alergias', alergia);
  return response.data;
};

export const updateAlergia = async (id, alergia) => {
  const response = await api.put(`/alergias/${id}`, alergia);
  return response.data;
};

export const deleteAlergia = async (id) => {
  await api.delete(`/alergias/${id}`);
};