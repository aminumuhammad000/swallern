import { getAdminUser } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';
import { TopicEditor } from '../TopicEditor';

export const metadata = {
  title: 'New Topic – Swallern Admin',
};

export default async function NewTopicPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/login?error=admin_required');

  return <TopicEditor topicId={null} />;
}
