export type ItemType = 'sticker' | 'text'

export interface Sticker {
  id: string
  type: string
  emoji: string
  targetSelector: string
  offsetX: number
  offsetY: number
  createdAt: number
  itemType: ItemType
}

export interface StickerType {
  id: string
  emoji: string
  name: string
}

export interface PhraseOption {
  id: string
  text: string
}

export interface StickerWithAnimation extends Sticker {
  isNew?: boolean
}