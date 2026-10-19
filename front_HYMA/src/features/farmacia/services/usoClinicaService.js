import api from '../../../api/axios';

export const registrarConsumoClinica = async (data) => {
  const response = await api.post('/farmacia/uso-clinica/consumo', data);
  return response.data;
};

export const listarHistorialConsumoClinica = async () => {
  const response = await api.get('/farmacia/uso-clinica/historial');
  return response.data;
};

const usoClinicaService = {
  registrarConsumoClinica,
  listarHistorialConsumoClinica,
};

export default usoClinicaService;
