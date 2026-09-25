import { redirect } from 'next/navigation';

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const queryString = qs.toString();
  redirect(queryString ? `/explore?${queryString}` : '/explore');
}
