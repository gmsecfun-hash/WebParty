import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const dataDir = path.join(__dirname, '../../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'stickers.db')
const db: Database.Database = new Database(dbPath)

// 创建贴纸表
db.exec(`
  CREATE TABLE IF NOT EXISTS stickers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url_hash TEXT NOT NULL,
    sticker_type TEXT NOT NULL,
    target_selector TEXT NOT NULL,
    offset_x REAL NOT NULL,
    offset_y REAL NOT NULL,
    created_at INTEGER NOT NULL,
    item_type TEXT DEFAULT 'sticker'
  )
`)

// 检查并添加 item_type 列（迁移逻辑）
try {
  const tableInfo = db.prepare('PRAGMA table_info(stickers)').all() as any[]
  const hasItemType = tableInfo.some(col => col.name === 'item_type')

  if (!hasItemType) {
    db.exec('ALTER TABLE stickers ADD COLUMN item_type TEXT DEFAULT \'sticker\'')
    console.log('✅ Added item_type column to stickers table')
  }
} catch (error) {
  console.error('Migration error:', error)
}

// 创建索引以加速查询
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_url_hash ON stickers(url_hash)
`)

export default db