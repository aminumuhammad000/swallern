import { getAdminUser } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';
import { TopicsList } from './TopicsList';

export const metadata = {
  title: 'Manage Topics – Swallern Admin',
};

export default async function AdminTopicsPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/login?error=admin_required');

  return <TopicsList />;
}
