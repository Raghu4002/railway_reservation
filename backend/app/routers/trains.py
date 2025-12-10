from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models.train import Train
from ..models.location import Location
from ..models.user import User
from ..schemas.train import TrainCreate, TrainUpdate, TrainResponse
from ..utils.dependencies import get_current_active_user, get_admin_user

router = APIRouter(prefix="/trains", tags=["Trains"])

@router.post("/", response_model=TrainResponse, status_code=status.HTTP_201_CREATED)
def create_train(
    train: TrainCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    # Check if train number already exists
    db_train = db.query(Train).filter(Train.train_number == train.train_number).first()
    if db_train:
        raise HTTPException(status_code=400, detail="Train number already exists")
    
    # Verify locations exist
    source = db.query(Location).filter(Location.id == train.source_id).first()
    destination = db.query(Location).filter(Location.id == train.destination_id).first()
    
    if not source or not destination:
        raise HTTPException(status_code=404, detail="Source or destination location not found")
    
    if train.source_id == train.destination_id:
        raise HTTPException(status_code=400, detail="Source and destination cannot be same")
    
    new_train = Train(
        **train.dict(),
        available_seats=train.total_seats
    )
    
    db.add(new_train)
    db.commit()
    db.refresh(new_train)
    
    return new_train

@router.get("/", response_model=List[TrainResponse])
def get_all_trains(db: Session = Depends(get_db)):
    trains = db.query(Train).all()
    return trains

@router.get("/search", response_model=List[TrainResponse])
def search_trains(
    source_id: Optional[int] = Query(None),
    destination_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Train)
    
    if source_id:
        query = query.filter(Train.source_id == source_id)
    
    if destination_id:
        query = query.filter(Train.destination_id == destination_id)
    
    trains = query.all()
    return trains

@router.get("/{train_id}", response_model=TrainResponse)
def get_train(train_id: int, db: Session = Depends(get_db)):
    train = db.query(Train).filter(Train.id == train_id).first()
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    return train

@router.put("/{train_id}", response_model=TrainResponse)
def update_train(
    train_id: int,
    train_update: TrainUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_train = db.query(Train).filter(Train.id == train_id).first()
    if not db_train:
        raise HTTPException(status_code=404, detail="Train not found")
    
    update_data = train_update.dict(exclude_unset=True)
    
    # If total_seats is updated, adjust available_seats proportionally
    if "total_seats" in update_data:
        old_total = db_train.total_seats
        new_total = update_data["total_seats"]
        booked_seats = old_total - db_train.available_seats
        update_data["available_seats"] = new_total - booked_seats
    
    for key, value in update_data.items():
        setattr(db_train, key, value)
    
    db.commit()
    db.refresh(db_train)
    
    return db_train

@router.delete("/{train_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_train(
    train_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_train = db.query(Train).filter(Train.id == train_id).first()
    if not db_train:
        raise HTTPException(status_code=404, detail="Train not found")
    
    db.delete(db_train)
    db.commit()
    
    return None