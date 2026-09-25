import { getAdminUser } from '@/lib/admin/auth';
import { redirect } from 'next/navigation';
import { AdminDashboard } from './AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard – Swallern',
};

export default async function AdminPage() {
  const admin = await getAdminUser();
  if (!admin) redirect('/login?error=admin_required');

  return <AdminDashboard adminEmail={admin.email} />;
}
