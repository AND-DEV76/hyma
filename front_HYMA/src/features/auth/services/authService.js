import api from '../../../api/axios';

export const loginService = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};