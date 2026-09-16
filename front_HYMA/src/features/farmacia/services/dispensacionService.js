import api from '../../../api/axios';

export const obtenerColaDispensacion = async () => (
  await api.get('/farmacia/dispensacion/cola')
).data;

export const obtenerRecetaDispensacion = async (idCola, idPaciente) => (
  await api.get('/farmacia/dispensacion/receta', {
    params: { idCola, idPaciente },
  })
).data;

export const entregarMedicamentos = async (idCola, data = {}) => (
  await api.post(`/farmacia/dispensacion/entregar/${idCola}`, data)
).data;

export const cancelarTurnoDispensacion = async (idCola) => (
  await api.post(`/farmacia/dispensacion/cancelar/${idCola}`)
).data;
