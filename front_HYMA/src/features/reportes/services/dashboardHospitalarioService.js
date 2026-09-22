import api from '../../../api/axios';

export const dashboardHospitalarioService = {
  /**
   * Obtiene todos los indicadores del Dashboard Hospitalario:
   * - Top 10 diagnósticos más frecuentes
   * - Demografía (Hombres vs Mujeres, rangos de edad)
   * - Top 10 medicamentos más dispensados
   * - KPIs del mes (pacientes, nuevos vs reconsulta, atenciones hoy, recaudación, stock)
   */
  obtenerDashboardHospitalario: async (anio, mes) => {
    const params = {};
    if (anio) params.anio = anio;
    if (mes) params.mes = mes;
    const response = await api.get('/reportes/dashboard/hospital', { params });
    return response.data;
  },
};

export default dashboardHospitalarioService;
