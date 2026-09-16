import api from '../../../api/axios';

export const tarifaService = {
  listarTodas: async () => {
    const response = await api.get('/tarifas');
    return response.data;
  },

  listarActivas: async () => {
    const response = await api.get('/tarifas/activas');
    return response.data;
  },

  obtenerPrecioConsultaGeneral: async () => {
    const response = await api.get('/tarifas/consulta-general');
    return response.data;
  },

  actualizarPrecioConsultaGeneral: async (precio) => {
    const response = await api.put('/tarifas/consulta-general', { precio });
    return response.data;
  },

  actualizar: async (id, data) => {
    const response = await api.put(`/tarifas/${id}`, data);
    return response.data;
  },
};

export default tarifaService;
