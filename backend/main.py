"""
FastAPI主应用入口
提供静态文件服务和API路由
"""
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
app.mount("/media", StaticFiles(directory="frontend/media"), name="media")
app.mount("/pages", StaticFiles(directory="frontend/pages"), name="pages")

# 根路由 - 返回首页
@app.get("/")
async def read_root():
    return FileResponse("frontend/index.html")

# 页面路由
@app.get("/research")
async def research_page():
    return FileResponse("frontend/pages/research.html")

@app.get("/films")
async def films_page():
    return FileResponse("frontend/pages/films.html")

@app.get("/music")
async def music_page():
    return FileResponse("frontend/pages/music.html")

@app.get("/activity")
async def activity_page():
    return FileResponse("frontend/pages/activity.html")

@app.get("/shop")
async def shop_page():
    return FileResponse("frontend/pages/shop.html")

@app.get("/chat")
async def chat_page():
    return FileResponse("frontend/pages/chat.html")

# 健康检查
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# 导入API路由（后续会添加）
# from routers import research, films, music, activity, shop

# app.include_router(research.router, prefix="/api/research", tags=["research"])
# app.include_router(films.router, prefix="/api/films", tags=["films"])
# app.include_router(music.router, prefix="/api/music", tags=["music"])
# app.include_router(activity.router, prefix="/api/activity", tags=["activity"])
# app.include_router(shop.router, prefix="/api/shop", tags=["shop"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)

