from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.supabase import supabase
from app.core.config import settings
from jose import jwt, JWTError

security = HTTPBearer()

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    try:
        # Supabase uses JWT. We can verify it or use Supabase client to get user.
        # The easiest way is using the Supabase client:
        user_res = supabase.auth.get_user(token.credentials)
        if not user_res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
            )
        
        # Get user role and author_id from public.authors table
        author_res = supabase.table("authors").select("*").eq("id", user_res.user.id).execute()
        
        if not author_res.data:
            # Maybe the user is created in auth but not in public.authors yet
            return {
                "id": user_res.user.id,
                "email": user_res.user.email,
                "role": "author", # Default
                "author_id": None
            }
            
        author_data = author_res.data[0]
        return {
            "id": user_res.user.id,
            "email": user_res.user.email,
            "role": author_data.get("role", "author"),
            "author_id": author_data.get("author_id")
        }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

def require_admin(user: dict = Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
