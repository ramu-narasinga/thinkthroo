import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { SlackNotifier } from '@/lib/slack'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/patterns-library'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const github = user.user_metadata?.user_name || user.user_metadata?.preferred_username || 'unknown'
        const email = user.email ?? 'unknown'
        await SlackNotifier.newLogin(github, email)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}