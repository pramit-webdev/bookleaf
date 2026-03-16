# BookLeaf Support Portal - Technical Approach

## 1. Core Priority: Scalability & AI Accuracy
My primary focus was building a system that could handle BookLeaf’s volume (1,200+ books monthly) without losing the "author-first" empathetic tone. I prioritized:
- **Database-Level Isolation**: Using Supabase RLS ensures that scaling to thousands of authors doesn't increase the risk of data leaks.
- **AI Contextualization**: Instead of using generic LLM prompts, I integrated the BookLeaf Knowledge Base directly into the response drafting logic. This ensures the AI acts as a trained BookLeaf representative, not just a chatbot.

## 2. Trade-offs & Decisions
- **Model Choice**: I chose `gpt-4o-mini` because support ticket classification and drafting don't require the reasoning power of GPT-4o but benefit from the speed and lower cost, which is essential for a high-volume business like BookLeaf.
- **Auth Proxy**: I implemented a backend login wrapper instead of relying purely on client-side Supabase auth to provide a better API documentation experience (Swagger) and to allow for future backend-side audit logging.
- **Graceful Degradation**: I designed the system to be resilient. If the AI service fails, the core ticket submission flow remains intact. AI is treated as an enhancement, not a hard dependency for business continuity.

## 3. Production Evolution
If this were to go into full production, I would:
1. **Implement Vector Search (RAG)**: For the response generator, instead of sending the whole knowledge base, I’d use embeddings to retrieve only the relevant policy sections to save on tokens and improve accuracy.
2. **WebSocket Integration**: Direct ticket notifications for authors to improve the "real-time" feel without polling.
3. **Advanced Analytics**: Add an admin dashboard showing AI classification accuracy (Human Override %) to refine prompts over time.
4. **Automated Testing**: Implement a "Golden Dataset" of tickets to run against the AI service whenever prompts are updated to prevent regression in response quality.
