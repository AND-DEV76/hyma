import React, { useState, useEffect } from 'react';
import {
  X,
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
  UserCheck
} from 'lucide-react';
import {
  solicitarRecuperacionService,
  verificarCodigoService,
  cambiarPasswordService
} from '../services/authService';
import './RecuperarPasswordModal.css';

export function RecuperarPasswordModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Solicitar por correo, 2: Código OTP, 3: Nueva Clave, 4: Éxito
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

  // Cuenta regresiva de 3 minutos
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

  if (!isOpen) return null;

  const resetAll = () => {
    setStep(1);
    setCorreo('');
    setCorreoOfuscado('');
    setCodigoOTP(['', '', '', '', '', '']);
    setNuevaPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setErrorMsg('');
    setTimeLeft(180);
    setTimerActive(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Formato mm:ss
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Paso 1: Enviar correo con el código
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

  // Manejo de los 6 inputs del código OTP
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...codigoOTP];
    newOtp[index] = value.slice(-1);
    setCodigoOTP(newOtp);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigoOTP[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const getFullCode = () => codigoOTP.join('');

  // Paso 2: Verificar el código OTP
  const handleVerificarCodigo = async (e) => {
    e.preventDefault();
    const codigoCompleto = getFullCode();
    if (codigoCompleto.length !== 6) {
      setErrorMsg('Ingresa el código completo de 6 dígitos.');
      return;
    }

    if (timeLeft <= 0) {
      setErrorMsg('El código ha expirado. Solicita un nuevo código.');
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
      const firstInput = document.getElementById('otp-input-0');
      if (firstInput) firstInput.focus();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'No se pudo reenviar el código.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Guardar nueva contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    if (!nuevaPassword || nuevaPassword.length < 8) {
      setErrorMsg('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }
    if (nuevaPassword !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await cambiarPasswordService(correo.trim(), getFullCode(), nuevaPassword);
      setStep(4);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al cambiar la contraseña.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-recuperar-overlay" onClick={handleClose}>
      <div className="modal-recuperar-container" onClick={(e) => e.stopPropagation()}>
        {/* Cabecera */}
        <div className="modal-recuperar-header">
          <div className="modal-recuperar-header-content">
            <div className="modal-recuperar-icon-badge">
              <KeyRound size={22} />
            </div>
            <div>
              <h3 className="modal-recuperar-title">Recuperación de Contraseña</h3>
              <p className="modal-recuperar-subtitle">
                {step === 1 && 'Paso 1 de 3: Identifica tu cuenta por correo'}
                {step === 2 && 'Paso 2 de 3: Verifica el código de seguridad'}
                {step === 3 && 'Paso 3 de 3: Establece tu nueva contraseña'}
                {step === 4 && '¡Contraseña actualizada con éxito!'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="modal-recuperar-close-btn"
            title="Cerrar ventana"
          >
            <X size={20} />
          </button>
        </div>

        {/* Barra de progreso de pasos */}
        {step < 4 && (
          <div className="modal-recuperar-steps-bar">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
              <span className="step-num">1</span>
              <span className="step-label">Correo</span>
            </div>
            <div className={`step-line ${step >= 2 ? 'active' : ''}`} />
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
              <span className="step-num">2</span>
              <span className="step-label">Código (3 min)</span>
            </div>
            <div className={`step-line ${step >= 3 ? 'active' : ''}`} />
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
              <span className="step-num">3</span>
              <span className="step-label">Nueva Clave</span>
            </div>
          </div>
        )}

        {/* Mensaje de error general */}
        {errorMsg && (
          <div className="modal-recuperar-alert-error" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* CUERPO DEL PASO 1 */}
        {step === 1 && (
          <form onSubmit={handleSolicitarCodigo} className="modal-recuperar-body">
            <p className="modal-recuperar-desc">
              Ingresa tu <strong>Correo Electrónico</strong> registrado en el sistema. Te enviaremos un código numérico de seguridad para validar tu identidad.
            </p>

            <div className="recuperar-field-group">
              <label htmlFor="recovery-email-input" className="recuperar-label">
                Correo Electrónico
              </label>
              <div className="recuperar-input-box">
                <Mail size={18} className="recuperar-icon" />
                <input
                  id="recovery-email-input"
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="recuperar-input"
                  autoFocus
                />
              </div>
            </div>

            <div className="modal-recuperar-footer">
              <button
                type="button"
                onClick={handleClose}
                className="recuperar-btn-secondary"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="recuperar-btn-primary"
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

        {/* CUERPO DEL PASO 2 */}
        {step === 2 && (
          <form onSubmit={handleVerificarCodigo} className="modal-recuperar-body">
            <div className="otp-info-card">
              <UserCheck size={18} className="otp-info-icon" />
              <div className="otp-info-text">
                Código de seguridad enviado a: <strong>{correoOfuscado}</strong>
              </div>
            </div>

            <div className="otp-timer-badge">
              <Clock size={16} />
              <span>
                Tiempo restante de validez: <strong>{formatTimer(timeLeft)}</strong>
              </span>
            </div>

            <p className="modal-recuperar-desc" style={{ textAlign: 'center' }}>
              Escribe el código de 6 dígitos que enviamos a tu bandeja de entrada:
            </p>

            <div className="otp-inputs-grid">
              {codigoOTP.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="otp-digit-box"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div className="otp-resend-row">
              <span className="otp-resend-prompt">¿No recibiste el código o expiró?</span>
              <button
                type="button"
                onClick={handleReenviar}
                disabled={loading || timeLeft > 120}
                className="otp-resend-btn"
              >
                <RotateCcw size={14} />
                <span>Reenviar código</span>
              </button>
            </div>

            <div className="modal-recuperar-footer">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="recuperar-btn-secondary"
                disabled={loading}
              >
                Volver
              </button>
              <button
                type="submit"
                className="recuperar-btn-primary"
                disabled={loading || getFullCode().length !== 6}
              >
                {loading ? (
                  <span className="recuperar-spinner-text">Verificando...</span>
                ) : (
                  <>
                    <span>Validar Código</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* CUERPO DEL PASO 3 */}
        {step === 3 && (
          <form onSubmit={handleCambiarPassword} className="modal-recuperar-body">
            <p className="modal-recuperar-desc">
              Ingresa tu nueva contraseña para la cuenta. Debe tener al menos <strong>8 caracteres</strong>.
            </p>

            <div className="recuperar-field-group">
              <label htmlFor="recovery-new-pass" className="recuperar-label">
                Nueva Contraseña
              </label>
              <div className="recuperar-input-box">
                <Lock size={18} className="recuperar-icon" />
                <input
                  id="recovery-new-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Mínimo 8 caracteres"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  className="recuperar-input"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="recuperar-eye-btn"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="recuperar-field-group">
              <label htmlFor="recovery-confirm-pass" className="recuperar-label">
                Confirmar Nueva Contraseña
              </label>
              <div className="recuperar-input-box">
                <Lock size={18} className="recuperar-icon" />
                <input
                  id="recovery-confirm-pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite la nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="recuperar-input"
                  minLength={8}
                />
              </div>
            </div>

            <div className="modal-recuperar-footer">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="recuperar-btn-secondary"
                disabled={loading}
              >
                Volver
              </button>
              <button
                type="submit"
                className="recuperar-btn-primary"
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

        {/* CUERPO DEL PASO 4 (ÉXITO) */}
        {step === 4 && (
          <div className="modal-recuperar-body success-view">
            <div className="success-icon-circle">
              <CheckCircle2 size={48} />
            </div>
            <h4 className="success-title">¡Contraseña Restablecida!</h4>
            <p className="success-desc">
              Tu contraseña ha sido actualizada con éxito y de forma segura. Ya puedes ingresar al sistema con tus nuevas credenciales.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="recuperar-btn-primary full-width"
            >
              Ir a Iniciar Sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecuperarPasswordModal;
