/**
 * Swallern Reusable Email Notification Service
 * Dispatches HTML & plain text notifications for trend ingestion, reviews, failures, and publications.
 */

import { getNotificationProvider, getNotificationConfigStatus } from './provider';
import { IngestionSummaryData, NotificationResult } from './types';

export { getNotificationConfigStatus };

/**
 * Sends a single summary email notification to the admin after trend ingestion completes or fails.
 */
export async function sendIngestionSummaryNotification(
  data: IngestionSummaryData
): Promise<NotificationResult> {
  const provider = getNotificationProvider();
  const config = getNotificationConfigStatus();

  if (!config.configured) {
    console.log('[NotificationService] Email dispatch skipped: RESEND_API_KEY unconfigured.');
    return {
      success: false,
      configured: false,
      provider: provider.providerName,
      error: 'RESEND_API_KEY unconfigured',
    };
  }

  const isSuccess = data.status === 'COMPLETED';
  const subject = `[Swallern Pipeline] Trend Ingestion ${data.status} – ${data.acceptedCount} New Candidates`;

  const topCandidatesHtml =
    data.topCandidates.length > 0
      ? data.topCandidates
          .map(
            (c) =>
              `<li style="margin-bottom: 4px;"><strong>${c.query}</strong> (Score: ${c.score}/100)${
                c.entity ? ` — <em>${c.entity}</em>` : ''
              }</li>`
          )
          .join('')
      : '<li>No new candidates accepted in this run.</li>';

  const errorsHtml =
    data.errors && data.errors.length > 0
      ? `<div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px; border-radius: 6px; margin-top: 12px;">
          <strong>Pipeline Errors:</strong>
          <ul>${data.errors.map((e) => `<li>${e}</li>`).join('')}</ul>
         </div>`
      : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e1b4b; margin-top: 0;">⚡ Swallern Trend Ingestion Run Summary</h2>
      
      <div style="background: ${isSuccess ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${isSuccess ? '#bbf7d0' : '#fecaca'}; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
        <strong style="color: ${isSuccess ? '#166534' : '#dc2626'};">Status: ${data.status}</strong>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #6b7280;">Total Trends Fetched:</td><td style="font-weight: 700; text-align: right;">${data.totalFetched}</td></tr>
        <tr><td style="padding: 6px 0; color: #16a34a;">Accepted Candidates:</td><td style="font-weight: 700; text-align: right; color: #16a34a;">${data.acceptedCount}</td></tr>
        <tr><td style="padding: 6px 0; color: #d97706;">Ambiguous (Requires Admin Review):</td><td style="font-weight: 700; text-align: right; color: #d97706;">${data.ambiguousCount}</td></tr>
        <tr><td style="padding: 6px 0; color: #9ca3af;">Rejected / Filtered out:</td><td style="font-weight: 700; text-align: right; color: #9ca3af;">${data.rejectedCount}</td></tr>
      </table>

      <h3 style="color: #111827; font-size: 16px; margin-bottom: 8px;">Top Discovered Candidates:</h3>
      <ol style="padding-left: 20px; font-size: 14px; color: #374151;">
        ${topCandidatesHtml}
      </ol>

      ${errorsHtml}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;">
        <a href="https://swallern.com/admin/pipeline" style="background: #4f46e5; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">
          Open Admin Pipeline →
        </a>
      </div>
    </div>
  `;

  const result = await provider.sendEmail({
    to: config.adminEmail,
    subject,
    html,
  });

  if (result.success) {
    console.log(`[NotificationService] Trend ingestion summary email sent to ${config.adminEmail}`);
  } else {
    console.log(`[NotificationService] Email delivery notice: ${result.error}`);
  }

  return result;
}

/**
 * Reusable helper: Notification for content draft ready for review.
 */
export async function sendContentReviewNotification(topicId: string, title: string): Promise<NotificationResult> {
  const provider = getNotificationProvider();
  const config = getNotificationConfigStatus();
  if (!config.configured) return { success: false, configured: false, provider: provider.providerName };

  return provider.sendEmail({
    to: config.adminEmail,
    subject: `[Swallern Review] Content Draft Ready: "${title}"`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>📋 AI Content Draft Ready for Review</h2>
        <p>Topic: <strong>${title}</strong></p>
        <p><a href="https://swallern.com/admin/review?topic_id=${topicId}">Open Unified Content Review Dashboard →</a></p>
      </div>
    `,
  });
}

/**
 * Reusable helper: Notification for ambiguous trend requiring confirmation.
 */
export async function sendAmbiguousTrendNotification(
  candidateId: string,
  query: string,
  alternativeMeanings: string[]
): Promise<NotificationResult> {
  const provider = getNotificationProvider();
  const config = getNotificationConfigStatus();
  if (!config.configured) return { success: false, configured: false, provider: provider.providerName };

  return provider.sendEmail({
    to: config.adminEmail,
    subject: `[Swallern Alert] Ambiguous Trend Requires Entity Confirmation: "${query}"`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>⚠️ Ambiguous Trend Candidate</h2>
        <p>Keyword: <strong>"${query}"</strong> matches ${alternativeMeanings.length} possible entity interpretations.</p>
        <p><a href="https://swallern.com/admin/pipeline">Open Admin Pipeline to Confirm Entity →</a></p>
      </div>
    `,
  });
}

/**
 * Reusable helper: Notification for generated image ready for review.
 */
export async function sendImageReviewNotification(topicId: string, assetId: string): Promise<NotificationResult> {
  const provider = getNotificationProvider();
  const config = getNotificationConfigStatus();
  if (!config.configured) return { success: false, configured: false, provider: provider.providerName };

  return provider.sendEmail({
    to: config.adminEmail,
    subject: `[Swallern Review] Generated Image Awaiting Admin Approval`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>🖼 Educational Image Asset Generated</h2>
        <p>An educational visual image has been generated and requires human approval before public display.</p>
        <p><a href="https://swallern.com/admin/review?topic_id=${topicId}">Review & Approve Image Asset →</a></p>
      </div>
    `,
  });
}

/**
 * Reusable helper: Notification for pipeline failures.
 */
export async function sendPipelineFailureNotification(jobType: string, errorMessage: string): Promise<NotificationResult> {
  const provider = getNotificationProvider();
  const config = getNotificationConfigStatus();
  if (!config.configured) return { success: false, configured: false, provider: provider.providerName };

  return provider.sendEmail({
    to: config.adminEmail,
    subject: `[Swallern Failure] Content Pipeline Job Failed (${jobType})`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #dc2626;">
        <h2>🚨 Content Pipeline Job Failure</h2>
        <p>Job Type: <strong>${jobType}</strong></p>
        <p>Error: <code>${errorMessage}</code></p>
        <p><a href="https://swallern.com/admin/pipeline">Open Admin Pipeline Dashboard →</a></p>
      </div>
    `,
  });
}

/**
 * Reusable helper: Notification for topic publication events.
 */
export async function sendPublicationNotification(topicId: string, title: string): Promise<NotificationResult> {
  const provider = getNotificationProvider();
  const config = getNotificationConfigStatus();
  if (!config.configured) return { success: false, configured: false, provider: provider.providerName };

  return provider.sendEmail({
    to: config.adminEmail,
    subject: `[Swallern Published] Topic is Live: "${title}"`,
    html: `
      <div style="font-family: sans-serif; padding: 20px;">
        <h2>🚀 Topic Approved & Published</h2>
        <p>Topic: <strong>${title}</strong> is now live for Swallern learners.</p>
      </div>
    `,
  });
}
