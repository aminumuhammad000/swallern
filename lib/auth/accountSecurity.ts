/**
 * Swallern Account Security & Deletion Challenge Manager
 * Implements server-authoritative password verification, cryptographically secure email OTPs,
 * rate limiting, expiration windows, and protected permanent account deletion.
 */

import crypto from 'crypto';
import { getNotificationProvider, getNotificationConfigStatus } from '@/lib/notifications/provider';

interface DeletionChallenge {
  userId: string;
  userEmail: string;
  passwordVerified: boolean;
  otpHash: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  isOtpVerified: boolean;
}

// In-memory challenge store (keyed by userId)
const deletionChallenges = new Map<string, DeletionChallenge>();
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Check if user is rate limited for OTP generation
 */
export function checkRateLimit(userId: string): { isLimited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(userId);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(userId, { count: 1, windowStart: now });
    return { isLimited: false, retryAfterSeconds: 0 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const remainingMs = RATE_LIMIT_WINDOW_MS - (now - record.windowStart);
    return { isLimited: true, retryAfterSeconds: Math.ceil(remainingMs / 1000) };
  }

  record.count += 1;
  rateLimitStore.set(userId, record);
  return { isLimited: false, retryAfterSeconds: 0 };
}

/**
 * Record successful password verification for account deletion
 */
export function recordPasswordVerification(userId: string, userEmail: string): void {
  const now = Date.now();
  deletionChallenges.set(userId, {
    userId,
    userEmail,
    passwordVerified: true,
    otpHash: '',
    createdAt: now,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    isOtpVerified: false,
  });
}

/**
 * Generate, store, and email 6-digit OTP to user
 */
export async function generateAndSendDeletionOtp(
  userId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string; retryAfterSeconds?: number }> {
  const rateCheck = checkRateLimit(userId);
  if (rateCheck.isLimited) {
    return {
      success: false,
      error: `Too many verification requests. Please try again in ${rateCheck.retryAfterSeconds} seconds.`,
      retryAfterSeconds: rateCheck.retryAfterSeconds,
    };
  }

  const challenge = deletionChallenges.get(userId);
  if (!challenge || !challenge.passwordVerified) {
    return { success: false, error: 'Password must be confirmed before requesting a verification code.' };
  }

  // Generate secure 6-digit code (e.g. 842193)
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const otpHash = hashOtp(rawOtp);
  const now = Date.now();

  challenge.otpHash = otpHash;
  challenge.createdAt = now;
  challenge.expiresAt = now + OTP_EXPIRY_MS;
  challenge.attempts = 0;
  challenge.isOtpVerified = false;

  deletionChallenges.set(userId, challenge);

  // Send Email via notification provider (Resend or fallback)
  const provider = getNotificationProvider();
  const config = getNotificationConfigStatus();

  const emailSubject = 'Your Swallern Account Deletion Verification Code';
  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; borderRadius: 12px; backgroundColor: #FFFFFF;">
      <h2 style="color: #0F172A; margin-top: 0; font-size: 1.25rem;">Confirm Account Deletion</h2>
      <p style="color: #475569; font-size: 0.9rem; line-height: 1.5;">
        You have requested to permanently delete your Swallern account. Use the one-time verification code below to authorize this action.
      </p>
      <div style="margin: 24px 0; text-align: center;">
        <div style="display: inline-block; padding: 14px 28px; background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 12px; font-size: 2rem; font-weight: 800; letter-spacing: 0.25em; color: #DC2626; font-family: monospace;">
          ${rawOtp}
        </div>
      </div>
      <p style="color: #64748B; font-size: 0.8rem; line-height: 1.4; margin-bottom: 0;">
        This code will expire in <strong>10 minutes</strong> and can only be used once. If you did not initiate this request, please change your password immediately.
      </p>
    </div>
  `;

  if (config.configured) {
    await provider.sendEmail({
      to: userEmail,
      subject: emailSubject,
      html: emailHtml,
    });
  } else {
    // In dev without Resend API key, log to server console securely
    console.log(`[AccountSecurity] Dev OTP for ${userEmail}: ${rawOtp}`);
  }

  return { success: true };
}

/**
 * Verify submitted OTP against active challenge
 */
export function verifyDeletionOtp(
  userId: string,
  submittedOtp: string
): { success: boolean; error?: string; remainingAttempts?: number } {
  const challenge = deletionChallenges.get(userId);

  if (!challenge || !challenge.passwordVerified || !challenge.otpHash) {
    return { success: false, error: 'No active deletion request found. Please restart the verification process.' };
  }

  const now = Date.now();
  if (now > challenge.expiresAt) {
    deletionChallenges.delete(userId);
    return { success: false, error: 'Verification code has expired. Please request a new code.' };
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    deletionChallenges.delete(userId);
    return { success: false, error: 'Maximum attempts exceeded. Verification has been reset for your security.' };
  }

  const submittedHash = hashOtp(submittedOtp.trim());
  if (submittedHash !== challenge.otpHash) {
    challenge.attempts += 1;
    const remaining = MAX_ATTEMPTS - challenge.attempts;
    deletionChallenges.set(userId, challenge);
    return {
      success: false,
      error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      remainingAttempts: remaining,
    };
  }

  // Mark verified
  challenge.isOtpVerified = true;
  deletionChallenges.set(userId, challenge);
  return { success: true };
}

/**
 * Confirm if user is fully authorized to perform final deletion
 */
export function isDeletionAuthorized(userId: string): boolean {
  const challenge = deletionChallenges.get(userId);
  if (!challenge) return false;
  const now = Date.now();
  return challenge.passwordVerified && challenge.isOtpVerified && now <= challenge.expiresAt;
}

/**
 * Clear deletion challenge on completion or cancellation
 */
export function clearDeletionChallenge(userId: string): void {
  deletionChallenges.delete(userId);
}
