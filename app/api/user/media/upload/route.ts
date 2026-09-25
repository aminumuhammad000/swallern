import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/user/media/upload
 * Handles media uploads (Images and Animated GIFs) for courses.
 * Performs MIME type, extension, and size validation before uploading to Cloudinary/storage.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in to upload media.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const assetKey = (formData.get('asset_key') as string) || `media_${Date.now()}`;
    const mediaType = (formData.get('media_type') as string)?.toUpperCase() || 'IMAGE';

    if (!file) {
      return NextResponse.json({ error: 'No media file supplied.' }, { status: 400 });
    }

    // 1. File Format & MIME Type Validation
    const mimeType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

    const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));
    const hasValidMime = allowedMimeTypes.includes(mimeType) || mimeType.startsWith('image/');

    if (!hasValidExt && !hasValidMime) {
      return NextResponse.json(
        { error: `Invalid file format "${file.name}". Supported formats: JPG, PNG, WEBP, Animated GIF.` },
        { status: 400 }
      );
    }

    // GIF Validation
    if (mediaType === 'GIF' || fileName.endsWith('.gif') || mimeType === 'image/gif') {
      if (!fileName.endsWith('.gif') && mimeType !== 'image/gif') {
        return NextResponse.json({ error: 'Selected file is not a valid animated GIF.' }, { status: 400 });
      }
    }

    // Size limit check (10 MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds maximum 10MB limit.' }, { status: 400 });
    }

    // 2. Cloudinary / Storage Upload Resolution
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let secureUrl = '';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'swallern_courses';

    if (cloudName) {
      try {
        const cloudFormData = new FormData();
        const blob = new Blob([buffer], { type: mimeType });
        cloudFormData.append('file', blob, file.name);

        // Signed upload if api_key and api_secret are available
        if (apiKey && apiSecret) {
          const timestamp = Math.floor(Date.now() / 1000).toString();
          const publicId = `swallern_${assetKey}_${Date.now()}`;
          const toSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
          const signature = crypto.createHash('sha1').update(toSign).digest('hex');

          cloudFormData.append('api_key', apiKey);
          cloudFormData.append('timestamp', timestamp);
          cloudFormData.append('public_id', publicId);
          cloudFormData.append('signature', signature);
        } else if (uploadPreset) {
          // Unsigned upload preset fallback
          cloudFormData.append('upload_preset', uploadPreset);
          cloudFormData.append('public_id', `swallern_${assetKey}_${Date.now()}`);
        }

        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: cloudFormData,
        });

        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          secureUrl = cloudData.secure_url;
        }
      } catch (err) {
        console.warn('Cloudinary upload fallback triggered:', err);
      }
    }

    // Fallback if Cloudinary credentials are not configured in environment
    if (!secureUrl) {
      const base64Data = buffer.toString('base64');
      secureUrl = `data:${mimeType || 'image/png'};base64,${base64Data}`;
    }

    // 3. Create Swallern Media Record
    const adminClient = createAdminClient();
    const isGif = mimeType === 'image/gif' || fileName.endsWith('.gif');

    const { data: mediaRecord, error: dbErr } = await adminClient
      .from('media_items')
      .insert({
        topic_id: '00000000-0000-0000-0000-000000000000', // Placeholder until linked to topic
        media_type: isGif ? 'INFOGRAPHIC' : 'ARTICLE',
        url: secureUrl,
        title: assetKey,
        channel_or_creator: 'User Upload',
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      message: `Media asset "${assetKey}" uploaded successfully.`,
      asset_key: assetKey,
      url: secureUrl,
      media_type: isGif ? 'GIF' : 'IMAGE',
      media_id: mediaRecord?.id || assetKey,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Media upload failed' },
      { status: 500 }
    );
  }
}
