import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return new Response('Unauthorized', { status: 401 })

  // Fetch from your public.users table
  const { data: appUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', user.email)
    .single()

  if (userError || !appUser)
    return new Response('User not found', { status: 404 })

  const { data: installation, error: installError } = await supabase
    .from('user_installations')
    .select('*')
    .eq('user_id', appUser.id)
    .single()

  if (installError)
    return new Response('Installation not found', { status: 404 })

  return Response.json({ installation })
}