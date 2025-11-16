import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabaseClient'
import { generateWithStability } from '@/lib/stability'
import { fetchAmazonProducts, generateProductKeywords, normalizeAmazonUrl } from '@/lib/amazon'
import { generateTodoList } from '@/lib/todoGenerator'
import { GenerateAfterProductListRequest, GenerateAfterProductListResponse, AmazonItem, TodoItem } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateAfterProductListRequest = await request.json()
    const { before_image_url, prompt, style, budget, size, chat_messages } = body

    if (!before_image_url || !prompt || !style) {
      return NextResponse.json(
        { error: 'before_image_url, prompt, and style are required' },
        { status: 400 }
      )
    }

    if (!process.env.STABILITY_API_KEY) {
      console.error('STABILITY_API_KEY is not set')
      return NextResponse.json(
        { error: 'Stability API key not configured' },
        { status: 500 }
      )
    }

    console.log('Generating final after image with customization:', { prompt, style, budget, size, chat_messages })

    // Download the before image from Supabase
    let beforeImageBuffer: Buffer
    try {
      const imageUrl = new URL(before_image_url)
      const pathParts = imageUrl.pathname.split('/').filter(p => p)
      
      // Supabase storage URL format: /storage/v1/object/public/bucket/path
      const publicIndex = pathParts.indexOf('public')
      if (publicIndex === -1) {
        throw new Error('Invalid Supabase storage URL format')
      }
      
      const bucketName = pathParts[publicIndex + 1]
      const filePath = pathParts.slice(publicIndex + 2).join('/')

      const { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath)

      if (error || !data) {
        throw new Error(`Failed to download image: ${error?.message || 'Unknown error'}`)
      }

      const arrayBuffer = await data.arrayBuffer()
      beforeImageBuffer = Buffer.from(arrayBuffer)
      console.log('Downloaded before image, size:', beforeImageBuffer.length)
    } catch (error) {
      console.error('Error downloading before image:', error)
      return NextResponse.json(
        { error: 'Failed to download before image' },
        { status: 500 }
      )
    }

    // Build the comprehensive prompt combining all user inputs
    const styleTags = style || 'modern'
    
    // Combine chat messages into context
    const chatContext = chat_messages && chat_messages.length > 0
      ? chat_messages.join('. ')
      : ''

    // Build a comprehensive prompt for Stability AI that incorporates:
    // 1. Chat interactions (user preferences from conversation)
    // 2. Style tags (selected hashtag styles)
    // 3. Budget level
    // 4. User's specific vision/prompt
    let stabilityPrompt = `Create a subtle clean-up version of the original desk scene with a WARM, COZY STYLE using LIGHT YELLOW tones.

STRICTLY preserve:
- All objects (laptop, mouse, cables, food items, tray, bottle, cup, notebooks, etc.)
- Desk size, shape, and layout
- Background, lighting direction, and perspective
- The exact scene type (desk workspace)

STYLE REQUIREMENTS - WARM & COZY:
- Apply WARM, COZY aesthetic throughout the scene
- Use LIGHT YELLOW color palette for added items, organizers, and subtle accents
- Create a warm, inviting atmosphere with soft yellow tones
- Add gentle warm lighting that enhances the cozy feeling
- Use light yellow for storage boxes, cable organizers, and small decorative items

Allowed changes:
- Reorganize clutter slightly
- Neatly arrange items
- Add very small storage or cable organizers in LIGHT YELLOW tones
- Clean surfaces
- Improve visual order without modifying the identity of the scene
- Enhance the scene with warm, cozy lighting and light yellow accents

Do NOT add:
- New furniture
- New room decorations
- New shelves, posters, lamps
- Major layout changes
- Any hallucinated objects`

    // Add style context (reinforce warm, cozy, light yellow)
    if (styleTags) {
      stabilityPrompt += `\n\nStyle preference: Apply ${styleTags} aesthetic with WARM, COZY STYLE and LIGHT YELLOW colors to small added items (organizers, storage boxes) - use light yellow tones for a warm, inviting feel.`
    } else {
      // Default to warm, cozy, light yellow if no style tags
      stabilityPrompt += `\n\nDefault style: Apply WARM, COZY STYLE with LIGHT YELLOW color palette to all small added items for a warm, inviting atmosphere.`
    }

    // Add budget context (affects item quality/type of small additions only)
    if (budget) {
      if (budget <= 50) {
        stabilityPrompt += `\nBudget level: Use budget-friendly small items (simple organizers, basic storage boxes).`
      } else if (budget <= 200) {
        stabilityPrompt += `\nBudget level: Use mid-range small items (quality organizers, subtle decorative accents).`
      } else {
        stabilityPrompt += `\nBudget level: Use premium small items (high-quality organizers, stylish minimal decorative pieces).`
      }
    }

    // Add chat context (user preferences from conversation)
    if (chatContext) {
      stabilityPrompt += `\n\nUser preferences: ${chatContext} - apply these preferences with WARM, COZY STYLE and LIGHT YELLOW colors ONLY to small added items, not to existing scene structure.`
    }

    // Add user's specific vision (with constraint reminder)
    if (prompt) {
      stabilityPrompt += `\n\nUser's vision: ${prompt} - while maintaining all original objects and scene structure, and keeping the WARM, COZY STYLE with LIGHT YELLOW tones.`
    }
    
    // Final reinforcement of warm, cozy, light yellow style
    stabilityPrompt += `\n\nREMEMBER: The overall aesthetic must be WARM and COZY with LIGHT YELLOW color accents throughout. Create an inviting, comfortable atmosphere with soft yellow tones.`

    console.log('Calling Stability AI to generate stylish customized image...')
    console.log('Prompt preview:', stabilityPrompt.substring(0, 200) + '...')

    // Generate image using Stability AI inpainting
    let generatedImageBuffer: Buffer
    try {
      generatedImageBuffer = await generateWithStability({
        prompt: stabilityPrompt,
        imageBuffer: beforeImageBuffer,
      })
      console.log('Stability AI generated customized image, size:', generatedImageBuffer.length)
    } catch (error: any) {
      console.error('Stability AI API error:', error)
      return NextResponse.json(
        { error: `Failed to generate image: ${error?.message || 'Unknown error'}` },
        { status: 500 }
      )
    }

    // Upload to Supabase storage (after bucket)
    let publicUrl: string
    try {
      const timestamp = Date.now()
      const filename = `generated-final-${timestamp}.png`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('after')
        .upload(filename, generatedImageBuffer, {
          contentType: 'image/png',
          upsert: false,
        })

      if (uploadError || !uploadData) {
        throw new Error(`Failed to upload to Supabase: ${uploadError?.message || 'Unknown error'}`)
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('after')
        .getPublicUrl(filename)

      publicUrl = urlData.publicUrl
      console.log('Uploaded to Supabase, public URL:', publicUrl)
    } catch (error) {
      console.error('Error uploading to Supabase:', error)
      return NextResponse.json(
        { error: 'Failed to upload image to storage' },
        { status: 500 }
      )
    }

    // Generate TODO list based on before image
    console.log('Generating personalized TODO list...')
    let todoList: TodoItem[] = []
    try {
      todoList = await generateTodoList(beforeImageBuffer)
      console.log(`Generated ${todoList.length} TODO items`)
    } catch (error: any) {
      console.error('Error generating TODO list:', error?.message)
      // Continue with empty TODO list if generation fails
    }

    // Fetch real Amazon products
    console.log('Fetching Amazon products...')
    let amazonItems: AmazonItem[] = []
    try {
      // Extract needs from chat context and prompt
      const needs: string[] = []
      if (chatContext) {
        // Extract keywords from chat
        const chatKeywords = chatContext.toLowerCase()
        if (chatKeywords.includes('lamp') || chatKeywords.includes('light')) needs.push('desk lamp')
        if (chatKeywords.includes('tray') || chatKeywords.includes('organizer')) needs.push('desk tray')
        if (chatKeywords.includes('cable') || chatKeywords.includes('wire')) needs.push('cable organizer')
        if (chatKeywords.includes('storage') || chatKeywords.includes('box')) needs.push('storage box')
      }

      const keywords = generateProductKeywords(styleTags, needs)
      const products = await fetchAmazonProducts(keywords, styleTags, 4)

      // Convert to AmazonItem format - ensure all have images and specific product URLs
      amazonItems = products.map((product, index) => {
        // Normalize URL to specific product page
        const productUrl = normalizeAmazonUrl(product.url)
        
        // Prioritize real Amazon images - only use fallback if absolutely no image
        const imageUrl = product.image && 
                        product.image !== '/no-image.png' && 
                        product.image.trim() !== ''
          ? product.image 
          : '/no-image.png'
        
        // Log if we're using fallback image
        if (imageUrl === '/no-image.png') {
          console.warn(`[generateAfterProductList] Using fallback image for product: ${product.title.substring(0, 50)}`)
        } else {
          console.log(`[generateAfterProductList] Using Amazon image for: ${product.title.substring(0, 50)}`)
        }
        
        return {
          id: `amazon-${index + 1}`,
          title: product.title,
          price: product.price || 'Price not available',
          image_url: imageUrl,
          product_url: productUrl,
        }
      })

      console.log(`Fetched ${amazonItems.length} Amazon products`)
    } catch (error: any) {
      console.error('Error fetching Amazon products:', error?.message)
      // Fallback to empty array if API fails
    }

    // If no products found, use fallback
    if (amazonItems.length === 0) {
      console.warn('No Amazon products found, using fallback items')
      amazonItems = [
        {
          id: '1',
          title: 'Desk Organizer Storage Box',
          price: budget ? `$${Math.floor(budget * 0.1)}.99` : '$24.99',
          image_url: '/no-image.png',
          product_url: 'https://www.amazon.com/s?k=desk+organizer',
        },
        {
          id: '2',
          title: 'Cable Management System',
          price: budget ? `$${Math.floor(budget * 0.05)}.99` : '$12.99',
          image_url: '/no-image.png',
          product_url: 'https://www.amazon.com/s?k=cable+organizer',
        },
        {
          id: '3',
          title: 'Desk Storage Tray',
          price: budget ? `$${Math.floor(budget * 0.08)}.99` : '$18.99',
          image_url: '/no-image.png',
          product_url: 'https://www.amazon.com/s?k=desk+tray',
        },
        {
          id: '4',
          title: 'Storage Box Set',
          price: budget ? `$${Math.floor(budget * 0.06)}.99` : '$15.99',
          image_url: '/no-image.png',
          product_url: 'https://www.amazon.com/s?k=storage+box',
        },
      ]
    }

    const response: GenerateAfterProductListResponse = {
      final_after_image_url: publicUrl,
      amazon_items: amazonItems,
      todo_list: todoList,
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Generate after product list error:', error)
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
