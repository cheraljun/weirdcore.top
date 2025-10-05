"""
FastAPI主应用入口
提供静态文件服务和API路由
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
ROOT_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(ROOT_DIR))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os

# 创建FastAPI应用
app = FastAPI(
    title="weirdcore store API",
    description="个人博客网站的后端API",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录
app.mount("/css", StaticFiles(directory="frontend/css"), name="css")
app.mount("/js", StaticFiles(directory="frontend/js"), name="js")
app.mount("/pages", StaticFiles(directory="frontend/pages"), name="pages")
app.mount("/admin-static", StaticFiles(directory="frontend/admin"), name="admin-static")

# 挂载管理员数据目录（图片等资源）
app.mount("/media/images", StaticFiles(directory="admin_data/images"), name="admin-images")

# 根路由 - 返回首页
@app.get("/")
async def read_root():
    return FileResponse("frontend/index.html")

# 页面路由
@app.get("/research")
async def research_page():
    return FileResponse("frontend/pages/research.html")

@app.get("/media")
async def media_page():
    return FileResponse("frontend/pages/media.html")

@app.get("/activity")
async def activity_page():
    return FileResponse("frontend/pages/activity.html")

@app.get("/shop")
async def shop_page():
    return FileResponse("frontend/pages/shop.html")

@app.get("/chat")
async def chat_page():
    return FileResponse("frontend/pages/chat.html")

# 管理员路由
@app.get("/admin/login")
async def admin_login_page():
    return FileResponse("frontend/admin/login.html")

@app.get("/admin")
async def admin_page():
    return FileResponse("frontend/admin/index.html")

@app.get("/admin/content")
async def admin_content_page():
    return FileResponse("frontend/admin/content.html")

# 健康检查
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# 导入API路由
from backend.routers import auth, admin, public, upload

# 认证路由
app.include_router(auth.router, prefix="/api/auth", tags=["认证"])

# 管理员内容管理路由
app.include_router(admin.router, prefix="/api/admin", tags=["管理员"])

# 公开内容路由
app.include_router(public.router, prefix="/api/content", tags=["公开内容"])

# 文件上传路由
app.include_router(upload.router, prefix="/api/upload", tags=["文件上传"])

def init_data_files():
    """初始化用户数据文件"""
    import json
    from pathlib import Path
    
    # 只创建用户数据目录
    user_dir = ROOT_DIR / "user_data"
    user_dir.mkdir(exist_ok=True)
    
    # 创建聊天消息文件
    chat_file = user_dir / "chat_messages.json"
    if not chat_file.exists():
        with open(chat_file, 'w', encoding='utf-8') as f:
            json.dump({"messages": []}, f, ensure_ascii=False, indent=2)
        print("✅ 用户数据文件初始化完成")
    else:
        print("✅ 用户数据已存在")

if __name__ == "__main__":
    import uvicorn
    
    # 初始化数据文件
    init_data_files()
    
    print("🚀 启动服务器...")
    print("📍 访问地址: http://127.0.0.1:8000")
    print("🔐 管理后台: http://127.0.0.1:8000/admin/login")
    print("👤 默认账号: admin / password")
    print("-" * 50)
    
    uvicorn.run(app, host="127.0.0.1", port=8000)

