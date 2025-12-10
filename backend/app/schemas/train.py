from pydantic import BaseModel
from typing import Optional
from datetime import datetime, time

class TrainBase(BaseModel):
    train_number: str
    train_name: str
    source_id: int
    destination_id: int
    departure_time: time
    arrival_time: time
    total_seats: int
    fare: int

class TrainCreate(TrainBase):
    pass

class TrainUpdate(BaseModel):
    train_number: Optional[str] = None
    train_name: Optional[str] = None
    source_id: Optional[int] = None
    destination_id: Optional[int] = None
    departure_time: Optional[time] = None
    arrival_time: Optional[time] = None
    total_seats: Optional[int] = None
    fare: Optional[int] = None

class TrainResponse(TrainBase):
    id: int
    available_seats: int
    created_at: datetime

    class Config:
        from_attributes = True