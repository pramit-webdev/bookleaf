import asyncio
import json
from app.core.supabase import supabase_admin

async def audit_seeding():
    print("--- Seeding Audit Report ---")
    
    # 1. Load Sample JSON
    with open("bookleaf_sample_data.json", "r") as f:
        sample_data = json.load(f)
    
    expected_authors_count = len(sample_data["authors"])
    expected_books_count = sum(len(author.get("books", [])) for author in sample_data["authors"])
    
    # 2. Query Database (Fixed syntax)
    # To get just the count, we use head=True or select a single column without grouping issues for exact count
    db_authors = supabase_admin.table("authors").select("*", count="exact").execute()
    db_books = supabase_admin.table("books").select("*", count="exact").execute()
    
    actual_authors_count = db_authors.count
    actual_books_count = db_books.count
    
    print(f"\n[Count Audit]")
    print(f"Authors: Expected {expected_authors_count}, Found {actual_authors_count}")
    print(f"Books: Expected {expected_books_count}, Found {actual_books_count}")
    
    if actual_authors_count == expected_authors_count and actual_books_count == expected_books_count:
        print("✅ Counts Match.")
    else:
        print(f"❌ COUNTS MISMATCH: Auth: {actual_authors_count}/{expected_authors_count}, Books: {actual_books_count}/{expected_books_count}")

    # 3. Data Integrity Sample Check
    print(f"\n[Integrity Sample Check]")
    target_book_id = "BK001"
    book_db = supabase_admin.table("books").select("*").eq("book_id", target_book_id).execute()
    
    if book_db.data:
        book = book_db.data[0]
        print(f"Checking {target_book_id}: {book['title']}")
        print(f"Status: {book['status']}")
        print(f"Sales: {book['total_copies_sold']}")
        print("✅ Sample record exists.")
    else:
        print(f"❌ Could not find {target_book_id}.")

    # 4. Auth Audit
    auth_users = supabase_admin.auth.admin.list_users()
    # Authors + 1 admin
    print(f"\n[Auth Audit]")
    print(f"Supabase Auth Users: {len(auth_users.users)}")
    
    print("\n--- Audit Complete ---")

if __name__ == "__main__":
    asyncio.run(audit_seeding())
