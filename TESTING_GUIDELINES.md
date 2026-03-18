# BookLeaf Author Support Portal - E2E Testing Guidelines

This document provides a step-by-step guide to manually verify the BookLeaf Author Support Portal backend using the provided Postman collection.

---

## 🛠️ Prerequisites
1.  **Postman**: Download and install the Postman desktop app.
2.  **Environment Setup**:
    *   Import `bookleaf_postman_collection.json` into Postman.
    *   The `base_url` variable is pre-set to your Render deployment: `https://bookleaf-qc91.onrender.com`.
    *   (Optional) If testing locally, update the `base_url` to `http://localhost:8000`.

---

## 🧪 Phase 1: Authentication & Data Access (Author)

### 1. Author Login
*   **Request**: `Auth > Login`
*   **Action**: Update the email to `rohit.kapoor@email.com` (or any other author from the sample data) and password `password123`.
*   **Expectation**: Returns `200 OK` with an `access_token`. Postman will automatically save this token for subsequent requests.

### 2. View Personalized Books
*   **Request**: `Books > List Books`
*   **Expectation**: You should only see books belonging to the logged-in author. For Rohit, you should see "Code & Karma" and "Startup Sutra".

---

## 🧪 Phase 2: AI-Powered Ticket Lifecycle

### 3. Raise a Support Ticket
*   **Request**: `Tickets > Submit Ticket`
*   **Action**: Use the following specific values (Note: `author_id` is automatically detected from your login!)
    *   **Subject**: `ISBN missing for my book`
    *   **Description**: `I see my book 'Code & Karma' is live on Amazon, but the ISBN is blank in this portal. Can you please update it?`
*   **Expectation**:
    *   `200 OK` with the created ticket details.
    *   Verify **AI classification**: The `category` should be automatically assigned as `ISBN & Metadata Issues`.
    *   Verify **AI priority**: A numerical `priority_score` and a text `priority` (e.g., `Medium`) should be assigned.
*   **Step**: Copy the `id` of this ticket from the response and paste it into the `ticket_id` variable in your Postman collection variables.

---

## 🧪 Phase 3: Administrative Flow (Admin)

### 4. Admin Login
*   **Request**: `Auth > Login`
*   **Action**: Use `admin@bookleaf.com` and `password123`.
*   **Expectation**: Successfully authenticates as an Admin.

### 5. Generate AI Draft Response
*   **Request**: `Tickets > Admin: Get AI Draft Response`
*   **Expectation**:
    *   `200 OK`.
    *   Verify the `draft`: The AI should provide a professional response that references the **BookLeaf Knowledge Base policies**.

### 6. Post Final Response
*   **Request**: `Tickets > Add Response to Ticket`
*   **Action**: Paste the draft or write a new response in the body.
*   **Expectation**: `200 OK`. This response will now be visible to the author.

---

## 🧪 Phase 4: Security (RLS Verification)

### 7. Unauthorized Access Test
*   **Action**: Log back in as an author (e.g., `sneha.kulkarni@email.com`).
*   **Request**: Try to view the ticket you created for Rohit using the `Get Ticket` request.
*   **Expectation**: Returns `403 Forbidden` or `404 Not Found`. This confirms that **Row Level Security (RLS)** is successfully preventing authors from peaking at each other's data.

---

## 🚀 Final Audit Checklist
- [ ] Log in as different authors and verify book lists change.
- [ ] Submit a ticket and check if AI categories match the knowledge base.
- [ ] Ensure AI draft generation includes policy-specific details.
- [ ] Verify that internal-only responses (set `is_internal: true`) are NOT visible to authors.
