package com.hyma.auth.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    public record EmailResult(boolean success, String errorMessage) {}

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:angelambrocio777@gmail.com}")
    private String fromEmail;

    @Value("${spring.mail.password:}")
    private String mailPassword;

    /**
     * Envía el correo con el código de recuperación mediante Gmail SMTP oficial de Spring Boot.
     *
     * @param destinatario Correo electrónico de destino (ej. damaris@gmail.com)
     * @param codigoOTP    Código numérico de 6 dígitos
     * @param nombreUsuario Nombre del usuario registrado
     * @return EmailResult con estado de éxito o mensaje descriptivo
     */
    public EmailResult enviarCodigoRecuperacion(String destinatario, String codigoOTP, String nombreUsuario) {
        if (mailPassword == null || mailPassword.isBlank()) {
            String errorMsg = "El servidor requiere la Contraseña de Aplicación de Gmail (variable MAIL_PASSWORD) para despachar correos.";
            log.error(errorMsg);
            return new EmailResult(false, errorMsg);
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("HYMA Salud <" + fromEmail + ">");
            helper.setTo(destinatario);
            helper.setSubject("Código de Recuperación de Contraseña - HYMA");
            helper.setText(buildEmailTemplate(codigoOTP, nombreUsuario), true);

            mailSender.send(message);
            log.info("Correo de recuperación enviado con éxito vía Gmail SMTP a {}", destinatario);
            return new EmailResult(true, null);
        } catch (Exception e) {
            log.error("Excepción al enviar correo vía Gmail SMTP a {}: {}", destinatario, e.getMessage(), e);
            return new EmailResult(false, e.getMessage());
        }
    }

    private String buildEmailTemplate(String codigoOTP, String nombreUsuario) {
        String html = """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Recuperación de Contraseña</title>
              <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
                .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
                .header { background: linear-gradient(135deg, #03045e 0%, #0077b6 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
                .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
                .header p { margin: 6px 0 0 0; color: #90e0ef; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
                .content { padding: 32px 28px; }
                .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
                .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
                .code-box { background: #f8fafc; border: 2px dashed #0077b6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
                .code-title { font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
                .code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0077b6; font-family: monospace; }
                .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #92400e; margin: 20px 0; }
                .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Fundación Hombre y Mujer en Acción</h1>
                  <p>Sistema Clínico HYMA</p>
                </div>
                <div class="content">
                  <div class="greeting">Hola, {{NOMBRE}}</div>
                  <p class="text">
                    Hemos recibido una solicitud para restablecer la contraseña de acceso a tu cuenta en el sistema HYMA.
                    Utiliza el siguiente código de verificación de 6 dígitos para continuar:
                  </p>
                  <div class="code-box">
                    <div class="code-title">Código de Seguridad</div>
                    <div class="code">{{CODIGO}}</div>
                  </div>
                  <div class="warning-box">
                    ⏱️ <strong>Importante:</strong> Este código de seguridad es de uso único y tiene una validez de <strong>3 minutos</strong>.
                  </div>
                  <p class="text" style="font-size: 13px; margin-top: 20px;">
                    Si no solicitaste este cambio, puedes ignorar este correo de forma segura. La contraseña de tu cuenta no será modificada.
                  </p>
                </div>
                <div class="footer">
                  © 2026 HYMA — Sistema de Gestión Clínica y Asistencia Social.
                </div>
              </div>
            </body>
            </html>
            """;

        String nombre = (nombreUsuario != null && !nombreUsuario.isBlank()) ? nombreUsuario : "Usuario";
        return html.replace("{{NOMBRE}}", nombre).replace("{{CODIGO}}", codigoOTP);
    }
}
