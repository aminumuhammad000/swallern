import { getAdminUser } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';
import { TopicEditor } from '../TopicEditor';

export const metadata = {
  title: 'Edit Topic – Swallern Admin',
};

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getAdminUser();
  if (!admin) redirect('/login?error=admin_required');

  const { id } = await params;

  return <TopicEditor topicId={id} />;
}
