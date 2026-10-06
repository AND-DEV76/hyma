import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  ArrowLeft,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import {
  solicitarRecuperacionService,
  verificarCodigoService,
  cambiarPasswordService
} from '../services/authService';
import saludLogo from '../../../assets/images/log1.png';
import './RecuperarPasswordPage.css';

export function RecuperarPasswordPage() {
  const [step, setStep] = useState(1); // 1: Correo, 2: Código OTP, 3: Nueva Contraseña, 4: Éxito
  const [correo, setCorreo] = useState('');
  const [correoOfuscado, setCorreoOfuscado] = useState('');
  const [codigoOTP, setCodigoOTP] = useState(['', '', '', '', '', '']);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutos (180 segundos)
  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate();

  // Temporizador regresivo de 3 minutos
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setErrorMsg('El código de 3 minutos ha expirado. Por favor solicita un nuevo código.');
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Paso 1: Enviar correo
  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    if (!correo.trim()) {
      setErrorMsg('Por favor ingresa tu correo electrónico registrado.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const res = await solicitarRecuperacionService(correo.trim());
      setCorreoOfuscado(res.correoOfuscado || correo.trim());
      setTimeLeft(res.expiracionSegundos || 180);
      setTimerActive(true);
      setStep(2);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al procesar la solicitud.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Manejo de dígitos OTP
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...codigoOTP];
    newOtp[index] = value.slice(-1);
    setCodigoOTP(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`rec-otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigoOTP[index] && index > 0) {
      const prevInput = document.getElementById(`rec-otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const getFullCode = () => codigoOTP.join('');

  // Paso 2: Verificar código OTP
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    const codigoCompleto = getFullCode();
    if (codigoCompleto.length !== 6) {
      setErrorMsg('Ingresa el código completo de 6 dígitos.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMsg('El código ha expirado. Solicita un nuevo código de seguridad.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await verificarCodigoService(correo.trim(), codigoCompleto);
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'El código es incorrecto o ha expirado.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Reenviar código
  const handleReenviar = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await solicitarRecuperacionService(correo.trim());
      setCodigoOTP(['', '', '', '', '', '']);
      setTimeLeft(res.expiracionSegundos || 180);
      setTimerActive(true);
      const firstInput = document.getElementById('rec-otp-input-0');
      if (firstInput) firstInput.focus();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'No fue posible reenviar el código.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Guardar nueva contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (!nuevaPassword || nuevaPassword.length < 8) {
      setErrorMsg('La nueva contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden. Por favor verifica.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await cambiarPasswordService(correo.trim(), getFullCode(), nuevaPassword);
      setStep(4);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al actualizar la contraseña.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recuperar-page-container">
      <div className="recuperar-page-card">
        
        {/* Panel Izquierdo - BRANDING */}
        <div className="recuperar-left-panel">
          <div className="recuperar-brand-content">
            <div className="recuperar-logo-wrapper">
              <img
                src={saludLogo}
                alt="Programa de Salud - HYMA"
                className="recuperar-logo-img"
              />
            </div>

            <h2 className="recuperar-brand-title">Programa de Salud</h2>
            <p className="recuperar-brand-subtitle">Hombre y Mujer en Acción</p>
            <p className="recuperar-brand-desc">
              Portal seguro de recuperación de credenciales de usuario del sistema.
            </p>

            <div className="recuperar-feature-badge">
              <ShieldCheck size={18} />
              <span>Verificación de Identidad por Correo</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho - FORMULARIO COMPLETO */}
        <div className="recuperar-right-panel">
          <div>
            <div className="recuperar-top-nav">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="recuperar-back-link"
                title="Volver a la pantalla de inicio de sesión"
              >
                <ArrowLeft size={16} />
                <span>Volver al Inicio de Sesión</span>
              </button>
            </div>

            <div className="recuperar-header">
              <h2 className="recuperar-title">Recuperar Contraseña</h2>
              <p className="recuperar-subtitle">
                {step === 1 && 'Paso 1 de 3: Identifica tu cuenta por correo electrónico'}
                {step === 2 && 'Paso 2 de 3: Verifica el código de seguridad de 6 dígitos'}
                {step === 3 && 'Paso 3 de 3: Establece tu nueva contraseña del sistema'}
                {step === 4 && '¡Proceso completado con éxito!'}
              </p>
            </div>

            {/* Barra de progreso de pasos */}
            {step < 4 && (
              <div className="recuperar-steps-indicator">
                <div className={`step-node ${step >= 1 ? 'active' : ''}`}>
                  <span className="step-circle">1</span>
                  <span className="step-text">Correo</span>
                </div>
                <div className={`step-track ${step >= 2 ? 'active' : ''}`} />
                <div className={`step-node ${step >= 2 ? 'active' : ''}`}>
                  <span className="step-circle">2</span>
                  <span className="step-text">Código (3 min)</span>
                </div>
                <div className={`step-track ${step >= 3 ? 'active' : ''}`} />
                <div className={`step-node ${step >= 3 ? 'active' : ''}`}>
                  <span className="step-circle">3</span>
                  <span className="step-text">Nueva Clave</span>
                </div>
              </div>
            )}

            {/* Alerta de Error */}
            {errorMsg && (
              <div className="recuperar-alert-error" role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* PASO 1: Formulario de Correo */}
            {step === 1 && (
              <form onSubmit={handleSolicitarCodigo} className="recuperar-form">
                <p className="recuperar-instruction">
                  Ingresa tu <strong>Correo Electrónico</strong> registrado en el sistema. Te enviaremos un código numérico para validar tu identidad.
                </p>

                <div className="recuperar-input-group">
                  <label htmlFor="recovery-email" className="recuperar-input-label">
                    Correo Electrónico Registrado
                  </label>
                  <div className="recuperar-field-box">
                    <Mail size={18} className="recuperar-field-icon" />
                    <input
                      id="recovery-email"
                      type="email"
                      required
                      placeholder="ejemplo@correo.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className="recuperar-field-input"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="recuperar-actions-row">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="recuperar-btn-alt"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="recuperar-btn-main"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="recuperar-spinner-text">Enviando código...</span>
                    ) : (
                      <>
                        <span>Enviar Código</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 2: Verificación de Código OTP */}
            {step === 2 && (
              <form onSubmit={handleVerificarCodigo} className="recuperar-form">
                <div className="recuperar-otp-banner">
                  <UserCheck size={18} className="recuperar-otp-icon" />
                  <div>
                    Código enviado a: <strong>{correoOfuscado}</strong>
                  </div>
                </div>

                <div className="recuperar-timer-banner">
                  <Clock size={16} />
                  <span>
                    Tiempo de validez restante: <strong>{formatTimer(timeLeft)}</strong>
                  </span>
                </div>

                <p className="recuperar-instruction" style={{ textAlign: 'center' }}>
                  Escribe los 6 dígitos que enviamos a tu bandeja de correo:
                </p>

                <div className="recuperar-otp-grid">
                  {codigoOTP.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`rec-otp-input-${idx}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="recuperar-otp-cell"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <div className="recuperar-resend-row">
                  <span className="recuperar-resend-text">¿No recibiste el código o expiró?</span>
                  <button
                    type="button"
                    onClick={handleReenviar}
                    disabled={loading || timeLeft > 120}
                    className="recuperar-resend-btn"
                  >
                    <RotateCcw size={14} />
                    <span>Reenviar código</span>
                  </button>
                </div>

                <div className="recuperar-actions-row">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="recuperar-btn-alt"
                    disabled={loading}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="recuperar-btn-main"
                    disabled={loading || getFullCode().length !== 6}
                  >
                    {loading ? (
                      <span className="recuperar-spinner-text">Validando...</span>
                    ) : (
                      <>
                        <span>Verificar Código</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 3: Nueva Contraseña */}
            {step === 3 && (
              <form onSubmit={handleCambiarPassword} className="recuperar-form">
                <p className="recuperar-instruction">
                  Ingresa tu nueva contraseña para acceder al sistema. Debe contener un mínimo de <strong>8 caracteres</strong>.
                </p>

                <div className="recuperar-input-group">
                  <label htmlFor="rec-new-password" className="recuperar-input-label">
                    Nueva Contraseña
                  </label>
                  <div className="recuperar-field-box">
                    <Lock size={18} className="recuperar-field-icon" />
                    <input
                      id="rec-new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 8 caracteres"
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      className="recuperar-field-input"
                      minLength={8}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="recuperar-field-eye"
                      aria-label="Alternar visibilidad"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div className="recuperar-input-group">
                  <label htmlFor="rec-confirm-password" className="recuperar-input-label">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="recuperar-field-box">
                    <Lock size={18} className="recuperar-field-icon" />
                    <input
                      id="rec-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repite la nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="recuperar-field-input"
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="recuperar-actions-row">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="recuperar-btn-alt"
                    disabled={loading}
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="recuperar-btn-main"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="recuperar-spinner-text">Guardando...</span>
                    ) : (
                      <>
                        <span>Restablecer Contraseña</span>
                        <CheckCircle2 size={17} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* PASO 4: Pantalla de Éxito */}
            {step === 4 && (
              <div className="recuperar-success-view">
                <div className="recuperar-success-circle">
                  <CheckCircle2 size={54} />
                </div>
                <h3 className="recuperar-success-title">¡Contraseña Actualizada con Éxito!</h3>
                <p className="recuperar-success-text">
                  Tu contraseña del sistema HYMA ha sido actualizada correctamente con cifrado de seguridad Argon2id. Ya puedes ingresar con tu nueva clave.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="recuperar-btn-main full-width"
                >
                  Ir al Inicio de Sesión
                </button>
              </div>
            )}
          </div>

          <p className="recuperar-footer-text">
            © {new Date().getFullYear()} HYMA — Fundación Hombre y Mujer en Acción
          </p>
        </div>

      </div>
    </div>
  );
}

export default RecuperarPasswordPage;
