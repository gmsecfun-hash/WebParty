# WebParty 服务器部署文档

## 📋 目录

1. [环境要求](#环境要求)
2. [后端部署](#后端部署)
3. [前端构建](#前端构建)
4. [生产环境配置](#生产环境配置)
5. [进程管理](#进程管理)
6. [性能优化](#性能优化)
7. [监控与日志](#监控与日志)
8. [常见问题](#常见问题)

---

## 环境要求

### 服务器配置
- **CPU**: 2核
- **内存**: 2GB
- **存储**: 20GB+
- **带宽**: 300GB/月
- **系统**: Ubuntu 20.04+ / CentOS 7+

### 软件环境
- Node.js v18+
- npm 或 yarn
- PM2 (进程管理)
- Nginx (反向代理，可选)

---

## 后端部署

### 1. 上传代码到服务器

```bash
# 方式一：使用 Git
ssh user@your-server.com
cd /var/www
git clone https://github.com/yourusername/webparty.git
cd webparty/server

# 方式二：使用 SCP 上传
# 在本地执行
scp -r server user@your-server.com:/var/www/webparty/
```

### 2. 安装依赖

```bash
cd /var/www/webparty/server
npm install --production
```

### 3. 配置环境变量

创建 `.env` 文件：

```bash
nano .env
```

添加以下内容：

```env
# 服务端口
PORT=3001

# 环境
NODE_ENV=production

# 数据库路径（可选，默认在 data 目录）
# DB_PATH=/var/www/webparty/server/data/stickers.db

# 跨域配置（可选）
# CORS_ORIGIN=https://yourdomain.com
```

### 4. 创建数据目录

```bash
mkdir -p data
chmod 755 data
```

### 5. 测试运行

```bash
npm start
```

访问 `http://your-server-ip:3001/health` 测试是否正常运行。

---

## 前端构建

### 本地构建（推荐）

**重要：** Chrome 扩展需要在本地构建后上传到服务器，供用户下载。

```bash
# 在本地开发机器上
cd webparty
npm install
npm run build
```

构建产物在 `dist` 目录中。

### 分发方式

#### 方式一：Chrome Web Store（推荐）

1. 访问 [Chrome 开发者控制台](https://chrome.google.com/webstore/developer/dashboard)
2. 支付 $5 一次性注册费
3. 上传 `dist` 目录打包的 zip 文件
4. 填写商店信息并发布

**优点：**
- 用户一键安装
- 自动更新
- 官方渠道，可信度高

#### 方式二：自托管下载

```bash
# 在服务器上
cd /var/www/webparty
mkdir -p downloads

# 上传构建好的 dist 目录
# 本地执行
scp -r dist user@your-server.com:/var/www/webparty/downloads/

# 打包为 zip
ssh user@your-server.com
cd /var/www/webparty/downloads
zip -r webparty-extension.zip dist/
```

配置 Nginx 提供下载：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location /downloads/ {
        alias /var/www/webparty/downloads/;
        autoindex on;
    }
}
```

用户下载后手动安装：
1. 下载 `webparty-extension.zip`
2. 解压到本地
3. Chrome 访问 `chrome://extensions/`
4. 开启"开发者模式"
5. 点击"加载已解压的扩展程序"
6. 选择解压后的目录

---

## 生产环境配置

### 1. 修改前端 API 地址

编辑 `src/utils/api.ts`：

```typescript
// 修改为你的服务器地址
const API_BASE_URL = 'https://yourdomain.com/api'
const SOCKET_URL = 'https://yourdomain.com'
```

重新构建前端：

```bash
npm run build
```

### 2. Nginx 反向代理配置

创建 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/webparty
```

添加以下内容：

```nginx
upstream webparty_backend {
    server 127.0.0.1:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com;

    # 安全限制
    client_max_body_size 1M;
    
    # API 接口
    location /api/ {
        proxy_pass http://webparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket
    location /socket.io/ {
        proxy_pass http://webparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        
        # WebSocket 超时配置
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;
    }

    # 静态文件下载
    location /downloads/ {
        alias /var/www/webparty/downloads/;
        autoindex on;
        
        # 缓存配置
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # 健康检查
    location /health {
        proxy_pass http://webparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/webparty /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. HTTPS 配置（推荐）

使用 Let's Encrypt 免费证书：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

自动续期：

```bash
sudo crontab -e
```

添加：

```
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 进程管理

### 使用 PM2

#### 安装 PM2

```bash
sudo npm install -g pm2
```

#### 创建 PM2 配置文件

```bash
cd /var/www/webparty/server
nano ecosystem.config.js
```

添加以下内容：

```javascript
module.exports = {
  apps: [{
    name: 'webparty-server',
    script: './dist/index.js',
    instances: 2, // 2核 CPU
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    max_memory_restart: '500M', // 内存限制
    autorestart: true,
    watch: false,
    ignore_watch: ['node_modules', 'data', 'logs']
  }]
}
```

#### 构建并启动

```bash
npm run build
pm2 start ecosystem.config.js
```

#### PM2 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs webparty-server

# 重启
pm2 restart webparty-server

# 停止
pm2 stop webparty-server

# 监控
pm2 monit

# 开机自启
pm2 startup
pm2 save
```

---

## 性能优化

### 1. 数据库优化

SQLite 配置（已在代码中实现）：

```typescript
// 已创建索引
CREATE INDEX idx_url_hash ON stickers(url_hash)
```

定期清理旧数据（可选）：

```bash
# 创建清理脚本
nano /var/www/webparty/server/cleanup.sh
```

```bash
#!/bin/bash
# 删除 30 天前的贴纸
sqlite3 /var/www/webparty/server/data/stickers.db "DELETE FROM stickers WHERE created_at < $(date -d '-30 days' +%s)000;"
```

添加定时任务：

```bash
crontab -e
```

```
# 每天凌晨 3 点清理
0 3 * * * /var/www/webparty/server/cleanup.sh
```

### 2. 内存优化

PM2 配置已限制内存：

```javascript
max_memory_restart: '500M'
```

### 3. 连接数限制

Nginx 配置限制并发连接：

```nginx
http {
    limit_conn_zone $binary_remote_addr zone=conn_limit_per_ip:10m;
    
    server {
        location /socket.io/ {
            limit_conn conn_limit_per_ip 10;
            # ... 其他配置
        }
    }
}
```

### 4. 带宽优化

**已实现的优化：**
- ✅ 静态资源 0 流量（Emoji 本地化）
- ✅ WebSocket 纯文本传输
- ✅ 单条消息 < 300 字节

**带宽消耗估算：**
- 每条贴纸消息：~200 字节
- 1GB 流量 ≈ 500 万条消息
- 300GB/月 ≈ 15 亿条消息/月

---

## 监控与日志

### 1. 日志管理

创建日志目录：

```bash
mkdir -p /var/www/webparty/server/logs
chmod 755 logs
```

日志轮转：

```bash
sudo nano /etc/logrotate.d/webparty
```

添加：

```
/var/www/webparty/server/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
}
```

### 2. 监控脚本

创建健康检查脚本：

```bash
nano /var/www/webparty/server/health-check.sh
```

```bash
#!/bin/bash
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)

if [ $RESPONSE != "200" ]; then
    echo "WebParty server is down! Restarting..."
    pm2 restart webparty-server
    # 可选：发送告警邮件
    # echo "WebParty server restarted" | mail -s "Alert" your@email.com
fi
```

添加定时检查：

```bash
crontab -e
```

```
# 每 5 分钟检查一次
*/5 * * * * /var/www/webparty/server/health-check.sh
```

---

## 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo lsof -i :3001

# 杀掉进程
sudo kill -9 <PID>
```

### 2. 数据库权限问题

```bash
chmod 755 /var/www/webparty/server/data
chmod 644 /var/www/webparty/server/data/stickers.db
```

### 3. WebSocket 连接失败

检查 Nginx 配置：

```nginx
# 确保 WebSocket 升级头正确
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

检查防火墙：

```bash
sudo ufw allow 80
sudo ufw allow 443
```

### 4. 内存不足

```bash
# 查看内存使用
free -h

# 创建 Swap（如果内存不足）
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5. 更新代码

```bash
cd /var/www/webparty/server
git pull
npm install --production
npm run build
pm2 restart webparty-server
```

---

## 部署检查清单

### 后端部署
- [ ] 代码上传到服务器
- [ ] 安装依赖
- [ ] 配置环境变量
- [ ] 创建数据目录
- [ ] PM2 进程启动
- [ ] Nginx 反向代理配置
- [ ] HTTPS 证书配置
- [ ] 日志轮转配置
- [ ] 健康检查脚本

### 前端部署
- [ ] 修改 API 地址
- [ ] 本地构建
- [ ] 上传到 Chrome Web Store 或自托管
- [ ] 测试安装

### 监控
- [ ] PM2 监控配置
- [ ] 日志轮转配置
- [ ] 健康检查定时任务
- [ ] 数据清理定时任务

### 安全
- [ ] 防火墙配置
- [ ] HTTPS 启用
- [ ] 数据库权限设置
- [ ] Nginx 安全限制

---

## 维护命令速查

```bash
# 重启服务
pm2 restart webparty-server

# 查看日志
pm2 logs webparty-server

# 查看状态
pm2 status

# Nginx 重启
sudo systemctl restart nginx

# 查看端口
sudo lsof -i :3001

# 数据库备份
sqlite3 /var/www/webparty/server/data/stickers.db ".backup /var/www/webparty/server/data/backup.db"

# 数据库恢复
sqlite3 /var/www/webparty/server/data/stickers.db ".restore /var/www/webparty/server/data/backup.db"
```

---

## 联系与支持

部署完成后，建议：
1. 测试所有功能是否正常
2. 监控服务器资源使用情况
3. 设置定期备份
4. 记录所有修改和配置

**部署愉快！** 🚀