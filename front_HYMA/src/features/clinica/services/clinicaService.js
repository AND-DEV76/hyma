import api from '../../../api/axios';

export const obtenerColaConsulta = async () => {
  const response = await api.get('/clinica/cola');
  return response.data;
};

export const obtenerPacienteConsulta = async (idPaciente, idCola = null) => {
  const url = idCola ? `/clinica/pacientes/${idPaciente}?idCola=${idCola}` : `/clinica/pacientes/${idPaciente}`;
  const response = await api.get(url);
  return response.data;
};

export const finalizarConsulta = async (data) => {
  const response = await api.post('/clinica/consultas', data);
  return response.data;
};

export const buscarMedicamentos = async (buscar) => {
  const response = await api.get('/clinica/medicamentos', { params: { buscar } });
  return response.data;
};

export const buscarDiagnosticosCie10 = async (buscar) => {
  const response = await api.get('/diagnosticos/catalogo', { params: { buscar, size: 20 } });
  return response.data.content || response.data;
};

export const cancelarCola = async (idCola) => {
  const response = await api.patch(`/recepcion/cola/${idCola}/estado`, { estado: 'CANCELADO' });
  return response.data;
};

export const reanudarEsperaConsulta = async (idCola) => {
  if (!idCola) return null;
  const response = await api.patch(`/recepcion/cola/${idCola}/estado`, { estado: 'ESPERA_CONSULTA' });
  return response.data;
};

export const cambiarPrioridad = async (idCola, prioridad = 1) => {
  const response = await api.patch(`/clinica/cola/${idCola}/prioridad?prioridad=${prioridad}`);
  return response.data;
};

