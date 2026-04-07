import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { StickerPanel } from './StickerPanel'
import { StickerItem } from './StickerItem'
import { Sticker, StickerType, ItemType } from '../types'
import { generateUniqueSelector } from '../utils/domSelector'
import { fetchStickers, createSticker } from '../utils/api'
import { initSocket, joinRoom, onNewSticker, offNewSticker, NewStickerEvent } from '../utils/socket'
import { takeScreenshot } from '../utils/screenshot'
import { playSound } from '../utils/audio'

const DEFAULT_STICKERS: StickerType[] = [
  { id: '1', emoji: '🍅', name: '番茄' },
  { id: '2', emoji: '🐶', name: '狗头' },
  { id: '3', emoji: '🤡', name: '小丑' },
  { id: '4', emoji: '👍', name: '点赞' },
  { id: '5', emoji: '❤️', name: '爱心' },
  { id: '6', emoji: '🔥', name: '火焰' },
]

interface AppProps {
  stickerContainer: HTMLElement
}

interface LocalSticker extends Sticker {
  isNew?: boolean;
}

export function App({ stickerContainer }: AppProps) {
  const [stickers, setStickers] = useState<LocalSticker[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [pendingText, setPendingText] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('webparty-muted')
    return saved === 'true'
  })
  const [isCooldown, setIsCooldown] = useState(false)
  const [lastPlaceTime, setLastPlaceTime] = useState(0)

  const MAX_STICKERS = 150
  const COOLDOWN_TIME = 2000 // 2秒

  // 加载历史贴纸并初始化 WebSocket
  useEffect(() => {
    const init = async () => {
      setIsLoading(true)

      // 加载历史贴纸
      const apiStickers = await fetchStickers()
      const localStickers: LocalSticker[] = apiStickers.map(s => ({
        id: s.id.toString(),
        type: s.sticker_type,
        emoji: s.sticker_type,
        targetSelector: s.target_selector,
        offsetX: s.offset_x,
        offsetY: s.offset_y,
        createdAt: s.created_at,
        itemType: (s.item_type === 'text' ? 'text' : 'sticker') as ItemType,
        isNew: false,
      }))

      // 应用 FIFO 上限
      const limitedStickers = localStickers.slice(0, MAX_STICKERS)
      setStickers(limitedStickers)
      setIsLoading(false)

      // 初始化 WebSocket
      initSocket()
      await joinRoom(window.location.href)

      // 监听新贴纸事件
      const handleNewSticker = (data: NewStickerEvent & { itemType?: string }) => {
        console.log('🎉 Received new sticker from another user:', data)

        const itemType = (data.itemType === 'text' ? 'text' : 'sticker') as ItemType

        // 播放音效
        playSound(itemType)

        const newSticker: LocalSticker = {
          id: data.id.toString(),
          type: data.stickerType,
          emoji: data.stickerType,
          targetSelector: data.targetSelector,
          offsetX: data.offsetX,
          offsetY: data.offsetY,
          createdAt: data.createdAt,
          itemType: itemType,
          isNew: true,
        }

        // 只应用 FIFO，不检查冷却时间
        setStickers((prev) => {
          let updated = [...prev, newSticker]
          if (updated.length > MAX_STICKERS) {
            updated = updated.slice(-MAX_STICKERS)
          }
          return updated
        })

        // 300ms 后移除 isNew 标记
        setTimeout(() => {
          setStickers((prev) =>
            prev.map((s) => (s.id === newSticker.id ? { ...s, isNew: false } : s))
          )
        }, 300)
      }

      onNewSticker(handleNewSticker)

      return () => {
        offNewSticker(handleNewSticker)
      }
    }

    init()
  }, [])

  const handleDragStart = useCallback((_sticker: StickerType) => {
    setIsDragging(true)
  }, [])

  const handleTextPlace = useCallback((text: string) => {
    setIsSelectMode(true)
    setPendingText(text)
  }, [])

  const handleToggleVisibility = useCallback(() => {
    setIsVisible((prev) => !prev)
  }, [])

  const handleClearAll = useCallback(() => {
    setStickers([])
  }, [])

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev
      localStorage.setItem('webparty-muted', String(newValue))
      return newValue
    })
  }, [])

  const handleScreenshot = useCallback(() => {
    takeScreenshot()
  }, [])

  // 添加贴纸（带 FIFO 和冷却检查）
  const addSticker = useCallback((newSticker: Sticker): boolean => {
    const now = Date.now()

    // 检查冷却时间
    if (now - lastPlaceTime < COOLDOWN_TIME) {
      setIsCooldown(true)
      setTimeout(() => setIsCooldown(false), 500)
      return false
    }

    // 添加贴纸并检查上限
    setStickers((prev) => {
      let updated = [...prev, { ...newSticker, isNew: true }]

      // FIFO: 如果超过上限，移除最早的贴纸
      if (updated.length > MAX_STICKERS) {
        updated = updated.slice(-MAX_STICKERS)
      }

      return updated
    })

    setLastPlaceTime(now)

    // 300ms 后移除 isNew 标记
    setTimeout(() => {
      setStickers((prev) =>
        prev.map((s) => (s.id === newSticker.id ? { ...s, isNew: false } : s))
      )
    }, 300)

    return true
  }, [lastPlaceTime])

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const stickerData = e.dataTransfer?.getData('sticker')
      if (!stickerData || !e.clientX || !e.clientY) return

      const stickerType: StickerType = JSON.parse(stickerData)

      // 获取鼠标位置下的目标元素
      const targetElement = document.elementFromPoint(e.clientX, e.clientY)
      if (!targetElement) return

      // 生成目标元素的唯一选择器
      const targetSelector = generateUniqueSelector(targetElement)

      // 计算相对偏移量
      const rect = targetElement.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      // 保存到后端
      const apiSticker = await createSticker({
        stickerType: stickerType.emoji,
        targetSelector,
        offsetX,
        offsetY,
        itemType: 'sticker',
      })

      if (apiSticker) {
        // 创建新贴纸
        const newSticker: Sticker = {
          id: apiSticker.id.toString(),
          type: apiSticker.sticker_type,
          emoji: apiSticker.sticker_type,
          targetSelector: apiSticker.target_selector,
          offsetX: apiSticker.offset_x,
          offsetY: apiSticker.offset_y,
          createdAt: apiSticker.created_at,
          itemType: 'sticker',
        }

        // 播放音效
        playSound('sticker', stickerType.id)

        addSticker(newSticker)
      }
    }

    const handleDragEnd = () => {
      setIsDragging(false)
    }

    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)
    document.addEventListener('dragend', handleDragEnd)

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
      document.removeEventListener('dragend', handleDragEnd)
    }
  }, [])

  // 处理文本选择模式的点击事件
  useEffect(() => {
    if (!isSelectMode) return

    const handleClick = async (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsSelectMode(false)

      if (!pendingText || !e.clientX || !e.clientY) return

      // 获取点击位置下的目标元素
      const targetElement = document.elementFromPoint(e.clientX, e.clientY)
      if (!targetElement) return

      // 生成目标元素的唯一选择器
      const targetSelector = generateUniqueSelector(targetElement)

      // 计算相对偏移量
      const rect = targetElement.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      // 保存到后端
      const apiSticker = await createSticker({
        stickerType: pendingText,
        targetSelector,
        offsetX,
        offsetY,
        itemType: 'text',
      })

      if (apiSticker) {
        // 创建新贴纸
        const newSticker: Sticker = {
          id: apiSticker.id.toString(),
          type: apiSticker.sticker_type,
          emoji: apiSticker.sticker_type,
          targetSelector: apiSticker.target_selector,
          offsetX: apiSticker.offset_x,
          offsetY: apiSticker.offset_y,
          createdAt: apiSticker.created_at,
          itemType: 'text',
        }

        // 播放音效
        playSound('text')

        if (addSticker(newSticker)) {
          setPendingText(null)
        }
      }
    }

    document.addEventListener('click', handleClick, true)

    return () => {
      document.removeEventListener('click', handleClick, true)
    }
  }, [isSelectMode, pendingText, addSticker])

  return (
    <>
      {/* 贴纸面板 */}
      <StickerPanel
        stickers={DEFAULT_STICKERS}
        onDragStart={handleDragStart}
        onTextPlace={handleTextPlace}
        onToggleVisibility={handleToggleVisibility}
        onClearAll={handleClearAll}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isVisible={isVisible}
        onScreenshot={handleScreenshot}
      />

      {/* 渲染所有已放置的贴纸（使用 Portal 渲染到 body） */}
      {createPortal(
        <>
          {isLoading && (
            <div
              style={{
                position: 'fixed',
                top: '16px',
                right: '16px',
                backgroundColor: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontSize: '14px',
                color: '#6b7280',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                zIndex: 2147483647,
              }}
            >
              加载中...
            </div>
          )}

          {isCooldown && (
            <div
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(239, 68, 68, 0.95)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                zIndex: 2147483647,
                pointerEvents: 'none',
                animation: 'fadeInOut 0.5s ease-in-out',
              }}
            >
              冷却中...
            </div>
          )}

          {isVisible && stickers.map((sticker) => (
            <StickerItem key={sticker.id} sticker={sticker} isNew={sticker.isNew} />
          ))}

          {/* 拖拽提示遮罩 */}
          {isDragging && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 2147483645,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(59, 130, 246, 0.05)',
                fontSize: '24px',
                color: '#3b82f6',
                fontWeight: '600',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              拖拽贴纸到网页任意位置
            </div>
          )}

          {/* 选择模式提示 */}
          {isSelectMode && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 2147483645,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(251, 191, 36, 0.05)',
                fontSize: '24px',
                color: '#f59e0b',
                fontWeight: '600',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                cursor: 'crosshair',
              }}
            >
              点击网页任意位置放置文字
            </div>
          )}
        </>,
        stickerContainer
      )}
    </>
  )
}