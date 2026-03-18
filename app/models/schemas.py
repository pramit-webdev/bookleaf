from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import date, datetime
from uuid import UUID

# Author Schemas
class AuthorBase(BaseModel):
    author_id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    city: Optional[str] = None
    role: str = "author"

class AuthorCreate(AuthorBase):
    pass

class Author(AuthorBase):
    id: UUID
    joined_date: date

    class Config:
        from_attributes = True

# Book Schemas
class BookBase(BaseModel):
    book_id: str
    title: str
    isbn: Optional[str] = None
    genre: Optional[str] = None
    publication_date: Optional[date] = None
    status: str
    mrp: Optional[float] = None
    author_royalty_per_copy: Optional[float] = None
    total_copies_sold: int = 0
    total_royalty_earned: float = 0.0
    royalty_paid: float = 0.0
    royalty_pending: float = 0.0
    last_royalty_payout_date: Optional[date] = None
    print_partner: Optional[str] = None
    available_on: List[str] = []

class Book(BookBase):
    id: UUID
    author_id: str

    class Config:
        from_attributes = True

# Ticket Schemas
class TicketResponseBase(BaseModel):
    content: str
    is_internal: bool = False

class TicketResponseCreate(TicketResponseBase):
    pass

class TicketResponse(TicketResponseBase):
    id: UUID
    ticket_id: UUID
    sender_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class TicketBase(BaseModel):
    subject: str
    description: str
    book_id: Optional[str] = None

class TicketCreate(TicketBase):
    author_id: Optional[str] = None

class TicketUpdate(BaseModel):
    category: Optional[str] = None
    priority: Optional[str] = None
    priority_score: Optional[int] = None
    status: Optional[str] = None

class Ticket(TicketBase):
    id: UUID
    author_id: str
    category: Optional[str]
    priority: Optional[str]
    priority_score: Optional[int]
    status: str
    created_at: datetime
    updated_at: datetime
    responses: List[TicketResponse] = []

    class Config:
        from_attributes = True
