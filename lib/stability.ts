/**
 * Stability AI API helper for image inpainting
 */

import sharp from 'sharp'

/**
 * Generate a full-size white RGBA mask matching the input image dimensions
 * @param originalImageBuffer - The original image buffer to match dimensions
 * @returns Buffer containing a white RGBA PNG mask
 */
export async function createFullWhiteMask(
  originalImageBuffer: Buffer
): Promise<Buffer> {
  const image = sharp(originalImageBuffer)
  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('Failed to read image dimensions.')
  }

  // Ensure mask is at least 64x64 pixels
  const width = Math.max(metadata.width, 64)
  const height = Math.max(metadata.height, 64)

  // Create same-size white mask (RGBA)
  const mask = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1.0 },
    },
  })
    .png()
    .toBuffer()

  return mask
}

/**
 * Generate an edited image using Stability AI's inpainting API
 * @param prompt - The text prompt describing the desired changes
 * @param imageBuffer - The input image buffer
 * @returns Buffer containing the generated PNG image
 */
export async function generateWithStability({
  prompt,
  imageBuffer,
}: {
  prompt: string
  imageBuffer: Buffer
}): Promise<Buffer> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('Missing STABILITY_API_KEY')

  console.log('[stability] Starting image generation')
  console.log('[stability] Prompt length:', prompt.length, 'chars')
  console.log('[stability] Image buffer size:', imageBuffer.length, 'bytes')

  // Generate full-size white mask matching input image dimensions
  const maskBuffer = await createFullWhiteMask(imageBuffer)
  console.log('[stability] Mask buffer size:', maskBuffer.length, 'bytes')

  try {
    const form = new FormData()
    form.append('prompt', prompt)
    // Convert Buffer to Uint8Array for Blob compatibility
    form.append('image', new Blob([new Uint8Array(imageBuffer)]), 'image.png')
    form.append('mask', new Blob([new Uint8Array(maskBuffer)]), 'mask.png')

    console.log('[stability] Calling Stability AI API...')

    const response = await fetch(
      'https://api.stability.ai/v2beta/stable-image/edit/inpaint',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
        body: form,
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('[stability] API error response:', err)
      throw new Error(`Stability AI API error: ${response.status} ${err}`)
    }

    const json = await response.json()

    if (json.errors) {
      throw new Error(
        `Stability AI API error: ${JSON.stringify(json.errors)}`
      )
    }

    // output 为 base64 png
    const imageBase64 = json.image
    if (!imageBase64) {
      throw new Error('No image in response from Stability AI')
    }

    const resultBuffer = Buffer.from(imageBase64, 'base64')

    console.log('[stability] Image generation complete')
    console.log('[stability] Result size:', resultBuffer.length, 'bytes')

    return resultBuffer
  } catch (error: any) {
    console.error('[stability] Generation error:', error)
    throw new Error(
      `Stability AI image generation failed: ${error?.message || 'Unknown error'}`
    )
  }
}
