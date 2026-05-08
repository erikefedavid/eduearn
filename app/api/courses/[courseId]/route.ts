import { NextResponse } from 'next/server'
import { createClient, supabaseAdmin } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select(`
        *,
        profiles:instructor_id(full_name, avatar_url),
        chapters(*)
      `)
      .eq('id', courseId)
      .order('position', { foreignTable: 'chapters', ascending: true })
      .single()

    if (error || !course) {
      return new NextResponse('Not found', { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('[COURSE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    
    // Check if user owns the course
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()
      
    if (course?.instructor_id !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { data: updatedCourse, error } = await supabaseAdmin
      .from('courses')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .select()
      .single()

    if (error) {
      return new NextResponse('Internal Error', { status: 500 })
    }

    return NextResponse.json(updatedCourse)
  } catch (error) {
    console.error('[COURSE_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
    
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()
      
    if (course?.instructor_id !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) {
      return new NextResponse('Internal Error', { status: 500 })
    }

    return new NextResponse('Deleted', { status: 200 })
  } catch (error) {
    console.error('[COURSE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
