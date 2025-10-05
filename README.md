# weirdcore store

Windows 98 复古风格的个人博客网站。

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 运行服务器
python backend/main.py
```

访问：http://127.0.0.1:8000

管理后台：http://127.0.0.1:8000/admin/login（用户名：`admin` 密码：`password`）

## 功能

### 用户端
- 📝 研究文章
- 🎬 媒体内容  
- 📅 活动记录
- 🛒 商店展示
- 💬 在线聊天
- 🎵 电台播放器（左上角）
- 🔍 实时搜索
- 📜 书籍滚动条
- 📢 公告栏

### 管理端
- 🔐 JWT 认证
- ✏️ 内容管理（增删改查）
- 📊 数据统计
- 💾 草稿自动保存
- 🖼️ 图片上传（自动转 WebP）
- 📢 公告编辑

## 技术栈

**后端**: Python 3.8+ / FastAPI / JWT / Pillow  
**前端**: 原生 JavaScript ES6+ / HTML5 / CSS3  
**存储**: JSON 文件（无数据库）

## 项目结构

```
├── admin_data/           # 管理员数据（内容、图片、配置）
├── user_data/            # 用户数据（聊天记录）
├── backend/              # Python FastAPI 后端
│   ├── main.py          # 主应用
│   └── routers/         # API 路由
├── frontend/             # 纯前端代码
│   ├── js/              # JavaScript 模块
│   │   ├── core/        # 基类
│   │   ├── components/  # 可复用组件
│   │   ├── utils/       # 工具函数
│   │   └── pages/       # 页面逻辑
│   ├── css/             # 样式文件
│   └── admin/           # 管理后台页面
└── requirements.txt
```

详细架构说明：见 [ARCHITECTURE.md](ARCHITECTURE.md)

## 核心 API

所有管理 API 需要 JWT Token：
```
Authorization: Bearer <token>
```

### 认证
```http
POST /api/auth/login
{"username": "admin", "password": "password"}
```

### 内容管理
```http
GET    /api/admin/{type}           # 获取所有内容
POST   /api/admin/{type}           # 创建内容
PUT    /api/admin/{type}/{id}      # 更新内容
DELETE /api/admin/{type}/{id}      # 删除内容
```

`type`: `research` / `media` / `activity` / `shop`

### 草稿管理
```http
GET  /api/draft/{type}              # 获取草稿
POST /api/draft/{type}              # 保存草稿
POST /api/draft/{type}/publish      # 发布草稿
```

### 图片上传
```http
POST /api/upload/images
Content-Type: multipart/form-data
```

自动转换为 WebP 格式，返回 `/media/images/{hash}.webp`

## 数据格式

### 内容数据
```json
{
  "id": "xxx",
  "title": "标题",
  "content": "内容",
  "images": ["/media/images/xxx.webp"],
  "status": "published",
  "type": "research",
  "created_at": "2025-10-05T12:00:00Z",
  "updated_at": "2025-10-05T12:00:00Z"
}
```

## 安全提醒

⚠️ 生产环境请修改：
1. `admin_data/config.json` 中的密码
2. `admin_data/config.json` 中的 `secret_key`
3. 使用 HTTPS

## 备份与迁移

```bash
# 备份所有数据
tar -czf backup.tar.gz admin_data/ user_data/

# 迁移到新服务器
scp backup.tar.gz user@newserver:/path/
tar -xzf backup.tar.gz
python backend/main.py
```

## 开发计划

- [x] 内容管理系统
- [x] JWT 认证
- [x] 图片上传（WebP）
- [x] 草稿系统
- [x] 全文搜索
- [x] 音频播放器
- [x] 公告系统
- [ ] 富文本编辑器
- [ ] 数据导出功能
- [ ] 响应式布局优化

## 许可证

MIT

## 联系

邮箱: 1773384983@qq.com
