# AutoApply Agent: Copilot Architecture Rules

## 1. Skill Segregation Policy
- Hard technical skills (Cloud: AWS S3/Lambda, Azure; Languages; Dev tools: Docker, Git, Cursor) belong strictly to `cv.skills`.
- Project capabilities, ownership, system integrations (Stripe payments, LLM wrappers, deployments) belong strictly to `cv.experience` bullet points.

## 2. Document & API Rules
- Use Pydantic v2 schemas for all payloads and structured LLM JSON outputs.
- Never mutate static CV metadata (name, contact links, education) via LLMs.
- Wrap external LLM or scraping calls in retry handlers using exponential backoff.
- Ensure all FastAPI endpoints have strict typing and raise specific `HTTPException` error envelopes.