import api from '../../../api/axios';

export const loginService = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// Solicitud de código de recuperación por Correo Electrónico (Paso 1)
export const solicitarRecuperacionService = async (correo) => {
  const response = await api.post('/auth/recuperar-password/solicitar', { correo });
  return response.data;
};

// Verificación de código OTP por Correo Electrónico (Paso 2)
export const verificarCodigoService = async (correo, codigo) => {
  const response = await api.post('/auth/recuperar-password/verificar', { correo, codigo });
  return response.data;
};

// Cambio de contraseña con código OTP por Correo Electrónico (Paso 3)
export const cambiarPasswordService = async (correo, codigo, nuevaPassword) => {
  const response = await api.post('/auth/recuperar-password/cambiar', {
    correo,
    codigo,
    nuevaPassword
  });
  return response.data;
};