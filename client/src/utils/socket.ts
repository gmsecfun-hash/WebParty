import { io, Socket } from 'socket.io-client'

const SOCKET_URL = 'https://webpart.gmsec.fun'

let socket: Socket | null = null

export interface NewStickerEvent {
  id: number
  stickerType: string
  targetSelector: string
  offsetX: number
  offsetY: number
  createdAt: number
}

export function initSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server')
    })

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server')
    })
  }

  return socket
}

export async function joinRoom(url: string): Promise<void> {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  return new Promise((resolve) => {
    socket!.emit('join_room', url)
    socket!.once('joined_room', () => {
      console.log('🚪 Joined room for:', url)
      resolve()
    })
  })
}

export function onNewSticker(callback: (data: NewStickerEvent) => void): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.on('new_sticker', callback)
}

export function offNewSticker(callback: (data: NewStickerEvent) => void): void {
  if (!socket) {
    console.error('Socket not initialized')
    return
  }

  socket.off('new_sticker', callback)
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}