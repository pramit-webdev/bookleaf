# BookLeaf Author Support Portal - Backend Documentation

This document provides a comprehensive end-to-end technical overview of the BookLeaf backend system, from database architecture to AI integration and security.

---

## 1. System Overview
The BookLeaf Support Portal is a specialized communication layer between authors and the BookLeaf administrative team, enhanced by an AI engine for classification and response drafting.

### Tech Stack
- **Core Framework**: FastAPI (Python 3.12+)
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **AI Engine**: OpenAI GPT-4o-mini
- **Authentication**: JWT-based (linked to Supabase Auth)
- **Environment**: Linux/Render-ready

---

## 2. Architecture & Data Flow
The system follows a three-tier architecture:
1.  **FastAPI (Logic Layer)**: Manages requests, authentication, and orchestrates the AI service.
2.  **Supabase (Persistence Layer)**: Securely stores author data, books, and tickets with strict data isolation.
3.  **OpenAI (Intelligence Layer)**: Provides automated ticket metadata and drafts based on a custom Knowledge Base.

---

## 3. Data Models (Database Schema)

### `authors`
- **Purpose**: Stores author profile data.
- **Key Fields**: `author_id` (Text ID), `name`, `email` (Unique), `role` (author/admin).

### `books`
- **Purpose**: Stores book sales and metadata.
- **Key Fields**: `book_id`, `title`, `isbn`, `total_copies_sold`, `royalty_pending`.

### `tickets`
- **Purpose**: Base storage for support queries.
- **Key Fields**: `id` (UUID), `author_id`, `category` (AI), `priority` (AI), `status` (Open/In Progress/Resolved).

### `ticket_responses`
- **Purpose**: Threaded communication.
- **Key Fields**: `ticket_id`, `sender_id`, `content`, `is_internal` (Boolean - Private for admins).

---

## 4. API Endpoints

### 🔐 Auth
- `POST /auth/login`: Authenticates users and returns a JWT.

### 📚 Books
- `GET /books/`: Returns books for the logged-in author. Admins see all books.

### 🎫 Tickets
- `POST /tickets/`: Creates a ticket. 
  - *Automated Logic*: Automatically detects `author_id` from the token. Triggers AI classification.
- `GET /tickets/`: Lists tickets. Filters automatically based on role (Authors only see their own).
- `GET /tickets/{id}`: Full ticket details with threaded responses.
  - *Security*: Automatically hides `is_internal` responses from authors.
- `PATCH /tickets/{id}`: Admin-only status and priority updates.
- `POST /tickets/{id}/responses`: Adds a reply to a ticket.

### 🤖 AI Services
- `GET /tickets/{id}/draft`: (Admin-only) Generates a draft response using the Knowledge Base.

---

## 5. AI Integration & Knowledge Base
The system utilizes a custom **Knowledge Base** (`app/core/knowledge_base.txt`) covering:
- **Royalty Policies** (80/20 split, quarterly payouts).
- **ISBN Procedures** (In-house assignment).
- **Printing Standards** (5–7 business days).

**AI Logic**:
1.  **Classification**: Maps descriptions to categories like `ISBN & Metadata Issues` or `Royalty & Payments`.
2.  **Priority**: Assigns a numeric `priority_score` (0-100) based on urgency.
3.  **Drafting**: Uses RAG-like context injection to provide accurate, policy-compliant responses.

---

## 6. Security Protocols
- **JWT Verification**: Every request is validated against the Supabase secret.
- **Row Level Security (RLS)**: PostgreSQL policies prevent horizontal escalation between authors.
- **Identity Enforcement**: The backend overrides user-provided IDs to ensure an author cannot submit a ticket "on behalf" of someone else.
- **Internal Note Isolation**: Strict server-side filtering prevents technical/internal notes from leaking to front-facing author portals.

---

## 7. Setup & Deployment
- **Local Dev**: Use `uvicorn app.main:app` within a virtual environment.
- **Configuration**: Managed via `.env` (requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and `SUPABASE_JWT_SECRET`).
- **Production**: Seamless deployment via the included `render.yaml`.

---

**Documentation Conclusion**: This backend is designed for high-trust, AI-enhanced support management for self-publishing authors.
