import axios from 'axios';

const API_URL = 'http://localhost:8080/api/alergias';

export const getAlergias = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createAlergia = async (alergia) => {
  const response = await axios.post(API_URL, alergia);
  return response.data;
};

export const updateAlergia = async (id, alergia) => {
  const response = await axios.put(`${API_URL}/${id}`, alergia);
  return response.data;
};

export const deleteAlergia = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};