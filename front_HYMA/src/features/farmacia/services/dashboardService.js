import api from '../../../api/axios';

export const obtenerDashboardFarmacia = async () => (
  await api.get('/farmacia/dashboard')
).data;
