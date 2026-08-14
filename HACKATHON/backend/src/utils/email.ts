import nodemailer, { type Transporter } from 'nodemailer';
import { env, emailConfigured } from '../config/env';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!emailConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_PORT === 465,
      auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
    });
  }
  return transporter;
}

/**
 * Sends an email if EMAIL_USER/EMAIL_PASS are configured; otherwise logs the
 * link to the console. This keeps local dev and CI working without real SMTP
 * credentials, while production (which must set them) sends for real.
 */
async function send(to: string, subject: string, html: string, fallbackLogLabel: string, link: string) {
  const mailer = getTransporter();
  if (!mailer) {
    console.log(`✉️  [email disabled] ${fallbackLogLabel} for ${to}: ${link}`);
    return;
  }
  await mailer.sendMail({
    from: `"E-Kishaan" <${env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendPasswordSetupEmail(to: string, name: string, setupLink: string) {
  await send(
    to,
    'Set up your E-Kishaan account password',
    `<p>Hi ${name},</p>
     <p>Your E-Kishaan account has moved to our new sign-in system. Set a password to keep using it:</p>
     <p><a href="${setupLink}">${setupLink}</a></p>
     <p>This link expires in 1 hour.</p>`,
    'Account setup link',
    setupLink,
  );
}

export async function sendPasswordResetEmail(to: string, name: string, resetLink: string) {
  await send(
    to,
    'Reset your E-Kishaan password',
    `<p>Hi ${name},</p>
     <p>We received a request to reset your E-Kishaan password:</p>
     <p><a href="${resetLink}">${resetLink}</a></p>
     <p>If you didn't request this, you can ignore this email. This link expires in 1 hour.</p>`,
    'Password reset link',
    resetLink,
  );
}
