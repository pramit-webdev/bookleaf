import os
import json
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

def classify_ticket(subject: str, description: str) -> str:
    prompt = f"""
    Classify the following support ticket into one of these categories:
    {', '.join(CATEGORIES)}

    Ticket Subject: {subject}
    Ticket Description: {description}

    Return only the category name.
    """
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )
    category = response.choices[0].message.content.strip()
    return category if category in CATEGORIES else "General Inquiry"

def assign_priority(subject: str, description: str) -> dict:
    prompt = f"""
    Assign a priority (Critical, High, Medium, Low) and a priority score (0-100) to the following support ticket.
    
    Examples of Critical/High: Payment issues overdue for months, ISBN errors on physical copies.
    Examples of Low: Bio updates, general questions.

    Ticket Subject: {subject}
    Ticket Description: {description}

    Return JSON format: {{"priority": "...", "score": 80}}
    """
    
    response = openai_client.chat.completions.create(
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

def generate_draft_response(subject: str, description: str, ticket_history: list = None) -> str:
    prompt = f"""
    You are a BookLeaf Author Support representative. 
    Using the BookLeaf Knowledge Base below, draft a response to the author's query.
    
    Tone Guidelines:
    - Always empathetic and professional.
    - Acknowledge the author's concern first.
    - Be specific (numbers, dates, statuses).
    - Own mistakes if they are BookLeaf's fault.
    - Give clear timelines.
    - End with a clear next step.

    Knowledge Base:
    {KNOWLEDGE_BASE}

    Ticket Subject: {subject}
    Ticket Description: {description}
    
    Draft the response.
    """
    
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    return response.choices[0].message.content.strip()
