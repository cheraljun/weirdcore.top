"""电影模型"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Float
from datetime import datetime
from ..database import Base


class Film(Base):
    __tablename__ = "films"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    director = Column(String(200))
    year = Column(Integer)
    watched_date = Column(DateTime, index=True)
    rating = Column(Float)  # 评分 (0-10)
    notes = Column(Text)  # 观影笔记
    poster_url = Column(String(500))  # 海报图片路径
    is_television = Column(Integer, default=0)  # 0=电影, 1=电视剧
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

