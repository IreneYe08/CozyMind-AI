import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { AmazonItem } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      before_image,
      after_image,
      prompt,
      style,
      budget,
      size,
      items,
    } = body

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!before_image || !after_image || !prompt || !style) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert into results table
    const { data, error } = await supabase
      .from('results')
      .insert({
        user_id: session.user.id,
        before_image,
        after_image,
        prompt,
        style,
        budget: budget || null,
        size: size || null,
        items: items || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save result' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error('Save result error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

