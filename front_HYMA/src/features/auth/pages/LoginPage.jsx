import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, Eye, EyeOff, ArrowLeft, AlertCircle, KeyRound } from 'lucide-react';
import { loginService } from '../services/authService';
import CaptchaBox from '../components/CaptchaBox';
import saludLogo from '../../../assets/images/log1.png';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Control de intentos fallidos y Captcha
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaExpected, setCaptchaExpected] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const navigate = useNavigate();

  const handleCaptchaChange = (inputValue, expectedValue) => {
    setCaptchaInput(inputValue);
    if (expectedValue) {
      setCaptchaExpected(expectedValue);
    }
    if (captchaError) {
      setCaptchaError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validación de Captcha si se han alcanzado 3 o más intentos fallidos
    if (failedAttempts >= 3) {
      if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaExpected.trim().toUpperCase()) {
        setCaptchaError('El código de seguridad no coincide. Por favor ingrésalo nuevamente.');
        return;
      }
    }

    setErrorMessage('');
    setCaptchaError('');
    setLoading(true);

    try {
      const data = await loginService(username, password);

      // Guardar token JWT y datos de usuario para persistir la sesión
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(data.usuario));

      // Resetear intentos en éxito
      setFailedAttempts(0);

      const userRoles = (data.usuario.roles && data.usuario.roles.length > 0)
        ? data.usuario.roles
        : (data.usuario.nombreRol ? [data.usuario.nombreRol] : []);

      if (userRoles.includes('ADMIN') || userRoles.includes('FARMACIA')) {
        navigate('/dashboard');
      } else if (userRoles.includes('MEDICO')) {
        navigate('/clinica');
      } else if (userRoles.includes('ENFERMERA')) {
        navigate('/recepcion');
      } else if (userRoles.includes('SOCIAL')) {
        navigate('/social');
      } else {
        navigate('/inicio');
      }
    } catch (err) {
      // Incrementar contador de intentos fallidos
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      let msg = err.response?.data?.message || 'Credenciales incorrectas. Por favor verifica tus datos.';
      if (nextAttempts >= 3) {
        msg = `${msg} (Se requiere verificación de seguridad por múltiples intentos).`;
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setErrorMessage('');
    setCaptchaError('');
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Panel Izquierdo - BRANDING & LOGO */}
        <div className="login-left-panel">
          <div className="login-brand-content">
            <div className="login-logo-wrapper">
              <img
                src={saludLogo}
                alt="Programa de Salud - HYMA"
                className="login-logo-img"
              />
            </div>

            <h2 className="login-brand-title">Programa de Salud</h2>
            <p className="login-brand-subtitle">Hombre y Mujer en Acción</p>
            <p className="login-brand-desc">
              Atención médica integral, farmacia comunitaria y asistencia social.
            </p>
          </div>
        </div>

        {/* Panel Derecho - FORMULARIO */}
        <div className="login-right-panel">
          <div>
            <div className="login-top-nav">
              <button
                type="button"
                onClick={handleCancel}
                className="login-back-btn"
                title="Volver a la página principal"
              >
                <ArrowLeft size={16} />
                <span>Volver al inicio</span>
              </button>
            </div>

            <div className="login-header">
              <h2 className="login-title">Iniciar Sesión</h2>
              <p className="login-subtitle">
                Ingresa tus credenciales para acceder a la plataforma
              </p>
            </div>

            {errorMessage && (
              <div className="login-error-alert" role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label className="login-label" htmlFor="username">
                  Nombre de Usuario
                </label>
                <div className="login-input-wrapper">
                  <User size={18} className="login-input-icon" />
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="login-input"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="login-label-row">
                  <label className="login-label" htmlFor="password">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/recuperar-password')}
                    className="login-forgot-link"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="login-input-wrapper">
                  <Lock size={18} className="login-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="login-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-btn"
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Bloque Captcha cuando hay 3 o más intentos fallidos */}
              {failedAttempts >= 3 && (
                <CaptchaBox
                  captchaValue={captchaInput}
                  onCaptchaChange={handleCaptchaChange}
                  captchaError={captchaError}
                />
              )}

              <div className="login-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="login-btn-cancel"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="login-btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="login-spinner" />
                      <span>Verificando...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Ingresar al Sistema</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="login-footer-section">
            <button
              type="button"
              onClick={() => navigate('/recuperar-password')}
              className="login-recovery-shortcut"
            >
              <KeyRound size={15} />
              <span>Recuperar acceso a mi cuenta</span>
            </button>
            <p className="login-footer-text">
              © {new Date().getFullYear()} HYMA — Fundación Hombre y Mujer en Acción
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;