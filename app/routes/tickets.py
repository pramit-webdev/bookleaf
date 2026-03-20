from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import List, Optional
from app.core.supabase import supabase, supabase_admin
from app.core.auth import get_current_user, require_admin
from app.models.schemas import Ticket, TicketCreate, TicketUpdate, TicketResponse, TicketResponseCreate
from app.services.ai_service import classify_ticket, assign_priority, generate_draft_response
from datetime import datetime

router = APIRouter()

def process_ticket_ai(ticket_id: str, subject: str, description: str):
    try:
        category = classify_ticket(subject, description)
        priority_info = assign_priority(subject, description)
        supabase.table("tickets").update({
            "category": category,
            "priority": priority_info["priority"],
            "priority_score": priority_info["score"]
        }).eq("id", ticket_id).execute()
    except Exception as e:
        print(f"Background AI Task failed for ticket {ticket_id}: {e}")

@router.post("/", response_model=Ticket)
async def create_ticket(ticket: TicketCreate, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    try:
        # Security: Auto-assign author_id for non-admins
        if current_user["role"] != "admin":
            ticket.author_id = current_user["author_id"]
        elif not ticket.author_id:
            raise HTTPException(status_code=400, detail="Admin must provide an author_id")
            
        # Ensure book_id is explicitly set to None if it's an empty string
        if ticket.book_id == "":
            ticket.book_id = None
        
        # Initial Insert without waiting for AI
        ticket_data = {
            "author_id": ticket.author_id,
            "book_id": ticket.book_id,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": "Pending",
            "priority": "Medium",
            "priority_score": 50,
            "status": "Open"
        }
        
        res = supabase.table("tickets").insert(ticket_data).execute()
        ticket_id = res.data[0]["id"]
        
        # Fire and forget AI background tasks
        background_tasks.add_task(process_ticket_ai, ticket_id, ticket.subject, ticket.description)
        
        # Fetch with joins
        res = supabase.table("tickets").select("*, book:books!book_id(*), author:authors!author_id(*), responses:ticket_responses(*)").eq("id", ticket_id).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Ticket])
async def get_tickets(
    status: Optional[str] = None, 
    category: Optional[str] = None, 
    priority: Optional[str] = None,
    assignee_id: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        query = supabase.table("tickets").select("*, book:books!book_id(*), author:authors!author_id(*), responses:ticket_responses(*)")
        
        if current_user["role"] != "admin":
            query = query.eq("author_id", current_user["author_id"])
        
        if status:
            query = query.eq("status", status)
        if category:
            query = query.eq("category", category)
        if priority:
            query = query.eq("priority", priority)
        if assignee_id:
            query = query.eq("assignee_id", assignee_id)
        if from_date:
            query = query.gte("created_at", from_date)
        if to_date:
            query = query.lte("created_at", to_date)
            
        # Admin sorting: most urgent first, then oldest unresolved first
        if current_user["role"] == "admin":
            # Note: Complex multi-column sorting might be limited in thin-client Supabase
            # Simple approach: primary sort by created_at (oldest first)
            res = query.order("created_at", desc=False).execute()
        else:
            res = query.order("created_at", desc=True).execute()
            
        tickets = res.data
        
        # Filter internal responses for non-admins
        if current_user["role"] != "admin":
            for ticket in tickets:
                if "responses" in ticket:
                    ticket["responses"] = [r for r in ticket["responses"] if not r["is_internal"]]
        
        return tickets
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str, current_user: dict = Depends(get_current_user)):
    try:
        res = supabase.table("tickets").select("*, book:books!book_id(*), author:authors!author_id(*), responses:ticket_responses(*)").eq("id", ticket_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
            
        ticket = res.data[0]
        if current_user["role"] != "admin" and ticket["author_id"] != current_user["author_id"]:
            raise HTTPException(status_code=403, detail="Permission denied")
            
        # Filter internal responses for non-admins
        if current_user["role"] != "admin" and "responses" in ticket:
            ticket["responses"] = [r for r in ticket["responses"] if not r["is_internal"]]
            
        return ticket
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{ticket_id}", response_model=Ticket)
async def update_ticket(ticket_id: str, ticket_in: TicketUpdate, current_user: dict = Depends(require_admin)):
    try:
        update_data = ticket_in.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Convert UUIDs to strings for Supabase if necessary
        if "assignee_id" in update_data and update_data["assignee_id"]:
            update_data["assignee_id"] = str(update_data["assignee_id"])
            
        res = supabase.table("tickets").update(update_data).eq("id", ticket_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{ticket_id}/responses", response_model=TicketResponse)
async def add_response(ticket_id: str, response_in: TicketResponseCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Check if ticket exists and permission
        ticket_res = supabase.table("tickets").select("author_id").eq("id", ticket_id).execute()
        if not ticket_res.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
            
        ticket_author_id = ticket_res.data[0]["author_id"]
        if current_user["role"] != "admin" and ticket_author_id != current_user["author_id"]:
            raise HTTPException(status_code=403, detail="Permission denied")
            
        response_data = {
            "ticket_id": ticket_id,
            "sender_id": current_user["id"],
            "content": response_in.content,
            "is_internal": response_in.is_internal if current_user["role"] == "admin" else False
        }
        
        res = supabase.table("ticket_responses").insert(response_data).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{ticket_id}/draft")
async def get_draft(ticket_id: str, current_user: dict = Depends(require_admin)):
    try:
        # Fetch ticket with responses for context
        res = supabase.table("tickets").select("*, responses:ticket_responses(*)").eq("id", ticket_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
            
        ticket = res.data[0]
        
        # Fetch book context for AI grounding
        book_context = None
        if ticket.get("book_id"):
            book_res = supabase.table("books").select("*").eq("book_id", ticket["book_id"]).execute()
            if book_res.data:
                book = book_res.data[0]
                book_context = {
                    "Title": book.get("title"),
                    "ISBN": book.get("isbn"),
                    "Status": book.get("status"),
                    "Copies Sold": book.get("total_copies_sold"),
                    "Royalty Pending": f"₹{book.get('royalty_pending', 0)}",
                    "Total Royalty Earned": f"₹{book.get('total_royalty_earned', 0)}"
                }

        # Format history for the AI service
        history = []
        if "responses" in ticket:
            for r in ticket["responses"]:
                history.append({
                    "content": r["content"],
                    "is_author": r["sender_id"] == ticket["author_id"],
                    "sender_role": "admin" if r["sender_id"] != ticket["author_id"] else "author"
                })
        
        draft, ai_failed = generate_draft_response(
            ticket["subject"], 
            ticket["description"], 
            ticket_history=history,
            book_context=book_context
        )
        return {"draft": draft, "ai_failed": ai_failed}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
