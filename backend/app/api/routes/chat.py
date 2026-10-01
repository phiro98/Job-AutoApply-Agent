from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
from app.core.config import settings

router = APIRouter()

class ChatInput(BaseModel):
    skill: str
    user_input: str
    cv_data: dict

@router.post("/refine_bullet")
async def refine_bullet(data: ChatInput):
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    The user is missing the skill "{data.skill}" in their CV. 
    They have provided the following context about their experience regarding this skill:
    "{data.user_input}"
    
    Based on this context, write ONE single, highly professional, ATS-friendly resume bullet point incorporating this experience and skill. Do not write anything else.
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
        bullet = response.choices[0].message.content.strip()
        # Remove surrounding quotes if they exist
        if bullet.startswith('"') and bullet.endswith('"'):
            bullet = bullet[1:-1]
            
        return {"tailored_bullet": bullet}
    except Exception as e:
        return {"tailored_bullet": f"Developed expertise in {data.skill} through {data.user_input}."}
