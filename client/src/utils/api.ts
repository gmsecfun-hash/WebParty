const API_BASE_URL = 'https://webpart.gmsec.fun/api'

// 清洗 URL 并生成哈希
export async function cleanAndHashUrl(url: string): Promise<string> {
  try {
    const urlObj = new URL(url)
    // 只保留 domain + path，去掉 hash 和查询参数
    const cleanUrl = `${urlObj.origin}${urlObj.pathname}`

    // 使用 SubtleCrypto API 生成 SHA-256 哈希
    const encoder = new TextEncoder()
    const data = encoder.encode(cleanUrl)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    return hashHex
  } catch (e) {
    console.error('Error hashing URL:', e)
    return ''
  }
}

export interface ApiSticker {
  id: number
  url_hash: string
  sticker_type: string
  target_selector: string
  offset_x: number
  offset_y: number
  created_at: number
  item_type?: 'sticker' | 'text'
}

export interface FetchStickersResponse {
  stickers: ApiSticker[]
}

export interface CreateStickerResponse {
  sticker: ApiSticker
}

// 获取当前网页的历史贴纸
export async function fetchStickers(): Promise<ApiSticker[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/stickers?url=${encodeURIComponent(window.location.href)}`)
    const data: FetchStickersResponse = await response.json()
    return data.stickers
  } catch (error) {
    console.error('Error fetching stickers:', error)
    return []
  }
}

// 创建新贴纸
export async function createSticker(sticker: {
  stickerType: string
  targetSelector: string
  offsetX: number
  offsetY: number
  itemType: 'sticker' | 'text'
}): Promise<ApiSticker | null> {
  try {
    const urlHash = await cleanAndHashUrl(window.location.href)
    const response = await fetch(`${API_BASE_URL}/stickers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urlHash,
        stickerType: sticker.stickerType,
        targetSelector: sticker.targetSelector,
        offsetX: sticker.offsetX,
        offsetY: sticker.offsetY,
        itemType: sticker.itemType,
      }),
    })
    const data: CreateStickerResponse = await response.json()
    return data.sticker
  } catch (error) {
    console.error('Error creating sticker:', error)
    return null
  }
}