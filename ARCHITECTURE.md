# 项目架构文档（For AI）

## 核心设计理念

**分离式设计 + 组件化 + 配置驱动**

- HTML：纯结构，无内联样式/脚本
- CSS：可复用样式，Windows 98 风格
- JS：模块化组件，基类继承

---

## 目录结构

```
├── admin_data/              # 管理员数据（由管理员创建）
│   ├── config.json         # 管理员配置、密码、JWT密钥
│   ├── research.json       # 研究文章
│   ├── media.json          # 媒体内容
│   ├── activity.json       # 活动记录
│   ├── shop.json           # 商店商品
│   ├── announcement.json   # 公告内容
│   ├── drafts/             # 草稿数据
│   │   ├── research.json
│   │   ├── media.json
│   │   └── ...
│   ├── images/             # 上传的图片（WebP格式）
│   └── book/               # 书籍文本内容
│
├── user_data/              # 用户数据（由访客产生）
│   └── chat_messages.json # 聊天消息
│
├── backend/                # Python FastAPI 后端
│   ├── main.py            # 主应用、路由注册
│   ├── routers/           # API 路由模块
│   │   ├── auth.py        # JWT 认证
│   │   ├── admin.py       # 管理员内容管理
│   │   ├── public.py      # 公开内容访问
│   │   ├── draft.py       # 草稿管理
│   │   ├── upload.py      # 图片上传（自动转WebP）
│   │   ├── search.py      # 全文搜索
│   │   ├── chat.py        # 聊天消息
│   │   ├── book.py        # 书籍滚动内容
│   │   └── announcement.py # 公告管理
│   ├── schemas/           # Pydantic 数据验证
│   └── utils/             # 工具函数
│       ├── auth.py        # JWT 工具
│       └── file_storage.py # JSON 文件存储
│
└── frontend/              # 纯前端代码
    ├── index.html         # 首页（带音频播放器、搜索、导航）
    ├── admin/             # 管理后台 HTML
    ├── pages/             # 用户页面 HTML
    ├── css/               # 样式文件
    │   ├── style.css      # 全局样式（变量定义）
    │   ├── components.css # 可复用组件样式
    │   ├── windows98.css  # Win98 窗口样式
    │   ├── index.css      # 首页专用样式
    │   └── ...
    ├── js/
    │   ├── main.js        # 全局入口（初始化音频播放器等）
    │   ├── core/          # 核心基类
    │   │   ├── ContentPageBase.js       # 用户页面基类
    │   │   └── AdminContentPageBase.js  # 管理页面基类
    │   ├── components/    # 可复用组件
    │   │   ├── ContentCard.js    # 内容卡片
    │   │   ├── EmptyState.js     # 空状态
    │   │   ├── ImageUploader.js  # 图片上传器
    │   │   ├── RadioPlayer.js    # 音频播放器
    │   │   └── window-manager.js # Win98窗口管理器
    │   ├── utils/         # 工具函数
    │   │   ├── apiClient.js   # 统一API客户端
    │   │   └── htmlHelpers.js # HTML工具函数
    │   ├── config/        # 配置文件
    │   │   └── pageConfigs.js # 页面配置（图标、标题等）
    │   ├── pages/         # 页面逻辑（极简）
    │   │   ├── research.js    # 3行代码
    │   │   ├── media.js
    │   │   └── ...
    │   └── admin/         # 管理后台逻辑
    │       ├── login.js
    │       ├── dashboard.js
    │       ├── content-new.js
    │       └── announcement.js
    └── images/            # 静态图片（GIF、图标等）
```

---

## 数据流

### 内容管理流程（草稿系统）

1. **编辑内容** → 自动保存到 `admin_data/drafts/{type}.json`
2. **发布内容** → 复制草稿到 `admin_data/{type}.json`
3. **删除内容** → 从草稿删除 + 同步到正式内容
4. **用户访问** → 读取 `admin_data/{type}.json`（只显示 `status: "published"`）

### 图片上传流程

1. 用户上传图片 → `/api/upload/images`
2. 后端自动转换为 WebP 格式
3. 保存到 `admin_data/images/{hash}.webp`
4. 返回 URL：`/media/images/{hash}.webp`

### 搜索流程

1. 用户输入关键词 → 实时搜索（300ms 防抖）
2. 后端全文检索所有 JSON 文件
3. 返回匹配结果（按类型分组）
4. 前端显示在右侧面板

---

## 前端架构

### 基类继承模式

**用户页面**：
```javascript
ContentPageBase (基类)
  ├── research.js (继承)
  ├── media.js
  ├── activity.js
  └── shop.js
```

**管理页面**：
```javascript
AdminContentPageBase (基类)
  └── content-new.js (继承)
```

### 组件使用示例

```javascript
// 导入组件
import { ContentCard } from '../components/ContentCard.js';
import { RadioPlayer } from '../components/RadioPlayer.js';

// 使用组件
const card = new ContentCard(post, { showActions: true });
const html = card.render();

const player = new RadioPlayer({ streamUrl: 'https://...' });
```

### 配置驱动

所有页面配置在 `config/pageConfigs.js`：
```javascript
export const USER_PAGE_CONFIGS = {
    research: {
        type: 'research',
        containerId: 'posts-container',
        emptyIcon: '📝',
        emptyTitle: '暂无文章'
    }
};
```

---

## 后端架构

### 路由组织

```python
# main.py - 路由注册
app.include_router(auth.router, prefix="/api/auth")
app.include_router(admin.router, prefix="/api/admin")
app.include_router(public.router, prefix="/api/content")
app.include_router(draft.router, prefix="/api/draft")
app.include_router(upload.router, prefix="/api/upload")
app.include_router(search.router, prefix="/api")
app.include_router(chat.router, prefix="/api/chat")
app.include_router(book.router, prefix="/api/book")
app.include_router(announcement.router, prefix="/api/announcement")
```

### 认证机制

- JWT Token 认证
- `get_current_admin` 依赖注入
- Token 存储在 `localStorage`

### 数据存储

- **无数据库**：全部用 JSON 文件
- 读写通过 `ContentStorage` 类
- 自动创建目录和文件

---

## 关键功能实现

### 1. 首页音频播放器

**位置**：左上角
- Doge GIF 动画
- 播放/暂停按钮（切换显示）
- 播放电台流：`https://n10as.radiocult.fm/stream`
- 使用 HTML5 `<audio>` 标签

**组件**：`frontend/js/components/RadioPlayer.js`

### 2. 导航菜单

**位置**：顶部右侧
- 5个导航图标（研究、媒体、活动、商店、留言）
- 点击打开 Win98 风格窗口
- 使用 `window-manager.js` 管理窗口

### 3. 搜索功能

**位置**：左侧栏（公告栏上方）
- 实时搜索（防抖 300ms）
- 搜索结果显示在右侧面板
- 高亮关键词

### 4. 公告栏

**位置**：左侧栏
- 支持文字 + 图片
- 管理员可编辑
- 自动换行、支持多段

### 5. 书籍滚动条

**位置**：顶部黄色区域
- 无限滚动动画
- 读取 `admin_data/book/*.txt` 文件
- Hover 暂停

---

## Windows 98 风格系统

### CSS 变量（在 `style.css` 中定义）

```css
:root {
    --win98-gray: #c0c0c0;
    --win98-white: #ffffff;
    --win98-black: #000000;
    --win98-dark-gray: #808080;
    --win98-light-gray: #dfdfdf;
    --win98-blue: #000080;
    
    --content-gap: 0.36rem;
    --content-padding: 0.71rem;
    --section-gap: 1.43rem;
}
```

### 按钮样式

```css
.btn {
    border-top: 2px solid var(--win98-white);
    border-left: 2px solid var(--win98-white);
    border-right: 2px solid var(--win98-black);
    border-bottom: 2px solid var(--win98-black);
    background-color: var(--win98-gray);
}

.btn:active {
    /* 反转边框 */
    border-top: 2px solid var(--win98-black);
    border-left: 2px solid var(--win98-black);
    border-right: 2px solid var(--win98-white);
    border-bottom: 2px solid var(--win98-white);
}
```

---

## 添加新功能的步骤

### 添加新的内容类型

1. **后端**：在 `admin.py` 中已支持，只需确保类型在允许列表中
2. **配置**：在 `pageConfigs.js` 添加配置
3. **页面**：创建 3 行代码的 JS 文件
4. **HTML**：创建简单的 HTML 页面
5. **完成**：自动继承所有功能

### 添加新组件

1. 在 `frontend/js/components/` 创建组件类
2. 导出组件类
3. 在需要的地方导入使用
4. CSS 样式放在 `components.css` 或独立文件

---

## 重要约定

1. **所有 API 请求**使用 `utils/apiClient.js`
2. **所有 HTML 转义**使用 `utils/htmlHelpers.js`
3. **管理员操作**需要 JWT Token（通过 `{ auth: true }` 传递）
4. **图片上传**自动转 WebP，节省空间
5. **草稿自动保存**：10秒间隔，编辑器有改动时触发
6. **删除操作**：草稿删除 + 同步发布（保证数据一致）

---

## 常见任务

### 修改管理员密码

编辑 `admin_data/config.json`：
```json
{
  "username": "admin",
  "password": "new_password",
  "secret_key": "..."
}
```

### 备份数据

```bash
tar -czf backup.tar.gz admin_data/ user_data/
```

### 清空内容

```bash
echo '{"posts": []}' > admin_data/research.json
echo '{"posts": []}' > admin_data/drafts/research.json
```

### 查看日志

服务器运行时会输出请求日志和错误信息。

---

## 技术栈

- **后端**: Python 3.8+ / FastAPI / JWT / Pillow
- **前端**: 原生 JavaScript ES6+ / HTML5 / CSS3
- **存储**: JSON 文件（无数据库）
- **认证**: JWT Token
- **图片**: WebP 格式（自动转换）

---

这就是整个项目的架构！核心是**简单、可维护、易扩展**。
