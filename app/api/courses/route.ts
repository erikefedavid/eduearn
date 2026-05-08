import { NextResponse } from 'next/server'
import { createClient, supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { title, description, category, price, thumbnail_url } = body

    if (!title) {
      return new NextResponse('Title is required', { status: 400 })
    }

    // Get profile to check role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'instructor') {
      return new NextResponse('Only instructors can create courses', { status: 403 })
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert({
        instructor_id: user.id,
        title,
        description,
        category,
        price,
        thumbnail_url,
        is_published: false
      })
      .select()
      .single()

    if (error) {
      console.error('[COURSES_POST] Supabase Error:', error)
      return new NextResponse('Internal Error', { status: 500 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('[COURSES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*, profiles(full_name, avatar_url)')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) {
      return new NextResponse('Internal Error', { status: 500 })
    }

    return NextResponse.json(courses)
  } catch (error) {
    console.error('[COURSES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
