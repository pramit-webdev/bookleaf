import os
import json
import time
from app.core.openai import openai_client
from app.core.config import settings

KNOWLEDGE_BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "core", "knowledge_base.txt")

with open(KNOWLEDGE_BASE_PATH, "r") as f:
    KNOWLEDGE_BASE = f.read()

CATEGORIES = [
    "Royalty & Payments",
    "ISBN & Metadata Issues",
    "Printing & Quality",
    "Distribution & Availability",
    "Book Status & Production Updates",
    "General Inquiry"
]

PRIORITIES = ["Critical", "High", "Medium", "Low"]

def call_openai_with_retry(func, *args, **kwargs):
    max_retries = 3
    for i in range(max_retries):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            if i == max_retries - 1:
                raise e
            time.sleep(1 * (i + 1))
    return None

def classify_ticket(subject: str, description: str) -> str:
    prompt = f"""
    You are a support classifier for BookLeaf Publishing.
    Classify the following support ticket into EXACTLY ONE of these categories:
    {', '.join(CATEGORIES)}

    Ticket Subject: {subject}
    Ticket Description: {description}

    Return ONLY the category name.
    """
    
    try:
        response = call_openai_with_retry(
            openai_client.chat.completions.create,
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        category = response.choices[0].message.content.strip()
        return category if category in CATEGORIES else "General Inquiry"
    except:
        return "General Inquiry"

def assign_priority(subject: str, description: str) -> dict:
    prompt = f"""
    You are a support prioritizer for BookLeaf Publishing.
    Assign a priority (Critical, High, Medium, Low) and a priority score (0-100) to the following support ticket.
    
    Guidelines:
    - Critical (90-100): ISBN errors on live books, missing royalties overdue for months, major print defects in bulk author copies.
    - High (70-89): Distribution sync issues, urgent production delays.
    - Medium (40-69): General metadata updates, standard royalty queries within cycle.
    - Low (0-39): Bio updates, general "how-to" questions.

    Ticket Subject: {subject}
    Ticket Description: {description}

    Return JSON format: {{"priority": "...", "score": 80}}
    """
    
    try:
        response = call_openai_with_retry(
            openai_client.chat.completions.create,
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            response_format={"type": "json_object"}
        )
        result = json.loads(response.choices[0].message.content)
        return {
            "priority": result.get("priority", "Medium") if result.get("priority") in PRIORITIES else "Medium",
            "score": result.get("score", 50)
        }
    except:
        return {"priority": "Medium", "score": 50}

def generate_draft_response(subject: str, description: str, ticket_history: list = None) -> str:
    history_context = ""
    if ticket_history:
        # Keep only last 5 messages for token efficiency (Cost Awareness)
        recent_history = ticket_history[-5:]
        history_context = "\nRecent Conversation History:\n"
        for msg in recent_history:
            role = "Staff" if msg.get("sender_role") == "admin" or not msg.get("is_author") else "Author"
            history_context += f"- {role}: {msg['content']}\n"

    prompt = f"""
    You are an empathetic and professional BookLeaf Author Support representative. 
    Draft a response to the author's query using the Knowledge Base and context provided.
    
    Tone & Content Guidelines:
    1. Acknowledge and empathize with the author's concern first.
    2. Be specific: use actual numbers, dates, and policies from the Knowledge Base.
    3. If something is BookLeaf's fault (delays, errors), own it directly.
    4. Provide clear timelines (e.g., 24-48 hours for sync, 5-7 days for printing).
    5. Always end with a clear next step for the author or BookLeaf.
    6. SOUND LIKE A HUMAN PARTNER, NOT A BOT.

    Knowledge Base:
    {KNOWLEDGE_BASE}

    Ticket Subject: {subject}
    Ticket Description: {description}
    {history_context}
    
    Draft the response.
    """
    
    try:
        response = call_openai_with_retry(
            openai_client.chat.completions.create,
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except:
        return "I'm sorry, I'm having trouble generating a draft right now. Please respond manually based on the BookLeaf Knowledge Base."
