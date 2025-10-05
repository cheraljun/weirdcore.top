# weirdcore store

一个带有 Windows 98 复古风格的个人博客网站，支持内容管理和在线聊天。

## 功能特性

### 用户端
- 📝 **研究文章**：展示个人研究和思考
- 🎬 **媒体内容**：分享电影、音乐等媒体内容
- 📅 **活动记录**：记录生活中的精彩时刻
- 🛒 **商店**：展示商品或作品
- 💬 **在线聊天**：访客可以进行实时聊天
- 🎨 **Windows 98 风格**：复古的视觉设计

### 管理端
- 🔐 **JWT 认证**：安全的管理员登录系统
- ✏️ **内容管理**：增删改查所有内容（研究、媒体、活动、商店）
- 📊 **数据统计**：查看各类型内容数量
- 💾 **JSON 存储**：数据以 JSON 文件形式存储，易于备份

## 技术栈

### 后端
- **FastAPI** - 现代化的 Python Web 框架
- **JSON 文件存储** - 简单高效的数据存储（无需数据库）
- **JWT** - JSON Web Token 认证
- **Pillow** - 图片处理和 WebP 转换
- **Python 3.8.10+** - 兼容 Python 3.8 及以上版本

### 前端
- **原生 JavaScript** - ES6+ 模块化开发
- **HTML5 + CSS3** - 语义化标签，Windows 98 风格
- **组件化设计** - 可复用的 UI 组件
- **模块化架构** - 基于类的页面管理系统

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 运行服务器

```bash
python backend/main.py
```

或者：

```bash
cd backend
python main.py
```

服务器将在 `http://127.0.0.1:8000` 启动

**注意**: 首次运行时会自动创建 `admin_data/` 和 `user_data/` 目录及所有必要的数据文件

### 3. 访问网站

- **用户端首页**: http://127.0.0.1:8000/
- **管理员登录**: http://127.0.0.1:8000/admin/login

### 4. 管理员登录

默认账号：
- **用户名**: `admin`
- **密码**: `password`

⚠️ **重要**: 请在生产环境中修改 `admin_data/config.json` 中的密码和密钥！

## 项目结构

```
weirdcore.top/
├── admin_data/              # 管理员数据（自动创建）
│   ├── config.json         # 管理员配置（用户名、密码、JWT密钥）
│   ├── research.json       # 研究文章数据
│   ├── media.json          # 媒体内容数据
│   ├── activity.json       # 活动记录数据
│   ├── shop.json           # 商店商品数据
│   └── images/             # 上传的图片（WebP格式）
│
├── user_data/               # 用户数据（自动创建）
│   └── chat_messages.json  # 聊天消息
│
├── backend/                 # 后端代码
│   ├── main.py             # FastAPI 主应用
│   ├── routers/            # API 路由
│   │   ├── auth.py         # 认证路由
│   │   ├── admin.py        # 管理员内容管理路由
│   │   ├── public.py       # 公开内容路由
│   │   └── upload.py       # 图片上传路由
│   ├── schemas/            # Pydantic 数据模式
│   │   ├── auth.py         # 认证模式
│   │   └── content.py      # 内容模式
│   └── utils/              # 工具函数
│       ├── auth.py         # JWT 认证工具
│       └── file_storage.py # JSON 文件存储工具
│
├── frontend/                # 前端代码
│   ├── admin/              # 管理后台页面
│   │   ├── login.html      # 登录页面
│   │   ├── index.html      # 管理后台首页
│   │   └── content.html    # 内容管理页面
│   ├── pages/              # 用户页面
│   │   ├── research.html   # 研究页面
│   │   ├── media.html      # 媒体页面
│   │   ├── activity.html   # 活动页面
│   │   ├── shop.html       # 商店页面
│   │   └── chat.html       # 聊天页面
│   ├── css/                # 样式文件
│   │   ├── style.css       # 全局样式
│   │   ├── components.css  # 可复用组件样式
│   │   ├── windows98.css   # Windows 98 窗口样式
│   │   ├── chat.css        # 聊天页面样式
│   │   ├── index.css       # 首页样式
│   │   └── research.css    # 研究页面样式
│   ├── js/                 # JavaScript 文件
│   │   ├── admin/          # 管理后台脚本
│   │   │   ├── login.js    # 登录逻辑
│   │   │   ├── dashboard.js # 仪表板逻辑
│   │   │   └── content-new.js # 内容管理逻辑
│   │   ├── pages/          # 页面脚本
│   │   │   ├── chat.js     # 聊天页面逻辑
│   │   │   ├── research.js # 研究页面逻辑
│   │   │   ├── media.js    # 媒体页面逻辑
│   │   │   ├── activity.js # 活动页面逻辑
│   │   │   └── shop.js     # 商店页面逻辑
│   │   ├── components/     # 可复用组件
│   │   │   ├── window-manager.js # Windows 98 窗口管理器
│   │   │   ├── ContentCard.js    # 内容卡片组件
│   │   │   ├── EmptyState.js     # 空状态组件
│   │   │   └── ImageUploader.js  # 图片上传组件
│   │   ├── core/           # 核心基类
│   │   │   ├── ContentPageBase.js      # 用户页面基类
│   │   │   └── AdminContentPageBase.js # 管理页面基类
│   │   ├── utils/          # 工具函数
│   │   │   ├── apiClient.js    # API 客户端
│   │   │   └── htmlHelpers.js  # HTML 辅助函数
│   │   ├── config/         # 配置
│   │   │   └── pageConfigs.js  # 页面配置
│   │   └── main.js         # 全局入口
│   └── index.html          # 网站首页
│
├── requirements.txt         # Python 依赖
├── ARCHITECTURE.md          # 架构文档
├── STORAGE_STRUCTURE.md     # 数据存储结构说明
└── README.md               # 项目文档
```

## API 文档

### 认证 API

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "password"
}
```

响应：
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

#### 验证 Token
```http
GET /api/auth/verify
Authorization: Bearer <token>
```

### 内容管理 API

所有内容管理 API 都需要在请求头中包含 JWT Token：
```
Authorization: Bearer <token>
```

#### 获取所有内容
```http
GET /api/admin/{content_type}
```
content_type: `research`, `media`, `activity`, `shop`

#### 获取单个内容
```http
GET /api/admin/{content_type}/{post_id}
```

#### 创建内容
```http
POST /api/admin/{content_type}
Content-Type: application/json

{
  "title": "标题",
  "content": "内容",
  "images": [],
  "links": [],
  "status": "published"
}
```

#### 更新内容
```http
PUT /api/admin/{content_type}/{post_id}
Content-Type: application/json

{
  "title": "新标题",
  "content": "新内容",
  ...
}
```

#### 删除内容
```http
DELETE /api/admin/{content_type}/{post_id}
```

## 数据格式

### 内容数据结构

```json
{
  "id": "uuid",
  "type": "research|media|activity|shop",
  "title": "标题（可选）",
  "content": "文字内容",
  "images": [
    "/media/images/image1.jpg",
    "/media/images/image2.png"
  ],
  "links": [
    {
      "url": "https://example.com",
      "text": "链接文字"
    }
  ],
  "status": "published",
  "created_at": "2025-10-05T12:00:00Z",
  "updated_at": "2025-10-05T12:30:00Z",
  "author": "Admin"
}
```

## 安全建议

1. **修改默认密码**: 编辑 `admin_data/config.json`，修改管理员密码
2. **修改 JWT 密钥**: 修改 `config.json` 中的 `secret_key`
3. **HTTPS**: 生产环境中使用 HTTPS
4. **限制访问**: 使用防火墙限制管理端口访问
5. **定期备份**: 定期备份 `admin_data` 和 `user_data` 目录

## 开发计划

- [ ] 图片上传功能
- [ ] 富文本编辑器
- [ ] 链接自动识别和解析
- [ ] 内容编辑器页面
- [ ] 聊天记录查看
- [ ] 数据导出功能
- [ ] 响应式布局优化

## 许可证

MIT

## 联系方式

邮箱: 1773384983@qq.com
