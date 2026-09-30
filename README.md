# AutoApply Agent

AutoApply Agent is a complete, production-ready AI agent chatbot application designed to streamline the job application process. 

It ingests a Master Resume/CV, analyzes incoming Job Descriptions (JDs), interactively customizes the CV without hallucinating experience, drafts a targeted Cover Letter, compiles both into high-quality PDFs matching the original template styling, finds recruiter/HR emails via web intelligence, and sends an outreach email via Gmail OAuth only after explicit human-in-the-loop review and approval.

## Architecture & Tech Stack
- **Backend**: Python 3.11+, FastAPI (REST APIs & WebSocket/SSE for conversational chat stream).
- **Frontend**: Modern Next.js / React with Tailwind CSS, featuring a clean split-view dashboard.
- **Document Engine**: pdfplumber / pypdf, Jinja2 + WeasyPrint for rendering.
- **Search Agent**: SerpAPI / DuckDuckGo for HR contact discovery.
- **Email**: Google Workspace / Gmail API (OAuth 2.0).
- **Database**: SQLite (via SQLAlchemy).

## Setup Instructions

### Environment Variables
Copy `.env.example` to `.env` and fill in the required API keys.

### Backend Setup
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the development server: `uvicorn main:app --reload`

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
