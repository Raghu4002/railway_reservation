from .auth import router as auth_router
from .users import router as users_router
from .locations import router as locations_router
from .trains import router as trains_router
from .bookings import router as bookings_router

__all__ = [
    "auth_router",
    "users_router", 
    "locations_router",
    "trains_router",
    "bookings_router"
]