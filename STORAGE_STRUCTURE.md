# 数据存储结构说明

## 📁 目录组织原则

所有数据按照**所有者**和**用途**分类存储，便于管理、备份和清理。

---

## 📂 admin_data/ - 管理员数据（所有管理员相关数据）

**用途**：存储所有由管理员创建、管理的数据

```
admin_data/
├── config.json          # 管理员配置（用户名、密码、JWT密钥）
├── research.json        # 研究文章数据
├── media.json           # 媒体内容数据
├── activity.json        # 活动记录数据
├── shop.json            # 商店商品数据
└── images/              # 上传的图片（WebP格式）
    ├── xxx.webp
    ├── yyy.webp
    └── ...
```

**特点**：
- ✅ 所有管理员创建的内容
- ✅ 所有上传的图片文件
- ✅ 管理员配置信息
- ✅ 便于整体备份
- ✅ 便于批量管理

**备份建议**：
```bash
# 备份所有管理员数据
cp -r admin_data/ backup_admin_data_$(date +%Y%m%d)/
```

---

## 📂 user_data/ - 用户数据（访客数据）

**用途**：存储网站访客产生的数据

```
user_data/
└── chat_messages.json   # 聊天消息记录
```

**特点**：
- ✅ 访客产生的数据
- ✅ 不包含管理员内容
- ✅ 可以独立清理
- ✅ 自动初始化

**清理操作**：
```bash
# 清空聊天记录
echo '{"messages": []}' > user_data/chat_messages.json
```

---

## 📂 frontend/ - 前端代码（静态资源）

**用途**：前端代码和静态资源

```
frontend/
├── css/                 # 样式文件
├── js/                  # JavaScript代码
├── pages/               # HTML页面
└── admin/               # 管理后台页面
```

**说明**：
- ✅ 纯前端代码，不包含用户数据
- ✅ 所有上传的图片保存在 `admin_data/images/`
- 💡 如果将来需要音视频功能，文件也会保存在 `admin_data/` 下

---

## 📂 backend/ - 后端代码

**用途**：后端 Python 代码

```
backend/
├── main.py              # 主应用
├── routers/             # API路由
├── models/              # 数据模型
├── schemas/             # 数据验证
└── utils/               # 工具函数
```

---

## 🔄 数据访问路径

### 管理员数据
- **内容数据**：直接读取 JSON 文件
  - `admin_data/research.json`
  - `admin_data/media.json`
  - 等等...

- **图片资源**：通过 HTTP 访问
  - 存储路径：`admin_data/images/xxx.webp`
  - 访问URL：`/media/images/xxx.webp`
  - 自动映射，无需手动处理

### 用户数据
- **聊天消息**：直接读取 JSON 文件
  - `user_data/chat_messages.json`

---

## 🛠️ 常用操作

### 1. 完整备份所有数据

```bash
# 备份管理员数据和用户数据
tar -czf backup_$(date +%Y%m%d_%H%M%S).tar.gz admin_data/ user_data/
```

### 2. 只备份管理员数据

```bash
# 备份内容和图片
tar -czf backup_admin_$(date +%Y%m%d).tar.gz admin_data/
```

### 3. 查看数据占用空间

```bash
# 查看各目录大小
du -sh admin_data/
du -sh admin_data/images/
du -sh user_data/
```

### 4. 清理旧数据

```bash
# 清空所有内容（保留结构）
echo '{"posts": []}' > admin_data/research.json
echo '{"posts": []}' > admin_data/media.json
echo '{"posts": []}' > admin_data/activity.json
echo '{"posts": []}' > admin_data/shop.json

# 清空所有图片
rm -rf admin_data/images/*

# 清空聊天记录
echo '{"messages": []}' > user_data/chat_messages.json
```

### 5. 迁移数据（换服务器）

```bash
# 1. 打包所有数据
tar -czf weirdcore_data.tar.gz admin_data/ user_data/

# 2. 传输到新服务器
scp weirdcore_data.tar.gz user@newserver:/path/to/weirdcore.top/

# 3. 在新服务器解压
cd /path/to/weirdcore.top/
tar -xzf weirdcore_data.tar.gz

# 完成！所有数据已迁移
```

---

## 📊 数据统计

### 查看内容数量

```bash
# 研究文章数
grep -o '"id"' admin_data/research.json | wc -l

# 媒体内容数
grep -o '"id"' admin_data/media.json | wc -l

# 图片数量
ls -1 admin_data/images/ | wc -l

# 聊天消息数
grep -o '"id"' user_data/chat_messages.json | wc -l
```

### 查看最新内容

```bash
# 最新的 5 张图片
ls -lt admin_data/images/ | head -5

# 查看配置
cat admin_data/config.json | python -m json.tool
```

---

## ⚠️ 注意事项

### 1. Git 版本控制

建议 `.gitignore` 配置：
```gitignore
# 用户上传的图片（太大，不提交）
admin_data/images/*.webp

# 聊天数据（隐私，不提交）
user_data/chat_messages.json
```

但保留目录结构：
```gitignore
# 保留这些文件，确保目录存在
!admin_data/images/.gitkeep
!user_data/.gitkeep
```

### 2. 权限设置

Linux/Mac 服务器上确保正确的权限：
```bash
# 设置数据目录权限
chmod 755 admin_data/ user_data/
chmod 644 admin_data/*.json
chmod 755 admin_data/images/
chmod 644 admin_data/images/*.webp
```

### 3. 定期备份

建议设置自动备份（crontab）：
```bash
# 每天凌晨3点自动备份
0 3 * * * cd /path/to/weirdcore.top && tar -czf backup_$(date +\%Y\%m\%d).tar.gz admin_data/ user_data/
```

---

## 🎯 优势总结

### 当前的组织结构优势：

1. **清晰分离**
   - 管理员数据 → `admin_data/`
   - 用户数据 → `user_data/`
   - 代码 → `frontend/`, `backend/`

2. **便于管理**
   - 想备份管理员内容？直接打包 `admin_data/`
   - 想清空聊天记录？删除 `user_data/chat_messages.json`
   - 想迁移网站？复制这两个目录即可

3. **易于维护**
   - 所有图片在 `admin_data/images/`
   - 所有文章在对应的 JSON 文件
   - 一目了然，不会遗漏

4. **简化部署**
   - 初始化数据自动创建
   - 目录结构统一
   - 新服务器快速上线

---

## 📝 示例场景

### 场景1：网站迁移

```bash
# 旧服务器
tar -czf website_data.tar.gz admin_data/ user_data/

# 新服务器
tar -xzf website_data.tar.gz
python backend/main.py  # 启动即可，所有数据自动生效
```

### 场景2：清理测试数据

```bash
# 清理所有内容，保留配置
rm -rf admin_data/images/*
find admin_data -name "*.json" ! -name "config.json" -exec sh -c 'echo "{\"posts\": []}" > {}' \;
```

### 场景3：只分享内容，不暴露配置

```bash
# 只导出公开内容
mkdir public_data
cp admin_data/{research,media,activity,shop}.json public_data/
cp -r admin_data/images/ public_data/
tar -czf public_content.tar.gz public_data/
```

---

这就是整个数据存储的设计理念！🎉
