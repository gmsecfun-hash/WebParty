// Web Audio API 音效合成器

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

/**
 * 软烂沉闷的"吧唧"声（类似番茄砸墙）
 * 频率快速下降，使用低频正弦波
 */
export function playSquish(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // 振荡器
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(300, now)
  osc.frequency.exponentialRampToValueAtTime(80, now + 0.15)

  // 增益包络
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.4, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

  // 连接
  osc.connect(gain)
  gain.connect(ctx.destination)

  // 播放
  osc.start(now)
  osc.stop(now + 0.15)
}

/**
 * 清脆的高频"叮"声（类似吃金币）
 * 使用正弦波 + 高频泛音
 */
export function playCoin(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // 主音
  const osc1 = ctx.createOscillator()
  osc1.type = 'sine'
  osc1.frequency.setValueAtTime(1200, now)
  osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1)

  // 泛音
  const osc2 = ctx.createOscillator()
  osc2.type = 'sine'
  osc2.frequency.setValueAtTime(1800, now)
  osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.08)

  // 增益包络
  const gain1 = ctx.createGain()
  gain1.gain.setValueAtTime(0.3, now)
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

  const gain2 = ctx.createGain()
  gain2.gain.setValueAtTime(0.15, now)
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.1)

  // 连接
  osc1.connect(gain1)
  gain1.connect(ctx.destination)
  osc2.connect(gain2)
  gain2.connect(ctx.destination)

  // 播放
  osc1.start(now)
  osc1.stop(now + 0.15)
  osc2.start(now)
  osc2.stop(now + 0.1)
}

/**
 * 搞怪的"boing"弹簧跳跃声
 * 使用三角波 + 频率弹跳
 */
export function playSpring(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // 振荡器
  const osc = ctx.createOscillator()
  osc.type = 'triangle'

  // 频率弹跳效果
  osc.frequency.setValueAtTime(150, now)
  osc.frequency.linearRampToValueAtTime(400, now + 0.05)
  osc.frequency.linearRampToValueAtTime(200, now + 0.1)
  osc.frequency.linearRampToValueAtTime(350, now + 0.15)
  osc.frequency.linearRampToValueAtTime(180, now + 0.2)

  // 增益包络
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.linearRampToValueAtTime(0.2, now + 0.1)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25)

  // 连接
  osc.connect(gain)
  gain.connect(ctx.destination)

  // 播放
  osc.start(now)
  osc.stop(now + 0.25)
}

/**
 * 极简轻快的气泡声（用于文字建言）
 * 短促的正弦波
 */
export function playPop(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime

  // 振荡器
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08)

  // 增益包络
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

  // 连接
  osc.connect(gain)
  gain.connect(ctx.destination)

  // 播放
  osc.start(now)
  osc.stop(now + 0.08)
}

/**
 * 统一音效播放接口
 * @param type - 贴纸类型（'sticker' 或 'text'）
 * @param itemId - 贴纸 ID（用于路由到不同音效）
 */
export function playSound(type: 'sticker' | 'text', itemId?: string): void {
  // 检查静音状态
  const isMuted = localStorage.getItem('webparty-muted') === 'true'
  if (isMuted) {
    return
  }

  // 文字模式使用气泡声
  if (type === 'text') {
    playPop()
    return
  }

  // 贴纸模式根据 ID 路由音效
  switch (itemId) {
    case '1': // 🍅 番茄
      playSquish()
      break
    case '2': // 🐶 狗头
      playSpring()
      break
    case '3': // 🤡 小丑
      playSpring()
      break
    case '4': // 👍 点赞
      playCoin()
      break
    case '5': // ❤️ 爱心
      playCoin()
      break
    case '6': // 🔥 火焰
      playPop()
      break
    default:
      // 默认使用软烂声
      playSquish()
  }
}