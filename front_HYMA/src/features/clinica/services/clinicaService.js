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
