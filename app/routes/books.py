from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.supabase import supabase
from app.core.auth import get_current_user
from app.models.schemas import Book

router = APIRouter()

@router.get("/", response_model=List[Book])
async def get_books(current_user: dict = Depends(get_current_user)):
    try:
        query = supabase.table("books").select("*")
        
        # If not admin, filter by author_id
        if current_user["role"] != "admin":
            if not current_user["author_id"]:
                return []
            query = query.eq("author_id", current_user["author_id"])
            
        res = query.execute()
        return res.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{book_id}", response_model=Book)
async def get_book(book_id: str, current_user: dict = Depends(get_current_user)):
    try:
        query = supabase.table("books").select("*").eq("book_id", book_id)
        
        res = query.execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Book not found")
            
        book = res.data[0]
        
        # Check permissions
        if current_user["role"] != "admin" and book["author_id"] != current_user["author_id"]:
            raise HTTPException(status_code=403, detail="Permission denied")
            
        return book
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
