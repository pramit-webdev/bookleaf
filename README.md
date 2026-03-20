# BookLeaf Author Support Portal Backend

A production-ready FastAPI backend for handling author support queries with AI-powered ticket classification, priority scoring, and response drafting.

## Features
- **FastAPI Backend**: Structured and scalable API with Pydantic validation.
- **Supabase Integration**: Auth, PostgreSQL database, and Row Level Security (RLS).
- **AI Integration**: Automatic ticket classification and priority scoring using OpenAI GPT-4o-mini.
- **AI Drafted Responses**: Context-aware response drafting based on the BookLeaf Knowledge Base.
- **Render Ready**: Configuration included for seamless deployment.

## Tech Stack
- **Framework**: FastAPI (Python 3.10+)
- **Database**: Supabase / PostgreSQL
- **AI**: OpenAI API
- **Auth**: Supabase Auth (JWT)
- **Deployment**: Render

---

## Setup Instructions

### 1. Supabase Setup
- Create a new project on [Supabase](https://supabase.com).
- Run the SQL schema provided in `sql/schema.sql` in the Supabase SQL Editor.
- Note your Project URL, Anon Key, and Service Role Key.

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### 3. Local Development
```bash
# Install dependencies
pip install -r requirements.txt

# Seed the database
python -m scripts.seed_db

# Run the server
uvicorn app.main:app --reload
```

### 5. API Testing (Postman)
A Postman collection is provided in `bookleaf_postman_collection.json`.
- Import the JSON file into Postman.
- The `base_url` variable is set to your Render URL by default.
- Running the **Login** request will automatically save the `access_token` for subsequent requests in the collection.
- For requests requiring a `ticket_id`, copy a UUID from a created ticket and update the collection variable.

---

## API Documentation

Once running, visit:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Key Endpoints
- `POST /auth/login`: Login for authors/admins.
- `GET /books`: List books (filtered by author role).
- `POST /tickets`: Submit a support ticket (Triggers AI).
- `GET /tickets`: Ticket queue with filtering.
- `GET /tickets/{id}/draft`: Get AI-drafted response (Admin only).
- `POST /tickets/{id}/responses`: Add a response to a ticket.

---

## Architecture & Design Decisions

### 1. Database & Security (Supabase RLS)
We use Row Level Security (RLS) to ensure data isolation. Authors can only view their own books and tickets, while Admins have full access. This is enforced at the database level for maximum security.

### 2. AI Service & Integration Strategy
The AI service is decoupled from the routes for cleaner maintenance. We use `gpt-4o-mini` for the following reasons:
- **Cost Awareness**: It offers a 10x lower price point compared to GPT-4o while maintaining high accuracy for classification and drafting.
- **Performance**: It provides near-instant responses (low latency), essential for a responsive admin interface.
- **Context Injection**: We use a custom Knowledge Base and recent ticket history (last 5 messages) to provide precise, policy-aligned drafts.

**Integration Strategy**:
- **Prompt Engineering**: System instructions are designed to match BookLeaf's empathetic and professional tone.
- **Cost Efficiency**: We limit context window to relevant history and the core knowledge base.
- **Graceful Degradation**: If the AI API is down, tickets are assigned default values ("General Inquiry", "Medium" priority), and admins are notified to respond manually.
- **Error Resilience**: Automatic retries (with exponential backoff) are implemented for all LLM calls.

### 3. Graceful Degradation
As noted above, if the OpenAI API is unavailable, the ticket is still created with "General Inquiry" and "Medium" priority by default, allowing the admin team to process it manually without downtime.

### 4. Role-Based Access Control (RBAC)
We differentiate between `author` and `admin` roles. Admins have access to internal notes and can see the entire ticket queue across all authors.

---

## Future Improvements
- **Real-time Updates**: Implement WebSockets for instant ticket status updates on the author dashboard.
- **File Uploads**: Integrate Supabase Storage for ticket attachments.
- **Unit Tests**: comprehensive test suite for AI prompt resilience.
