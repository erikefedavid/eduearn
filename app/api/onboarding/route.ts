import { NextResponse } from 'next/server'
import { createClient, supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { role } = await req.json()

    if (!role || !['learner', 'instructor'].includes(role)) {
      return new NextResponse('Invalid role', { status: 400 })
    }

    // Update or create profile
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id, // Supabase Auth UID
        full_name: user.user_metadata.full_name || 'User',
        email: user.email,
        role: role,
        avatar_url: user.user_metadata.avatar_url || null,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      console.error('[ONBOARDING_POST]', error)
      return new NextResponse('Internal Error', { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ONBOARDING_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
