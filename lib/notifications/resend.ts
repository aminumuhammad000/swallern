/**
 * Swallern Resend Email Provider Implementation
 * Server-side email delivery via Resend REST API.
 */

import { EmailProvider, EmailMessage, NotificationResult, EmailProviderType } from './types';

export class ResendEmailProvider implements EmailProvider {
  public providerName = 'Resend';
  public providerType: EmailProviderType = 'resend';

  private getApiKey(): string | undefined {
    return process.env.RESEND_API_KEY?.trim();
  }

  public getFromEmail(): string {
    return process.env.RESEND_FROM_EMAIL?.trim() || 'onboarding@resend.dev';
  }

  public getAdminEmail(): string {
    return process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || 'swallern@gmail.com';
  }

  public isConfigured(): boolean {
    const key = this.getApiKey();
    return Boolean(key && key.length > 0);
  }

  public async sendEmail(msg: EmailMessage): Promise<NotificationResult> {
    const apiKey = this.getApiKey();
    const fromEmail = msg.from || this.getFromEmail();

    if (!apiKey) {
      return {
        success: false,
        configured: false,
        provider: this.providerName,
        error: 'Resend API key is missing or unconfigured. Set RESEND_API_KEY in environment variables.',
      };
    }

    try {
      const payload = {
        from: fromEmail,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        ...(msg.text && { text: msg.text }),
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ message: 'HTTP error response' }));
        return {
          success: false,
          configured: true,
          provider: this.providerName,
          error: `Resend API HTTP ${response.status}: ${errJson.message || 'Email delivery failed'}`,
        };
      }

      const json = await response.json();
      return {
        success: true,
        configured: true,
        provider: this.providerName,
        messageId: json?.id,
      };
    } catch (err) {
      return {
        success: false,
        configured: true,
        provider: this.providerName,
        error: err instanceof Error ? err.message : 'Resend email dispatch network request failed',
      };
    }
  }
}
