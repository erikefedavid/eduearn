import { NextResponse } from 'next/server'
import { createClient, supabaseAdmin } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const courseId = formData.get('courseId') as string
    const chapterId = formData.get('chapterId') as string

    if (!file || !courseId || !chapterId) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Verify instructor role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'instructor') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify course ownership
    const { data: course } = await supabaseAdmin
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    if (course?.instructor_id !== user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `courses/${courseId}/${chapterId}/file_${Date.now()}.${fileExt}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin
      .storage
      .from('course-content')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('[UPLOAD_ERROR]', uploadError)
      return new NextResponse('Failed to upload file', { status: 500 })
    }

    return NextResponse.json({ url: filePath })
  } catch (error) {
    console.error('[API_UPLOAD]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
