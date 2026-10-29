import json
from groq import Groq
from app.core.config import settings

def analyze_gap(ground_truth_cv: dict, jd_text: str) -> dict:
    """
    Analyzes the Job Description against the Ground Truth CV using Groq.
    Identifies matching skills, missing requirements, proposes tailored bullets,
    and drafts an initial Cover Letter directly on this first call.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    Analyze this Job Description against the provided Ground Truth CV.
    1. Identify matching skills, missing skills, and propose tailored edits to the existing bullets without inventing past experience.
    2. Draft a complete, highly professional, ATS-friendly Cover Letter (3-4 paragraphs) addressed to the hiring team for this role, showcasing how the candidate's existing experience and matching skills qualify them for the job. Do not fabricate experience.
    
    Ground Truth CV:
    {json.dumps(ground_truth_cv)}
    
    Job Description:
    {jd_text}
    
    Return EXACTLY a JSON object with these keys: 
    "job_title" (string), "company_name" (string), "match_score" (float 0-100), 
    "matching_skills" (array of strings), "missing_skills" (array of strings), 
    "proposed_edits" (array of objects with "original_bullet", "tailored_bullet", "reasoning"), 
    "questions_for_user" (array of strings),
    "cover_letter" (string - full formatted cover letter body).
    Return ONLY valid JSON. Do not include markdown formatting.
    """
    
    try:
        available_models = [m.id for m in client.models.list().data]
        target_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it", "llama3-70b-8192"]
        selected_model = next((m for m in target_models if m in available_models), available_models[0])
        
        print(f"==== GROQ MATCH LOG ====")
        print(f"Available models: {available_models}")
        print(f"Selected model: {selected_model}")
        print(f"Payload char length: {len(prompt)}")
        print(f"Estimated tokens: {len(prompt) // 4}")
        print(f"========================")
        
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=selected_model,
            temperature=0.0,
            max_tokens=4000
        )
        
        json_str = response.choices[0].message.content.replace('```json', '').replace('```', '').strip()
        analysis_result = json.loads(json_str)
        analysis_result["hr_contact_found_in_jd"] = None
        return analysis_result
    except Exception as e:
        print(f"Error matching JD with Groq: {e}")
        return {}


def update_cover_letter_with_skills(
    current_cover_letter: str,
    job_title: str,
    company_name: str,
    added_skills: list[str],
    new_bullets: list[str] = None
) -> str:
    """
    Refines an existing cover letter by weaving newly confirmed skills and bullets
    seamlessly into the text.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    You are an expert career advisor. Update the candidate's existing cover letter by naturally integrating the newly confirmed skills and accomplishments into the appropriate paragraphs.
    Keep the tone professional, confident, and ATS-optimized. Do not make the letter overly long (keep to 3-4 paragraphs).
    
    Job Title: {job_title}
    Company Name: {company_name}
    
    Existing Cover Letter:
    {current_cover_letter}
    
    Newly Confirmed Skills to integrate:
    {', '.join(added_skills) if added_skills else 'None'}
    
    New Accomplishment Bullets (if any):
    {json.dumps(new_bullets or [])}
    
    Return ONLY the updated cover letter text. Do not include markdown JSON formatting or conversational preambles.
    """
    
    try:
        available_models = [m.id for m in client.models.list().data]
        target_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile"]
        selected_model = next((m for m in target_models if m in available_models), available_models[0])
        
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=selected_model,
            temperature=0.3,
            max_tokens=2500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error updating cover letter: {e}")
        return current_cover_letter

