from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.core.supabase import supabase, supabase_admin
from app.core.auth import get_current_user, require_admin
from app.models.schemas import Ticket, TicketCreate, TicketUpdate, TicketResponse, TicketResponseCreate
from app.services.ai_service import classify_ticket, assign_priority, generate_draft_response
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=Ticket)
async def create_ticket(ticket: TicketCreate, current_user: dict = Depends(get_current_user)):
    try:
        # Security: Auto-assign author_id for non-admins
        if current_user["role"] != "admin":
            ticket.author_id = current_user["author_id"]
        elif not ticket.author_id:
            raise HTTPException(status_code=400, detail="Admin must provide an author_id")
        
        # AI Processing
        category = classify_ticket(ticket.subject, ticket.description)
        priority_info = assign_priority(ticket.subject, ticket.description)
        
        ticket_data = {
            "author_id": ticket.author_id,
            "book_id": ticket.book_id,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": category,
            "priority": priority_info["priority"],
            "priority_score": priority_info["score"],
            "status": "Open"
        }
        
        res = supabase.table("tickets").insert(ticket_data).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Ticket])
async def get_tickets(status: Optional[str] = None, category: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    try:
        query = supabase.table("tickets").select("*, responses:ticket_responses(*)")
        
        if current_user["role"] != "admin":
            query = query.eq("author_id", current_user["author_id"])
        
        if status:
            query = query.eq("status", status)
        if category:
            query = query.eq("category", category)
            
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
        res = supabase.table("tickets").select("*, responses:ticket_responses(*)").eq("id", ticket_id).execute()
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
        ticket_res = supabase.table("tickets").select("*").eq("id", ticket_id).execute()
        if not ticket_res.data:
            raise HTTPException(status_code=404, detail="Ticket not found")
            
        ticket = ticket_res.data[0]
        draft = generate_draft_response(ticket["subject"], ticket["description"])
        return {"draft": draft}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
