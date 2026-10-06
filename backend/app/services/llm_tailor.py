import json
from groq import Groq
from app.core.config import settings

def holistic_gap_analysis(skills_raw: str, experience_raw: str, jd_text: str) -> dict:
    """
    Analyzes the full skills and experience against the JD to find gaps and alignment.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    You are a principal tech recruiter. Analyze the candidate's complete experience and skills against the Job Description.
    
    Candidate Skills:
    {skills_raw}
    
    Candidate Experience:
    {experience_raw}
    
    Job Description:
    {jd_text}
    
    Return EXACTLY a JSON object with these keys: 
    "matched_skills" (array of strings),
    "missing_critical_skills" (array of strings),
    "recommended_skill_updates" (array of strings),
    "role_alignment_plan" (string summarizing how their past roles map to this JD).
    Return ONLY valid JSON without markdown.
    """
    
    available_models = [m.id for m in client.models.list().data]
    target_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile"]
    selected_model = next((m for m in target_models if m in available_models), available_models[0])
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=selected_model,
        temperature=0.0,
        max_tokens=2048
    )
    
    json_str = response.choices[0].message.content.replace('```json', '').replace('```', '').strip()
    return json.loads(json_str)

def targeted_tailor(role_chunk: str, jd_text: str) -> dict:
    """
    Tailors a specific role/experience chunk based on the JD.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    Rewrite the following experience block to better align with the target Job Description.
    Do not fabricate achievements. Emphasize relevant methodologies, tech stacks, and measurable outcomes.
    
    Target Experience Chunk:
    {role_chunk}
    
    Job Description:
    {jd_text}
    
    Return EXACTLY a JSON object with:
    "original_chunk" (string),
    "tailored_chunk" (string - formatted with bullet points),
    "reasoning" (string - why these changes were made).
    Return ONLY valid JSON without markdown.
    """
    
    available_models = [m.id for m in client.models.list().data]
    target_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"]
    selected_model = next((m for m in target_models if m in available_models), available_models[0])
    
    response = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=selected_model,
        temperature=0.4,
        max_tokens=1500
    )
    
    json_str = response.choices[0].message.content.replace('```json', '').replace('```', '').strip()
    return json.loads(json_str)
