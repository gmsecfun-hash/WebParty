import { useState, useRef, useEffect } from 'react'
import { StickerType, PhraseOption } from '../types'

interface StickerPanelProps {
  stickers: StickerType[]
  onDragStart: (sticker: StickerType) => void
  onTextPlace: (text: string) => void
  onToggleVisibility: () => void
  onClearAll: () => void
  isMuted: boolean
  onToggleMute: () => void
  isVisible: boolean
  onScreenshot: () => void
}

const PHRASE_OPTIONS_A: PhraseOption[] = [
  { id: '1', text: '前方' },
  { id: '2', text: '这篇文章' },
  { id: '3', text: '这个按钮' },
  { id: '4', text: '这里' },
  { id: '5', text: '这段代码' },
  { id: '6', text: '这个设计' },
]

const PHRASE_OPTIONS_B: PhraseOption[] = [
  { id: '1', text: '有干货' },
  { id: '2', text: '是陷阱' },
  { id: '3', text: '太水了' },
  { id: '4', text: '敬请见证' },
  { id: '5', text: '值得收藏' },
  { id: '6', text: '需要优化' },
]

type TabType = 'sticker' | 'text'

export function StickerPanel({
  stickers,
  onDragStart,
  onTextPlace,
  onToggleVisibility,
  onClearAll,
  isMuted,
  onToggleMute,
  isVisible,
  onScreenshot,
}: StickerPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('sticker')
  const [selectedPhraseA, setSelectedPhraseA] = useState<string>(PHRASE_OPTIONS_A[0].text)
  const [selectedPhraseB, setSelectedPhraseB] = useState<string>(PHRASE_OPTIONS_B[0].text)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem('webparty-panel-position')
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 260, y: window.innerHeight - 400 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number; isMinimizedButton: boolean; hasMoved: boolean } | null>(null)

  // 保存位置到 localStorage
  useEffect(() => {
    localStorage.setItem('webparty-panel-position', JSON.stringify(position))
  }, [position])

  // 拖拽处理
  const handleMouseDown = (e: React.MouseEvent, isMinimizedButton: boolean = false) => {
    const target = e.target as HTMLElement

    // 检查是否点击了可交互元素
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'OPTION' ||
      target.closest('button') ||
      target.closest('[draggable="true"]') ||
      target.getAttribute('draggable') === 'true'
    ) {
      return
    }

    setIsDragging(true)
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      isMinimizedButton,
      hasMoved: false,
    }
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return

      const deltaX = e.clientX - dragRef.current.startX
      const deltaY = e.clientY - dragRef.current.startY

      // 如果移动距离超过 5px，认为是拖拽而非点击
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        dragRef.current.hasMoved = true
      }

      const newX = Math.max(0, Math.min(window.innerWidth - 60, dragRef.current.startPosX + deltaX))
      const newY = Math.max(0, Math.min(window.innerHeight - 60, dragRef.current.startPosY + deltaY))

      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      // 如果是点击操作（没有移动），且是最小化按钮，则展开面板
      if (dragRef.current && !dragRef.current.hasMoved && dragRef.current.isMinimizedButton) {
        setIsMinimized(false)
      }

      setIsDragging(false)
      dragRef.current = null
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const panelStyle = {
    position: 'fixed' as const,
    left: position.x,
    top: position.y,
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    border: '1px solid #e5e7eb',
    zIndex: 2147483647,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    minWidth: '240px',
    overflow: 'hidden',
    opacity: isHovered || isDragging ? 1 : 0.85,
    transition: 'opacity 0.2s',
    cursor: isDragging ? 'grabbing' : 'grab',
  }

  const headerStyle = {
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'grab',
    userSelect: 'none' as const,
  }

  const headerTitleStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
  }

  const minimizeButtonStyle = {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  }

  const tabsContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
  }

  const tabStyle = (isActive: boolean) => ({
    flex: 1,
    padding: '12px',
    textAlign: 'center' as const,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'white' : '#6b7280',
    transition: 'all 0.2s',
  })

  const contentStyle = {
    padding: '16px',
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  }

  const stickerItemStyle = {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    cursor: 'grab',
    borderRadius: '8px',
    transition: 'all 0.2s',
    userSelect: 'none' as const,
  }

  const selectContainerStyle = {
    marginBottom: '12px',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '6px',
  }

  const selectStyle = {
    width: '100%',
    padding: '8px 12px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: 'white',
    cursor: 'pointer',
    outline: 'none',
  }

  const previewStyle = {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1f2937',
    textAlign: 'center' as const,
    fontWeight: '500',
  }

  const buttonStyle = {
    marginTop: '12px',
    width: '100%',
    padding: '10px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  }

  const toolbarStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px',
    borderTop: '1px solid #e5e7eb',
    marginTop: '16px',
  }

  const toolButtonStyle = (isActive: boolean = false) => ({
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s',
    backgroundColor: isActive ? '#dbeafe' : 'transparent',
    border: 'none',
  })

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = '#f3f4f6'
    e.currentTarget.style.transform = 'scale(1.1)'
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.backgroundColor = 'transparent'
    e.currentTarget.style.transform = 'scale(1)'
  }

  const handleTextPlace = () => {
    const text = `${selectedPhraseA} ${selectedPhraseB}`
    onTextPlace(text)
  }

  // 最小化模式的圆形按钮
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          zIndex: 2147483647,
          cursor: isDragging ? 'grabbing' : 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          opacity: isHovered || isDragging ? 1 : 0.8,
          transition: 'opacity 0.2s, transform 0.2s',
          transform: isHovered && !isDragging ? 'scale(1.1)' : 'scale(1)',
          userSelect: 'none',
        }}
        onMouseDown={(e) => handleMouseDown(e, true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="点击展开 / 拖动移动"
      >
        🎨
      </div>
    )
  }

  return (
    <div
      style={panelStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      {/* 头部 */}
      <div style={headerStyle}>
        <span style={headerTitleStyle}>WebParty</span>
        <button
          style={minimizeButtonStyle}
          onClick={() => setIsMinimized(true)}
          title="最小化"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          −
        </button>
      </div>

      {/* Tab 切换 */}
      <div style={tabsContainerStyle}>
        <div
          style={tabStyle(activeTab === 'sticker')}
          onClick={() => setActiveTab('sticker')}
        >
          🎨 涂鸦模式
        </div>
        <div
          style={tabStyle(activeTab === 'text')}
          onClick={() => setActiveTab('text')}
        >
          💬 建言模式
        </div>
      </div>

      <div style={contentStyle}>
        {activeTab === 'sticker' ? (
          <div style={gridStyle}>
            {stickers.map((sticker) => (
              <div
                key={sticker.id}
                style={stickerItemStyle}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('sticker', JSON.stringify(sticker))
                  onDragStart(sticker)
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {sticker.emoji}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div style={selectContainerStyle}>
              <label style={labelStyle}>对象</label>
              <select
                style={selectStyle}
                value={selectedPhraseA}
                onChange={(e) => setSelectedPhraseA(e.target.value)}
              >
                {PHRASE_OPTIONS_A.map((option) => (
                  <option key={option.id} value={option.text}>
                    {option.text}
                  </option>
                ))}
              </select>
            </div>

            <div style={selectContainerStyle}>
              <label style={labelStyle}>评价</label>
              <select
                style={selectStyle}
                value={selectedPhraseB}
                onChange={(e) => setSelectedPhraseB(e.target.value)}
              >
                {PHRASE_OPTIONS_B.map((option) => (
                  <option key={option.id} value={option.text}>
                    {option.text}
                  </option>
                ))}
              </select>
            </div>

            <div style={previewStyle}>
              {selectedPhraseA} {selectedPhraseB}
            </div>

            <button
              style={buttonStyle}
              onClick={handleTextPlace}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#3b82f6'
              }}
            >
              点击放置
            </button>
          </div>
        )}
      </div>

      {/* 工具栏 */}
      <div style={toolbarStyle}>
        <button
          style={toolButtonStyle(!isVisible)}
          onClick={onToggleVisibility}
          title={isVisible ? '隐藏贴纸' : '显示贴纸'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isVisible ? '#f3f4f6' : '#dbeafe'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = !isVisible ? '#dbeafe' : 'transparent'
          }}
        >
          {isVisible ? '✨' : '💤'}
        </button>
        <button
          style={toolButtonStyle()}
          onClick={onClearAll}
          title="清空当前页面贴纸"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fee2e2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          🧹
        </button>
        <button
          style={toolButtonStyle(isMuted)}
          onClick={onToggleMute}
          title={isMuted ? '取消静音' : '静音'}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef3c7'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = isMuted ? '#dbeafe' : 'transparent'
          }}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <button
          style={toolButtonStyle()}
          onClick={onScreenshot}
          title="截图并下载"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#dbeafe'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          📷
        </button>
      </div>
    </div>
  )
}