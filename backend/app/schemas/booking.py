from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from ..models.booking import BookingStatus

class BookingBase(BaseModel):
    train_id: int
    journey_date: date
    passenger_name: str
    passenger_age: int
    passenger_gender: str

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    booking_reference: str
    user_id: int
    seat_number: Optional[str]
    total_fare: int
    status: BookingStatus
    created_at: datetime

    class Config:
        from_attributes = True