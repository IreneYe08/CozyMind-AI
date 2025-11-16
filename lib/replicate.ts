import Replicate from 'replicate'

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('REPLICATE_API_TOKEN is not set in environment variables')
}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

export const REPLICATE_MODEL = 'lucataco/realistic-vision-v5'

/**
 * Generate an image using Replicate's realistic-vision-v5 model
 * @param prompt - The text prompt for image generation
 * @param imageBase64 - The base64-encoded input image for image-to-image generation
 * @returns The URL of the generated image
 */
export async function generateImage(
  prompt: string,
  imageBase64: string
): Promise<string> {
  try {
    console.log('[replicate] Starting image generation with model:', REPLICATE_MODEL)
    console.log('[replicate] Prompt length:', prompt.length, 'chars')
    console.log('[replicate] Image base64 length:', imageBase64.length, 'chars')

    // Use replicate.run() which handles polling automatically
    const output = await replicate.run(REPLICATE_MODEL, {
      input: {
        prompt,
        image: `data:image/jpeg;base64,${imageBase64}`,
        strength: 0.35, // Low strength to preserve original layout
        guidance_scale: 3, // Low guidance for subtle changes
      },
    })

    console.log('[replicate] Generation complete, output type:', typeof output)
    console.log('[replicate] Output:', output)

    // Output can be a string URL or array of URLs
    const imageUrl = Array.isArray(output) ? output[0] : output

    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Replicate returned invalid image URL')
    }

    console.log('[replicate] Image generation complete:', imageUrl)
    return imageUrl
  } catch (error: any) {
    console.error('[replicate] Generation error:', error)
    
    // Handle 404 specifically
    if (error?.status === 404 || error?.message?.includes('404') || error?.message?.includes('not found')) {
      throw new Error(`Replicate model not found (404): ${REPLICATE_MODEL}. Please verify the model ID is correct.`)
    }
    
    throw new Error(`Replicate image generation failed: ${error?.message || 'Unknown error'}`)
  }
}
