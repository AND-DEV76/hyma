import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import './CaptchaBox.css';

function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function CaptchaBox({ captchaValue, onCaptchaChange, captchaError }) {
  const [captchaText, setCaptchaText] = useState('');
  const canvasRef = useRef(null);

  const drawCaptcha = useCallback((text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#e0f2fe');
    gradient.addColorStop(1, '#bae6fd');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Random noise lines
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(3, 105, 161, ${0.15 + Math.random() * 0.25})`;
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(2, 132, 199, ${0.2 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render characters with rotation & offsets
    const charWidth = width / (text.length + 1);
    ctx.font = 'bold 22px monospace, sans-serif';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = (i + 0.8) * charWidth;
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 30 - 15) * (Math.PI / 180);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      // Vary color slightly
      const colors = ['#03045e', '#0077b6', '#0284c7', '#0369a1', '#0f172a'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    const newCode = generateRandomCode(6);
    setCaptchaText(newCode);
    drawCaptcha(newCode);
    if (onCaptchaChange) {
      onCaptchaChange('', newCode);
    }
  }, [drawCaptcha, onCaptchaChange]);

  useEffect(() => {
    refreshCaptcha();
  }, []);

  return (
    <div className="captcha-container">
      <div className="captcha-header-row">
        <div className="captcha-badge">
          <ShieldCheck size={15} />
          <span>Verificación de Seguridad Requerida</span>
        </div>
        <span className="captcha-subtext">3 intentos fallidos detectados</span>
      </div>

      <div className="captcha-box-card">
        <div className="captcha-visual-wrapper">
          <canvas
            ref={canvasRef}
            width={170}
            height={46}
            className="captcha-canvas"
            title="Código de seguridad"
          />
          <button
            type="button"
            onClick={refreshCaptcha}
            className="captcha-refresh-btn"
            title="Generar nuevo código"
            aria-label="Nuevo captcha"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="captcha-input-wrapper">
          <input
            type="text"
            placeholder="Escribe el código"
            value={captchaValue}
            onChange={(e) => {
              if (onCaptchaChange) {
                onCaptchaChange(e.target.value, captchaText);
              }
            }}
            className={`captcha-input ${captchaError ? 'captcha-input-error' : ''}`}
            maxLength={8}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
      </div>

      {captchaError && (
        <div className="captcha-error-msg">
          <AlertCircle size={14} />
          <span>{captchaError}</span>
        </div>
      )}
    </div>
  );
}

export default CaptchaBox;
