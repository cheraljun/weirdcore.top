"""
管理员内容管理路由
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from backend.schemas.content import ContentCreate, ContentUpdate, ContentResponse
from backend.utils.file_storage import ContentStorage
from backend.routers.auth import get_current_admin

router = APIRouter()

@router.get("/{content_type}", response_model=List[ContentResponse])
async def get_all_content(
    content_type: str,
    admin: str = Depends(get_current_admin)
):
    """
    获取指定类型的所有内容
    :param content_type: research, media, activity, shop
    """
    if content_type not in ['research', 'media', 'activity', 'shop']:
        raise HTTPException(status_code=400, detail="无效的内容类型")
    
    storage = ContentStorage(content_type)
    posts = storage.get_all()
    return posts

@router.get("/{content_type}/{post_id}", response_model=ContentResponse)
async def get_content_by_id(
    content_type: str,
    post_id: str,
    admin: str = Depends(get_current_admin)
):
    """
    根据ID获取内容
    """
    if content_type not in ['research', 'media', 'activity', 'shop']:
        raise HTTPException(status_code=400, detail="无效的内容类型")
    
    storage = ContentStorage(content_type)
    post = storage.get_by_id(post_id)
    
    if not post:
        raise HTTPException(status_code=404, detail="内容不存在")
    
    return post

@router.post("/{content_type}", response_model=ContentResponse)
async def create_content(
    content_type: str,
    content: ContentCreate,
    admin: str = Depends(get_current_admin)
):
    """
    创建新内容
    """
    if content_type not in ['research', 'media', 'activity', 'shop']:
        raise HTTPException(status_code=400, detail="无效的内容类型")
    
    storage = ContentStorage(content_type)
    new_post = storage.create(content.dict())
    return new_post

@router.put("/{content_type}/{post_id}", response_model=ContentResponse)
async def update_content(
    content_type: str,
    post_id: str,
    content: ContentUpdate,
    admin: str = Depends(get_current_admin)
):
    """
    更新内容
    """
    if content_type not in ['research', 'media', 'activity', 'shop']:
        raise HTTPException(status_code=400, detail="无效的内容类型")
    
    storage = ContentStorage(content_type)
    updated_post = storage.update(post_id, content.dict())
    
    if not updated_post:
        raise HTTPException(status_code=404, detail="内容不存在")
    
    return updated_post

@router.delete("/{content_type}/{post_id}")
async def delete_content(
    content_type: str,
    post_id: str,
    admin: str = Depends(get_current_admin)
):
    """
    删除内容
    """
    if content_type not in ['research', 'media', 'activity', 'shop']:
        raise HTTPException(status_code=400, detail="无效的内容类型")
    
    storage = ContentStorage(content_type)
    success = storage.delete(post_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="内容不存在")
    
    return {"success": True, "message": "删除成功"}
