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

    Return JSON format: {{"category": "..."}}
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
        category = result.get("category")
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

def generate_draft_response(subject: str, description: str, ticket_history: list = None, book_context: dict = None) -> tuple[str, bool]:
    history_context = ""
    if ticket_history:
        # Keep only last 3 messages for strict token efficiency
        recent_history = ticket_history[-3:]
        history_context = "\nRecent Conversation History:\n"
        for msg in recent_history:
            role = "Staff" if msg.get("sender_role") == "admin" or not msg.get("is_author") else "Author"
            history_context += f"- {role}: {msg['content']}\n"

    book_info = ""
    if book_context:
        book_info = "\nRelated Book Context:\n"
        for key, value in book_context.items():
            book_info += f"- {key}: {value}\n"

    prompt = f"""
    You are an empathetic, professional support agent at BookLeaf Publishing. 
    Your job is to draft a response to an author's query.

    RULES:
    1. DO NOT sound like an AI. Do not use words like "Apologies for the inconvenience" or "I understand your frustration" mechanically.
    2. Use the provided Knowledge Base strictly. If the answer is not in the KB, state that the team will investigate.
    3. Acknowledge the issue, explain the specific policy/status, and provide a clear timeline/next step.
    4. If the issue is BookLeaf's fault (e.g., delayed royalties, ISBN errors), apologize directly and own the mistake.

    <KNOWLEDGE_BASE>
    {KNOWLEDGE_BASE}
    </KNOWLEDGE_BASE>

    <AUTHOR_BOOK_CONTEXT>
    {book_info}
    </AUTHOR_BOOK_CONTEXT>

    <TICKET_SUBJECT>: {subject}
    <TICKET_DESCRIPTION>: {description}

    <RECENT_HISTORY>
    {history_context}
    </RECENT_HISTORY>

    Draft the direct response to the author below based solely on the context.
    """
    
    try:
        response = call_openai_with_retry(
            openai_client.chat.completions.create,
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content.strip(), False
    except Exception as e:
        return "I'm sorry, I'm having trouble generating a draft right now. Please respond manually based on the BookLeaf Knowledge Base.", True
