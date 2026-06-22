import { redirect } from 'next/navigation'

export default async function HomePage({ searchParams }: { searchParams?: Promise<{ signup?: string }> }) {
  const params = await searchParams
  if (params?.signup === 'success') {
    redirect('/skills-library?signup=success')
  }
  redirect('/skills-library')
}
