import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { generateWithStability } from '@/lib/stability'
import { GenerateInitialAfterRequest, GenerateInitialAfterResponse } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateInitialAfterRequest = await request.json()
    const { before_image_url } = body

    console.log('[generateInitialAfter] ===== Starting request =====')
    console.log('[generateInitialAfter] Request body:', { before_image_url })

    // Validation
    if (!before_image_url) {
      console.error('[generateInitialAfter] Missing before_image_url')
      return NextResponse.json({ error: 'before_image_url is required' }, { status: 400 })
    }

    if (!process.env.STABILITY_API_KEY) {
      console.error('[generateInitialAfter] STABILITY_API_KEY missing')
      return NextResponse.json({ error: 'Stability API key not configured' }, { status: 500 })
    }

    // ------------------------------------------------------------
    // Step 1: Download BEFORE image from Supabase
    // ------------------------------------------------------------
    console.log('[generateInitialAfter] Step 1: Downloading before image from Supabase...')
    let beforeImageBuffer: Buffer

    try {
      const url = new URL(before_image_url)
      const parts = url.pathname.split('/').filter(Boolean)

      const publicIndex = parts.indexOf('public')
      if (publicIndex === -1) {
        throw new Error('Invalid Supabase public URL format - missing "public" in path')
      }

      const bucket = parts[publicIndex + 1]
      const filePath = parts.slice(publicIndex + 2).join('/')

      console.log(`[generateInitialAfter] Parsed URL - bucket: ${bucket}, filePath: ${filePath}`)

      const { data, error } = await supabase.storage.from(bucket).download(filePath)
      if (error || !data) {
        throw new Error(error?.message || 'Failed to download image from Supabase')
      }

      beforeImageBuffer = Buffer.from(await data.arrayBuffer())

      console.log(`[generateInitialAfter] ✓ Downloaded before image`)
      console.log(`[generateInitialAfter]   - Buffer size: ${beforeImageBuffer.length} bytes`)
    } catch (err: any) {
      console.error('[generateInitialAfter] ✗ Download error:', err)
      console.error('[generateInitialAfter] Error details:', {
        message: err?.message,
        stack: err?.stack,
      })
      return NextResponse.json(
        { error: `Failed to download before image: ${err?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // ------------------------------------------------------------
    // Step 2: Build STRICT prompt for subtle desk cleanup
    // ------------------------------------------------------------
    console.log('[generateInitialAfter] Step 2: Building strict subtle-edit prompt...')

    const subtlePrompt = `Create a subtle clean-up version of the original desk scene.

STRICTLY preserve:
- All objects (laptop, mouse, cables, food items, tray, bottle, cup, notebooks, etc.)
- Desk size, shape, and layout
- Background, lighting direction, and perspective
- The exact scene type (desk workspace)

Allowed changes:
- Reorganize clutter slightly
- Neatly arrange items
- Add very small storage or cable organizers
- Clean surfaces
- Improve visual order without modifying the identity of the scene

Do NOT add:
- New furniture
- New room decorations
- New shelves, posters, lamps
- Major layout changes
- Any hallucinated objects`

    console.log(`[generateInitialAfter] ✓ Prompt built (${subtlePrompt.length} chars)`)

    // ------------------------------------------------------------
    // Step 3: Generate after image with Stability AI inpainting
    // ------------------------------------------------------------
    console.log('[generateInitialAfter] Step 3: Generating image with Stability AI...')
    let generatedImageBuffer: Buffer

    try {
      generatedImageBuffer = await generateWithStability({
        prompt: subtlePrompt,
        imageBuffer: beforeImageBuffer,
      })

      if (!generatedImageBuffer || generatedImageBuffer.length === 0) {
        throw new Error('No image returned from Stability AI')
      }

      console.log(`[generateInitialAfter] ✓ Image generated successfully`)
      console.log(`[generateInitialAfter]   - Generated image size: ${generatedImageBuffer.length} bytes`)
    } catch (err: any) {
      console.error('[generateInitialAfter] ✗ Image generation error:', err)
      console.error('[generateInitialAfter] Error details:', {
        message: err?.message,
        stack: err?.stack,
        status: err?.status,
      })

      return NextResponse.json(
        { error: `Image generation failed: ${err?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // ------------------------------------------------------------
    // Step 4: Upload final PNG to Supabase /after bucket
    // ------------------------------------------------------------
    console.log('[generateInitialAfter] Step 4: Uploading to Supabase...')
    let publicUrl: string

    try {
      const filename = `generated-${Date.now()}.png`

      console.log(`[generateInitialAfter] Uploading to bucket 'after' as ${filename}...`)

      const { data, error } = await supabase.storage
        .from('after')
        .upload(filename, generatedImageBuffer, {
          contentType: 'image/png',
          upsert: false,
        })

      if (error || !data) {
        throw new Error(error?.message || 'Upload failed')
      }

      const { data: urlData } = supabase.storage.from('after').getPublicUrl(filename)
      publicUrl = urlData.publicUrl

      console.log(`[generateInitialAfter] ✓ Upload complete`)
      console.log(`[generateInitialAfter]   - Public URL: ${publicUrl}`)
    } catch (err: any) {
      console.error('[generateInitialAfter] ✗ Upload error:', err)
      console.error('[generateInitialAfter] Error details:', {
        message: err?.message,
        stack: err?.stack,
      })
      return NextResponse.json(
        { error: `Failed to upload image: ${err?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // ------------------------------------------------------------
    // Step 5: Return response
    // ------------------------------------------------------------
    const response: GenerateInitialAfterResponse = {
      after_image_url: publicUrl,
    }

    console.log('[generateInitialAfter] ===== Successfully completed =====')
    console.log('[generateInitialAfter] Returning response:', response)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[generateInitialAfter] ===== Unexpected error =====')
    console.error('[generateInitialAfter] Error:', error)
    console.error('[generateInitialAfter] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    })
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
