import { getAdminUser } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';
import { ReviewDashboard } from './ReviewDashboard';

export const metadata = {
  title: 'Content Review Dashboard – Swallern Admin',
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ topic_id?: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect('/login?error=admin_required');

  const { topic_id } = await searchParams;

  return <ReviewDashboard initialTopicId={topic_id} />;
}
