-- Enable Row Level Security
ALTER TABLE IF EXISTS public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- Authors Table
CREATE TABLE public.authors (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    author_id TEXT UNIQUE NOT NULL, -- The "AUTH001" style ID from sample data
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    city TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    role TEXT DEFAULT 'author' CHECK (role IN ('author', 'admin'))
);

-- Books Table
CREATE TABLE public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id TEXT UNIQUE NOT NULL, -- The "BK001" style ID
    author_id TEXT REFERENCES public.authors(author_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    isbn TEXT,
    genre TEXT,
    publication_date DATE,
    status TEXT NOT NULL,
    mrp NUMERIC,
    author_royalty_per_copy NUMERIC,
    total_copies_sold INTEGER DEFAULT 0,
    total_royalty_earned NUMERIC DEFAULT 0,
    royalty_paid NUMERIC DEFAULT 0,
    royalty_pending NUMERIC DEFAULT 0,
    last_royalty_payout_date DATE,
    print_partner TEXT,
    available_on TEXT[]
);

-- Tickets Table
CREATE TABLE public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id TEXT REFERENCES public.authors(author_id),
    book_id TEXT REFERENCES public.books(book_id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT, -- AI Classified
    priority TEXT, -- AI Assigned
    priority_score INTEGER, -- AI Assigned 0-100
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Responses Table
CREATE TABLE public.ticket_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies

-- Authors: authors can read their own profile, admins can read all
CREATE POLICY "Authors can view own profile" ON public.authors
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.authors
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid() AND role = 'admin')
    );

-- Books: authors can read their own books, admins can read all
CREATE POLICY "Authors can view own books" ON public.books
    FOR SELECT USING (
        author_id IN (SELECT author_id FROM public.authors WHERE id = auth.uid())
    );

CREATE POLICY "Admins can view all books" ON public.books
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid() AND role = 'admin')
    );

-- Tickets: authors can view/create own tickets, admins can view/update all
CREATE POLICY "Authors can view own tickets" ON public.tickets
    FOR SELECT USING (
        author_id IN (SELECT author_id FROM public.authors WHERE id = auth.uid())
    );

CREATE POLICY "Authors can create tickets" ON public.tickets
    FOR INSERT WITH CHECK (
        author_id IN (SELECT author_id FROM public.authors WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage all tickets" ON public.tickets
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid() AND role = 'admin')
    );

-- Responses
CREATE POLICY "User can view relevant responses" ON public.ticket_responses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                t.author_id IN (SELECT author_id FROM public.authors WHERE id = auth.uid())
                OR EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid() AND role = 'admin')
            )
        )
        AND (NOT is_internal OR EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid() AND role = 'admin'))
    );

CREATE POLICY "User can insert responses" ON public.ticket_responses
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tickets t
            WHERE t.id = ticket_id
            AND (
                t.author_id IN (SELECT author_id FROM public.authors WHERE id = auth.uid())
                OR EXISTS (SELECT 1 FROM public.authors WHERE id = auth.uid() AND role = 'admin')
            )
        )
    );
