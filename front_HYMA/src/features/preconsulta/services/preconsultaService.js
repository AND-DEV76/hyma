import api from '../../../api/axios';

/**
 * Servicios API para el Módulo de Preconsulta y Signos Vitales.
 */

/**
 * Inicia la atención en preconsulta para un paciente en cola (cambia estado a EN_PRECONSULTA).
 * @param {number} idCola 
 */
export const iniciarPreconsulta = async (idCola) => {
  const response = await api.post(`/preconsulta/iniciar/${idCola}`);
  return response.data;
};

/**
 * Registra los signos vitales y transiciona el turno a EN_CONSULTA.
 * @param {object} signosVitalesData 
 */
export const registrarSignosVitales = async (signosVitalesData) => {
  const response = await api.post('/preconsulta/signos-vitales', signosVitalesData);
  return response.data;
};

/**
 * Obtiene el último registro de signos vitales de un paciente.
 * @param {number} idPaciente 
 */
export const obtenerUltimosSignosVitales = async (idPaciente) => {
  const response = await api.get(`/preconsulta/pacientes/${idPaciente}/signos-vitales/ultimo`);
  return response.data;
};

/**
 * Obtiene el historial completo de signos vitales de un paciente.
 * @param {number} idPaciente 
 */
export const obtenerHistorialSignosVitales = async (idPaciente) => {
  const response = await api.get(`/preconsulta/pacientes/${idPaciente}/signos-vitales`);
  return response.data;
};
