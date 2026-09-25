/**
 * Swallern In-App & Email Notification Types & Interfaces
 */

export type EmailProviderType = 'resend' | string;

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface NotificationResult {
  success: boolean;
  configured: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export interface NotificationConfigStatus {
  configured: boolean;
  providerName: string;
  adminEmail: string;
  fromEmail: string;
  error?: string;
}

export interface EmailProvider {
  providerName: string;
  providerType: EmailProviderType;
  isConfigured(): boolean;
  sendEmail(msg: EmailMessage): Promise<NotificationResult>;
}

export interface IngestionSummaryData {
  status: 'COMPLETED' | 'FAILED';
  totalFetched: number;
  acceptedCount: number;
  rejectedCount: number;
  ambiguousCount: number;
  topCandidates: Array<{ query: string; score: number; entity?: string }>;
  errors?: string[];
}

/**
 * In-App User Notifications (Section 12 of Spec)
 */
export type UserNotificationType =
  | 'course'
  | 'lesson'
  | 'progress'
  | 'achievement'
  | 'system'
  | 'account'
  | 'content';

export interface UserNotification {
  id: string;
  userId: string;
  type: UserNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  targetRoute?: string;
  metadata?: Record<string, unknown>;
}
