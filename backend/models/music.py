"""音乐模型"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from datetime import datetime
from ..database import Base


class Music(Base):
    __tablename__ = "music"

    id = Column(Integer, primary_key=True, index=True)
    album = Column(String(200), nullable=False)
    artist = Column(String(200), nullable=False)
    listened_date = Column(DateTime, index=True)
    rating = Column(Float)  # 评分 (0-10)
    notes = Column(Text)  # 听后感
    cover_url = Column(String(500))  # 专辑封面路径
    spotify_url = Column(String(500))  # Spotify链接
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

