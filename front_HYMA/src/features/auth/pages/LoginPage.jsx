import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { loginService } from '../services/authService';
import saludLogo from '../../../assets/images/log1.png';
import './LoginPage.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await loginService(username, password);

      // Guardar token JWT y datos de usuario para persistir la sesión
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(data.usuario));

      if (data.usuario.nombreRol === 'ENFERMERA') {
        navigate('/recepcion');
      } else {
        navigate('/inicio');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Credenciales incorrectas. Por favor verifica tus datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setUsername('');
    setPassword('');
    setErrorMessage('');
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
                    placeholder="Ej. medico1, enfermera1"
                    className="login-input"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login-field">
                <label className="login-label" htmlFor="password">
                  Contraseña
                </label>
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

          <p className="login-footer-text">
            © {new Date().getFullYear()} HYMA — Fundación Hombre y Mujer en Acción
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;