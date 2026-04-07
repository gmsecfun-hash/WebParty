import { Router, Request, Response } from 'express'
import db from '../database/init'
import { Sticker, CreateStickerRequest } from '../types'
import crypto from 'crypto'

const router = Router()

// 清洗 URL 并生成哈希
function cleanAndHashUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    // 只保留 domain + path，去掉 hash 和查询参数
    const cleanUrl = `${urlObj.origin}${urlObj.pathname}`
    return crypto.createHash('sha256').update(cleanUrl).digest('hex')
  } catch (e) {
    // 如果 URL 解析失败，返回原始 URL 的哈希
    return crypto.createHash('sha256').update(url).digest('hex')
  }
}

// GET /api/stickers?url=xxx
router.get('/stickers', (req: Request, res: Response) => {
  try {
    const { url } = req.query

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' })
    }

    const urlHash = cleanAndHashUrl(url)

    const stickers = db.prepare(`
      SELECT * FROM stickers WHERE url_hash = ? ORDER BY created_at DESC
    `).all(urlHash) as Sticker[]

    res.json({ stickers })
  } catch (error) {
    console.error('Error fetching stickers:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/stickers
router.post('/stickers', (req: Request, res: Response) => {
  try {
    const { urlHash, stickerType, targetSelector, offsetX, offsetY, itemType = 'sticker' }: CreateStickerRequest = req.body

    if (!urlHash || !stickerType || !targetSelector || offsetX === undefined || offsetY === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const createdAt = Date.now()

    const result = db.prepare(`
      INSERT INTO stickers (url_hash, sticker_type, target_selector, offset_x, offset_y, created_at, item_type)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(urlHash, stickerType, targetSelector, offsetX, offsetY, createdAt, itemType)

    const sticker = db.prepare(`
      SELECT * FROM stickers WHERE id = ?
    `).get(result.lastInsertRowid) as Sticker

    // 通过 Socket.io 广播新贴纸给房间内的其他客户端
    const { io } = require('../index')
    io.to(urlHash).emit('new_sticker', {
      id: sticker.id,
      stickerType: sticker.sticker_type,
      targetSelector: sticker.target_selector,
      offsetX: sticker.offset_x,
      offsetY: sticker.offset_y,
      createdAt: sticker.created_at,
      itemType: sticker.item_type,
    })

    res.status(201).json({ sticker })
  } catch (error) {
    console.error('Error creating sticker:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router