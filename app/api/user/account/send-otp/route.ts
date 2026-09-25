import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateAndSendDeletionOtp } from '@/lib/auth/accountSecurity';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await generateAndSendDeletionOtp(user.id, user.email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to dispatch verification code', retryAfterSeconds: result.retryAfterSeconds },
        { status: result.retryAfterSeconds ? 429 : 400 }
      );
    }

    // Masked email for display (e.g. j***@example.com)
    const [localPart, domain] = user.email.split('@');
    const maskedEmail = `${localPart.charAt(0)}***@${domain}`;

    return NextResponse.json({
      success: true,
      maskedEmail,
      message: `Verification code sent to ${maskedEmail}`,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
