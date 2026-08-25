import api from '../../../api/axios';

// Quitar /api de las rutas para evitar /api/api/medicos
export const getMedicos = async () => {
  const response = await api.get('/medicos'); // Antes decía '/api/medicos'
  return response.data;
};

export const getMedicoById = async (id) => {
  const response = await api.get(`/medicos/${id}`);
  return response.data;
};

export const createMedico = async (medicoData) => {
  const response = await api.post('/medicos', medicoData);
  return response.data;
};

export const updateMedico = async (id, medicoData) => {
  const response = await api.put(`/medicos/${id}`, medicoData);
  return response.data;
};

export const deleteMedico = async (id) => {
  const response = await api.delete(`/medicos/${id}`);
  return response.data;
};

export const getUsuariosMedicos = async () => {
  const response = await api.get('/usuarios'); // Antes decía '/api/usuarios'
  const usuarios = response.data;
  return usuarios.filter((u) => u.nombreRol === 'MEDICO');
};