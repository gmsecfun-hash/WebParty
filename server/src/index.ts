import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import stickersRouter from './routes/stickers'
import crypto from 'crypto'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

// 导出 io 实例供路由使用
export { io }

const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api', stickersRouter)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() })
})

// 清洗 URL 并生成哈希
function cleanAndHashUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    const cleanUrl = `${urlObj.origin}${urlObj.pathname}`
    return crypto.createHash('sha256').update(cleanUrl).digest('hex')
  } catch (e) {
    return crypto.createHash('sha256').update(url).digest('hex')
  }
}

// Socket.io 连接处理
io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`)

  // 加入房间
  socket.on('join_room', (url: string) => {
    const roomName = cleanAndHashUrl(url)
    socket.join(roomName)
    console.log(`🚪 Client ${socket.id} joined room: ${roomName}`)
    socket.emit('joined_room', { room: roomName })
  })

  // 监听贴纸放置事件
  socket.on('drop_sticker', (data) => {
    const roomName = cleanAndHashUrl(data.url)
    console.log(`🎨 New sticker in room ${roomName}:`, data.stickerType)

    // 广播给房间内的其他客户端
    socket.to(roomName).emit('new_sticker', data)
  })

  // 断开连接
  socket.on('disconnect', () => {
    console.log(`📱 Client disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`🔌 WebSocket server is ready`)
})