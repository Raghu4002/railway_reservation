from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import secrets
from ..database import get_db
from ..models.booking import Booking, BookingStatus
from ..models.train import Train
from ..models.user import User
from ..schemas.booking import BookingCreate, BookingResponse
from ..utils.dependencies import get_current_active_user, get_admin_user

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def generate_booking_reference() -> str:
    return f"TKT{secrets.token_hex(4).upper()}"

@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if train exists
    train = db.query(Train).filter(Train.id == booking.train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    
    # Check if seats are available
    if train.available_seats <= 0:
        raise HTTPException(status_code=400, detail="No seats available")
    
    # Check if journey date is valid (not in the past)
    if booking.journey_date < date.today():
        raise HTTPException(status_code=400, detail="Journey date cannot be in the past")
    
    # Generate booking reference
    booking_reference = generate_booking_reference()
    
    # Create booking
    new_booking = Booking(
        booking_reference=booking_reference,
        user_id=current_user.id,
        train_id=booking.train_id,
        journey_date=booking.journey_date,
        passenger_name=booking.passenger_name,
        passenger_age=booking.passenger_age,
        passenger_gender=booking.passenger_gender,
        total_fare=train.fare,
        status=BookingStatus.CONFIRMED,
        seat_number=f"S{train.total_seats - train.available_seats + 1}"
    )
    
    # Update available seats
    train.available_seats -= 1
    
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    
    return new_booking

@router.get("/my-bookings", response_model=List[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    bookings = db.query(Booking).filter(Booking.user_id == current_user.id).all()
    return bookings

@router.get("/all", response_model=List[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    bookings = db.query(Booking).all()
    return bookings

@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Users can only view their own bookings, admins can view all
    if not current_user.is_admin and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this booking")
    
    return booking

@router.delete("/{booking_id}", status_code=status.HTTP_200_OK)
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Users can only cancel their own bookings, admins can cancel any
    if not current_user.is_admin and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to cancel this booking")
    
    if booking.status == BookingStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Booking already cancelled")
    
    # Cancel booking
    booking.status = BookingStatus.CANCELLED
    
    # Restore seat availability
    train = db.query(Train).filter(Train.id == booking.train_id).first()
    if train:
        train.available_seats += 1
    
    db.commit()
    
    return {"message": "Booking cancelled successfully", "booking_reference": booking.booking_reference}