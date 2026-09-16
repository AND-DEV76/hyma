import api from '../../../api/axios';

export const reporteService = {
  /**
   * Obtiene la matriz y totales de la estadística mensual.
   */
  obtenerEstadisticaMensual: async (anio, mes) => {
    const params = {};
    if (anio) params.anio = anio;
    if (mes) params.mes = mes;
    const response = await api.get('/reportes/estadistica-mensual', { params });
    return response.data;
  },

  /**
   * Descarga el archivo Excel (.xlsx) oficial generado por Apache POI en el backend.
   */
  descargarExcelEstadisticaMensual: async (anio, mes) => {
    const params = {};
    if (anio) params.anio = anio;
    if (mes) params.mes = mes;

    const response = await api.get('/reportes/estadistica-mensual/excel', {
      params,
      responseType: 'blob',
    });

    // Crear un enlace temporal para descargar el archivo blob
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const padMes = String(mes).padStart(2, '0');
    link.setAttribute('download', `Estadistica_Mensual_${padMes}_${anio}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

export default reporteService;
