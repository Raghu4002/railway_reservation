from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.location import Location
from ..models.user import User
from ..schemas.location import LocationCreate, LocationUpdate, LocationResponse
from ..utils.dependencies import get_current_active_user, get_admin_user

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.post("/", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    location: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    # Check if location already exists
    db_location = db.query(Location).filter(Location.code == location.code).first()
    if db_location:
        raise HTTPException(status_code=400, detail="Location code already exists")
    
    db_location = db.query(Location).filter(Location.name == location.name).first()
    if db_location:
        raise HTTPException(status_code=400, detail="Location name already exists")
    
    new_location = Location(**location.dict())
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    
    return new_location

@router.get("/", response_model=List[LocationResponse])
def get_all_locations(db: Session = Depends(get_db)):
    locations = db.query(Location).all()
    return locations

@router.get("/{location_id}", response_model=LocationResponse)
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    location_update: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    update_data = location_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_location, key, value)
    
    db.commit()
    db.refresh(db_location)
    
    return db_location

@router.delete("/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user)
):
    db_location = db.query(Location).filter(Location.id == location_id).first()
    if not db_location:
        raise HTTPException(status_code=404, detail="Location not found")
    
    db.delete(db_location)
    db.commit()
    
    return None