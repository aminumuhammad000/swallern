import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyDeletionOtp } from '@/lib/auth/accountSecurity';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { otp } = body;

    if (!otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json({ error: 'A valid 6-digit verification code is required.' }, { status: 400 });
    }

    const verification = verifyDeletionOtp(user.id, otp.trim());

    if (!verification.success) {
      return NextResponse.json(
        { error: verification.error, remainingAttempts: verification.remainingAttempts },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code confirmed. Ready for final deletion confirmation.',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
