from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationBase(BaseModel):
    name: str
    code: str
    city: str
    state: str

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None

class LocationResponse(LocationBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True