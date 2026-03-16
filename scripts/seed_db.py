import json
import os
import asyncio
from typing import List, Dict
from app.core.supabase import supabase_admin
from app.core.config import settings

async def seed_data():
    with open("bookleaf_sample_data.json", "r") as f:
        data = json.load(f)

    authors = data["authors"]
    
    for author_data in authors:
        # 1. Create dummy user in Supabase Auth (simplified for seeding)
        # Note: In a real production-ready setup, we'd use auth.admin.create_user
        # but for this script we'll just insert into public.authors directly
        # with generated UUIDs if we don't want to mess with auth yet.
        # However, to test RLS, we DO need real auth users.
        
        email = author_data["email"]
        password = "password123" # Default password for seeding
        
        # Try to create user in Auth
        try:
            res = supabase_admin.auth.admin.create_user({
                "email": email,
                "password": password,
                "email_confirm": True
            })
            user_id = res.user.id
        except Exception as e:
            print(f"Error creating auth user {email}: {e}")
            # If user already exists, get their ID
            user_res = supabase_admin.table("authors").select("id").eq("email", email).execute()
            if user_res.data:
                user_id = user_res.data[0]["id"]
            else:
                continue

        # 2. Insert into public.authors
        author_record = {
            "id": user_id,
            "author_id": author_data["author_id"],
            "name": author_data["name"],
            "email": author_data["email"],
            "phone": author_data["phone"],
            "city": author_data["city"],
            "joined_date": author_data["joined_date"]
        }
        
        supabase_admin.table("authors").upsert(author_record).execute()
        print(f"Seeded author: {author_data['name']}")

        # 3. Insert Books
        for book_data in author_data["books"]:
            book_record = {
                "author_id": author_data["author_id"],
                "book_id": book_data["book_id"],
                "title": book_data["title"],
                "isbn": book_data["isbn"],
                "genre": book_data["genre"],
                "publication_date": book_data["publication_date"],
                "status": book_data["status"],
                "mrp": book_data["mrp"],
                "author_royalty_per_copy": book_data["author_royalty_per_copy"],
                "total_copies_sold": book_data["total_copies_sold"],
                "total_royalty_earned": book_data["total_royalty_earned"],
                "royalty_paid": book_data["royalty_paid"],
                "royalty_pending": book_data["royalty_pending"],
                "last_royalty_payout_date": book_data["last_royalty_payout_date"],
                "print_partner": book_data["print_partner"],
                "available_on": book_data["available_on"]
            }
            supabase_admin.table("books").upsert(book_record).execute()
            print(f"Seeded book: {book_data['title']}")

if __name__ == "__main__":
    asyncio.run(seed_data())
