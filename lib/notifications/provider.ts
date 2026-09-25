/**
 * Swallern Email Notification Factory & Abstraction Engine
 */

import { EmailProvider, NotificationConfigStatus } from './types';
import { ResendEmailProvider } from './resend';

/**
 * Returns the active EmailProvider instance (defaults to Resend).
 */
export function getNotificationProvider(): EmailProvider {
  const providerName = (process.env.NOTIFICATION_PROVIDER || 'resend').toLowerCase().trim();

  switch (providerName) {
    case 'resend':
    default:
      return new ResendEmailProvider();
  }
}

/**
 * Returns notification service configuration status.
 */
export function getNotificationConfigStatus(): NotificationConfigStatus {
  const provider = getNotificationProvider();
  const isConfigured = provider.isConfigured();

  if (provider instanceof ResendEmailProvider) {
    return {
      configured: isConfigured,
      providerName: provider.providerName,
      adminEmail: provider.getAdminEmail(),
      fromEmail: provider.getFromEmail(),
      ...(!isConfigured && { error: 'RESEND_API_KEY is missing or unconfigured.' }),
    };
  }

  return {
    configured: false,
    providerName: provider.providerName,
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || 'swallern@gmail.com',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
    error: 'Unrecognized notification provider.',
  };
}
