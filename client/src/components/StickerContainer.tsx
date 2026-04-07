import { Sticker } from '../types'

interface StickerContainerProps {
  stickers: Sticker[]
}

export function StickerContainer({ stickers }: StickerContainerProps) {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 2147483646,
  }

  return (
    <div style={containerStyle}>
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {/* StickerItem will be rendered here */}
        </div>
      ))}
    </div>
  )
}