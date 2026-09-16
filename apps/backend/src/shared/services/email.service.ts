import { Resend } from 'resend';
import { env } from '../../config/env.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export class EmailService {
  /**
   * Envia o código de 6 dígitos para o e-mail do usuário
   */
  static async sendVerificationCode(email: string, code: string, name?: string): Promise<boolean> {
    if (!resend) {
      console.log(`[EMAIL SIMULADO] Resend não configurado. Código para ${email}: ${code}`);
      return false;
    }

    try {
      const recipientName = name ? name.split(' ')[0] : 'Profissional';
      const response = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: [email],
        subject: `${code} é o seu código de confirmação - FisioPro`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #ffffff; color: #1c1917; border-radius: 16px; border: 1px solid #e7e5e4;">
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 20px; font-weight: 700; color: #1c1917; margin: 0 0 6px 0;">Confirmação de Acesso Clínico</h2>
              <p style="font-size: 14px; color: #78716c; margin: 0;">FisioPro — Gestão & Reabilitação Fisioterapêutica</p>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #44403c; margin-bottom: 20px;">
              Olá, <strong>${recipientName}</strong>. Use o código de verificação abaixo para confirmar sua conta profissional:
            </p>

            <div style="background-color: #f5f5f4; border: 1px solid #d6d3d1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-family: monospace, Courier, sans-serif; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0c0a09;">
                ${code}
              </span>
              <p style="font-size: 12px; color: #78716c; margin: 8px 0 0 0;">Válido por 15 minutos</p>
            </div>

            <p style="font-size: 13px; line-height: 1.5; color: #78716c; margin-bottom: 24px;">
              Se você não solicitou este código ou não tentou acessar o FisioPro, nenhuma ação é necessária.
            </p>

            <div style="border-top: 1px solid #e7e5e4; padding-top: 16px; font-size: 11px; color: #a8a29e;">
              © ${new Date().getFullYear()} FisioPro. Segurança e conformidade técnica para prontuário clínico.
            </div>
          </div>
        `,
      });

      if (response.error) {
        console.warn(`[RESEND AVISO] Resend Sandbox restringe envios apenas ao seu e-mail cadastrado na conta Resend. Detalhe:`, response.error.message);
        return false;
      }

      console.log(`[RESEND] E-mail enviado com sucesso para ${email}. ID:`, response.data?.id);
      return true;
    } catch (err: any) {
      console.error(`[RESEND ERRO] Falha ao enviar e-mail para ${email}:`, err?.message || err);
      return false;
    }
  }
}
