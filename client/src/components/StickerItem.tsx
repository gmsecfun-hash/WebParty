import { useEffect, useRef, useState } from 'react'
import { Sticker } from '../types'
import { findElementBySelector, getElementOffset } from '../utils/domSelector'

interface StickerItemProps {
  sticker: Sticker
  isNew?: boolean
}

export function StickerItem({ sticker, isNew = false }: StickerItemProps) {
  const stickerRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  const updatePosition = () => {
    const targetElement = findElementBySelector(sticker.targetSelector)
    if (targetElement) {
      const offset = getElementOffset(targetElement)
      setPosition({
        top: offset.top + sticker.offsetY,
        left: offset.left + sticker.offsetX,
      })
    }
  }

  useEffect(() => {
    updatePosition()

    // 监听滚动和窗口大小变化
    const handleScroll = () => updatePosition()
    const handleResize = () => updatePosition()

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [sticker])

  // 贴纸样式
  const stickerStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    fontSize: '48px',
    zIndex: 2147483646,
    pointerEvents: 'none',
    userSelect: 'none',
    transition: 'top 0.1s, left 0.1s',
    animation: isNew ? 'popUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
  }

  // 文本气泡样式
  const textStyle: React.CSSProperties = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    padding: '8px 16px',
    backgroundColor: 'rgba(251, 191, 36, 0.95)',
    color: '#1f2937',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    whiteSpace: 'nowrap',
    zIndex: 2147483646,
    pointerEvents: 'none',
    userSelect: 'none',
    transition: 'top 0.1s, left 0.1s',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    animation: isNew ? 'popUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'none',
  }

  return (
    <div
      ref={stickerRef}
      style={sticker.itemType === 'text' ? textStyle : stickerStyle}
    >
      {sticker.emoji}
    </div>
  )
}