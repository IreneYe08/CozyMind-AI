/**
 * Amazon Product Search Helper
 * Uses RapidAPI Amazon24 API
 */

export interface AmazonProduct {
  title: string
  image: string
  url: string
  price?: string
}

/**
 * Fetch Amazon products based on keywords
 * @param keywords - Array of search keywords
 * @param style - Style preference (cozy, minimalist, etc.)
 * @param limit - Maximum number of products to return (default: 4)
 * @returns Array of Amazon products
 */
export async function fetchAmazonProducts(
  keywords: string[],
  style?: string,
  limit: number = 4
): Promise<AmazonProduct[]> {
  const apiKey = process.env.RAPIDAPI_KEY
  if (!apiKey) {
    console.warn('[amazon] RAPIDAPI_KEY not set, returning empty array')
    return []
  }

  try {
    // Combine keywords with style if provided
    const searchTerms = style
      ? [...keywords, style].join(' ')
      : keywords.join(' ')

    console.log('[amazon] Searching for products:', searchTerms)

    // Use RapidAPI Amazon24 endpoint
    const response = await fetch(
      `https://amazon24.p.rapidapi.com/api/product/search?keyword=${encodeURIComponent(searchTerms)}&country=US&page=1`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': apiKey,
          'X-RapidAPI-Host': 'amazon24.p.rapidapi.com',
        },
      }
    )

    if (!response.ok) {
      console.error('[amazon] API error:', response.status, response.statusText)
      return []
    }

    const data = await response.json()

    // Parse response based on API structure
    // Note: API structure may vary, adjust based on actual response
    const products: AmazonProduct[] = []

    if (data.docs && Array.isArray(data.docs)) {
      // Extract products from response
      for (const item of data.docs.slice(0, limit)) {
        if (item.product_title) {
          // Prioritize real Amazon image URLs - check multiple possible fields
          const imageUrl = item.product_main_image_url || 
                          item.product_image_url ||
                          item.product_image || 
                          item.main_image_url ||
                          item.image_url ||
                          item.image ||
                          item.thumbnail_url ||
                          item.thumbnail ||
                          null
          
          // Only use fallback if no Amazon image found
          if (!imageUrl || imageUrl === '/no-image.png') {
            console.warn(`[amazon] No image URL found for product: ${item.product_title}`)
          } else {
            console.log(`[amazon] Found Amazon image for: ${item.product_title.substring(0, 50)}`)
          }
          
          // Extract ASIN or product_id for specific product URL
          const asin = item.product_id || item.asin || item.product_asin
          const rawUrl = item.product_detail_url || item.product_url
          const productUrl = normalizeAmazonUrl(rawUrl || '', asin)
          
          products.push({
            title: item.product_title,
            image: imageUrl || '/no-image.png',
            url: productUrl || `https://www.amazon.com/s?k=${encodeURIComponent(item.product_title)}`,
            price: item.app_sale_price || item.app_sale_price_currency || item.price || undefined,
          })
        }
      }
    } else if (data.products && Array.isArray(data.products)) {
      // Alternative response structure
      for (const item of data.products.slice(0, limit)) {
        if (item.title) {
          // Prioritize real Amazon image URLs
          const imageUrl = item.image || 
                          item.image_url || 
                          item.product_image ||
                          item.main_image ||
                          item.thumbnail_url ||
                          item.thumbnail ||
                          null
          
          if (!imageUrl || imageUrl === '/no-image.png') {
            console.warn(`[amazon] No image URL found for product: ${item.title}`)
          } else {
            console.log(`[amazon] Found Amazon image for: ${item.title.substring(0, 50)}`)
          }
          
          // Extract ASIN for specific product URL
          const asin = item.asin || item.product_asin || item.product_id
          const rawUrl = item.url || item.link || item.product_url
          const productUrl = normalizeAmazonUrl(rawUrl || '', asin)
          
          products.push({
            title: item.title,
            image: imageUrl || '/no-image.png',
            url: productUrl || `https://www.amazon.com/s?k=${encodeURIComponent(item.title)}`,
            price: item.price || item.price_formatted || undefined,
          })
        }
      }
    } else if (data.results && Array.isArray(data.results)) {
      // Another possible response structure
      for (const item of data.results.slice(0, limit)) {
        if (item.title || item.name) {
          // Prioritize real Amazon image URLs
          const imageUrl = item.image || 
                          item.imageUrl || 
                          item.image_url ||
                          item.product_image ||
                          item.thumbnail || 
                          item.thumbnail_url ||
                          null
          
          if (!imageUrl || imageUrl === '/no-image.png') {
            console.warn(`[amazon] No image URL found for product: ${item.title || item.name}`)
          } else {
            console.log(`[amazon] Found Amazon image for: ${(item.title || item.name).substring(0, 50)}`)
          }
          
          // Extract ASIN for specific product URL
          const asin = item.asin || item.product_asin || item.product_id
          const rawUrl = item.url || item.link
          const productUrl = normalizeAmazonUrl(rawUrl || '', asin)
          
          products.push({
            title: item.title || item.name,
            image: imageUrl || '/no-image.png',
            url: productUrl || `https://www.amazon.com/s?k=${encodeURIComponent(item.title || item.name)}`,
            price: item.price || item.priceFormatted || undefined,
          })
        }
      }
    }
    
    // Log summary of image sources
    const amazonImages = products.filter(p => p.image && p.image !== '/no-image.png' && p.image.includes('amazon'))
    console.log(`[amazon] ${amazonImages.length}/${products.length} products have Amazon images`)

    console.log(`[amazon] Found ${products.length} products`)
    return products
  } catch (error: any) {
    console.error('[amazon] Error fetching products:', error?.message)
    return []
  }
}

/**
 * Normalize Amazon URL to specific product page (amazon.com/dp/ASIN)
 * @param url - Original product URL
 * @param asin - Optional ASIN if available
 * @returns Normalized product URL
 */
export function normalizeAmazonUrl(url: string, asin?: string): string {
  // If we have an ASIN, create direct product URL
  if (asin) {
    return `https://www.amazon.com/dp/${asin}`
  }
  
  // Try to extract ASIN from URL
  const asinPatterns = [
    /\/dp\/([A-Z0-9]{10})/i,
    /\/gp\/product\/([A-Z0-9]{10})/i,
    /[?&]asin=([A-Z0-9]{10})/i,
    /\/product\/([A-Z0-9]{10})/i,
  ]
  
  for (const pattern of asinPatterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return `https://www.amazon.com/dp/${match[1]}`
    }
  }
  
  // If URL already looks like a product page, return as-is
  if (url.includes('/dp/') || url.includes('/gp/product/')) {
    return url
  }
  
  // Otherwise return original URL (might be a search page)
  return url
}

/**
 * Generate product keywords based on style and needs
 */
export function generateProductKeywords(style: string, needs: string[]): string[] {
  const baseKeywords = ['desk organizer', 'storage box', 'cable organizer']
  
  // Add style-specific keywords
  const styleKeywords: Record<string, string[]> = {
    warm: ['warm desk lamp', 'wooden organizer'],
    cozy: ['cozy desk accessories', 'soft storage'],
    minimalist: ['minimalist organizer', 'simple storage'],
    modern: ['modern desk organizer', 'contemporary storage'],
    scandinavian: ['scandinavian organizer', 'nordic storage'],
    natural: ['bamboo organizer', 'natural storage'],
    organized: ['desk organizer', 'storage solution'],
  }

  const keywords = [...baseKeywords, ...needs]
  if (styleKeywords[style.toLowerCase()]) {
    keywords.push(...styleKeywords[style.toLowerCase()])
  }

  return keywords
}

