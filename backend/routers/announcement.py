"""
公告管理路由 - 支持富文本和图片
"""
from fastapi import APIRouter, HTTPException, Depends
from pathlib import Path
import json
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from backend.routers.auth import get_current_admin

router = APIRouter()

# 公告文件路径
ANNOUNCEMENT_FILE = Path(__file__).parent.parent.parent / "admin_data" / "announcement.json"

class AnnouncementItem(BaseModel):
    """公告项数据模型"""
    type: str  # 'text' 或 'image'
    content: str  # 文字内容或图片URL

class AnnouncementData(BaseModel):
    """公告数据模型"""
    items: List[AnnouncementItem]
    status: str = "published"  # published 或 draft

def load_announcement():
    """加载公告内容"""
    if not ANNOUNCEMENT_FILE.exists():
        return {
            "items": [{"type": "text", "content": "欢迎来到 weirdcore store！"}],
            "status": "published",
            "updated_at": datetime.now().isoformat()
        }
    
    try:
        with open(ANNOUNCEMENT_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # 兼容旧格式
            if "content" in data and "items" not in data:
                return {
                    "items": [{"type": "text", "content": data["content"]}],
                    "status": "published",
                    "updated_at": data.get("updated_at", datetime.now().isoformat())
                }
            return data
    except:
        return {
            "items": [{"type": "text", "content": "欢迎来到 weirdcore store！"}],
            "status": "published",
            "updated_at": datetime.now().isoformat()
        }

def save_announcement(items: List[dict], status: str = "published"):
    """保存公告内容"""
    ANNOUNCEMENT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    data = {
        "items": items,
        "status": status,
        "updated_at": datetime.now().isoformat()
    }
    
    with open(ANNOUNCEMENT_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    return data

@router.get("")
async def get_announcement():
    """获取公告内容（公开接口，只返回已发布的）"""
    data = load_announcement()
    # 只有发布状态才返回内容
    if data.get("status") == "draft":
        return {
            "items": [],
            "status": "draft",
            "updated_at": data.get("updated_at")
        }
    return data

@router.get("/admin")
async def get_announcement_admin(admin: str = Depends(get_current_admin)):
    """获取公告内容（管理员接口，包括草稿）"""
    return load_announcement()

@router.put("")
async def update_announcement(
    data: AnnouncementData,
    admin: str = Depends(get_current_admin)
):
    """更新公告内容（需要管理员权限）"""
    if not data.items or len(data.items) == 0:
        raise HTTPException(status_code=400, detail="公告内容不能为空")
    
    items = [item.dict() for item in data.items]
    result = save_announcement(items, data.status)
    return {"success": True, "data": result}
