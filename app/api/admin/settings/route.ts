import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/admin/auth';
import { getPlatformSetting, setPlatformSetting } from '@/lib/settings';

/**
 * GET /api/admin/settings
 * Admin endpoint: Fetches current platform settings.
 */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const autoApproveUserTopics = await getPlatformSetting<boolean>('auto_approve_user_topics', false);

    return NextResponse.json({
      settings: {
        auto_approve_user_topics: autoApproveUserTopics,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed fetching settings' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Admin endpoint: Updates platform settings (e.g. auto_approve_user_topics).
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { auto_approve_user_topics } = body;

    if (auto_approve_user_topics !== undefined) {
      await setPlatformSetting('auto_approve_user_topics', Boolean(auto_approve_user_topics));
    }

    const updatedSetting = await getPlatformSetting<boolean>('auto_approve_user_topics', false);

    return NextResponse.json({
      success: true,
      message: 'Platform settings updated successfully.',
      settings: {
        auto_approve_user_topics: updatedSetting,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed updating settings' },
      { status: 500 }
    );
  }
}
