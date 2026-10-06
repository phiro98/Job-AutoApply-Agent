from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings

router = APIRouter()

class ChatInput(BaseModel):
    session_id: str = "default"
    skill: str
    user_input: str
    cv_data: dict

# In-memory session tracking
sessions = {}

@router.post("/refine_bullet")
async def refine_bullet(data: ChatInput):
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    You are an AI assisting a user with their resume.
    The user is missing the skill "{data.skill}" in their CV. 
    They have provided the following response when asked about their experience regarding this skill:
    "{data.user_input}"
    
    Task 1: Determine the user's intent. Are they denying experience/skipping (e.g., "no", "I don't have this", "skip", "never used it") or are they confirming/providing context (e.g., "yes", "I did this at my last job", "I handled...")?
    
    Task 2: 
    - If they are denying experience, do not write a bullet point. Output exactly: 
      INTENT: DENY
    - If they are confirming experience, write ONE single, highly professional, ATS-friendly resume bullet point incorporating this experience and skill. Output exactly:
      INTENT: CONFIRM
      BULLET: <your generated bullet point>
    """
    
    try:
        available_models = [m.id for m in client.models.list().data]
        target_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it", "llama3-70b-8192"]
        selected_model = next((m for m in target_models if m in available_models), available_models[0])
        
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=selected_model,
            temperature=0.7,
            max_tokens=200
        )
        content = response.choices[0].message.content.strip()
        
        if "INTENT: DENY" in content.upper():
            if data.session_id not in sessions:
                sessions[data.session_id] = {"uncovered_jd_requirements": []}
            if data.skill not in sessions[data.session_id]["uncovered_jd_requirements"]:
                sessions[data.session_id]["uncovered_jd_requirements"].append(data.skill)
                
            return {
                "action": "skip",
                "message": "Understood, leaving that out. Let's move to the next item...",
                "uncovered_jd_requirement": data.skill,
                "session_state": sessions[data.session_id]
            }
        else:
            bullet = content
            if "BULLET:" in content.upper():
                bullet_start = content.upper().find("BULLET:") + 7
                bullet = content[bullet_start:].strip()
                
            # Remove surrounding quotes if they exist
            if bullet.startswith('"') and bullet.endswith('"'):
                bullet = bullet[1:-1]
                
            return {
                "action": "propose_bullet",
                "tailored_bullet": bullet,
                "message": "Here is a drafted bullet based on your context. Let me know if you want to approve or revise it."
            }
    except Exception as e:
        return {
            "action": "propose_bullet",
            "tailored_bullet": f"Developed expertise in {data.skill} through {data.user_input}.",
            "message": "Here is a drafted bullet based on your context. Let me know if you want to approve or revise it."
        }
