export type ItemType = 'sticker' | 'text'

export interface Sticker {
  id: number
  url_hash: string
  sticker_type: string
  target_selector: string
  offset_x: number
  offset_y: number
  created_at: number
  item_type: ItemType
}

export interface CreateStickerRequest {
  urlHash: string
  stickerType: string
  targetSelector: string
  offsetX: number
  offsetY: number
  itemType?: ItemType
}