import json
from groq import Groq
from app.core.config import settings

def analyze_gap(ground_truth_cv: dict, jd_text: str) -> dict:
    """
    Analyzes the Job Description against the Ground Truth CV using Groq.
    Identifies matching skills, missing requirements, and proposes tailored bullets.
    """
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    Analyze this Job Description against the provided Ground Truth CV.
    Identify matching skills, missing skills, and propose tailored edits to the existing bullets without inventing past experience.
    If a critical skill is missing, generate a question for the user asking if they have that experience.
    
    Ground Truth CV:
    {json.dumps(ground_truth_cv)}
    
    Job Description:
    {jd_text}
    
    Return EXACTLY a JSON object with these keys: 
    "job_title" (string), "company_name" (string), "match_score" (float 0-100), 
    "matching_skills" (array of strings), "missing_skills" (array of strings), 
    "proposed_edits" (array of objects with "original_bullet", "tailored_bullet", "reasoning"), 
    "questions_for_user" (array of strings).
    Return ONLY valid JSON. Do not include markdown formatting.
    """
    
    try:
        available_models = [m.id for m in client.models.list().data]
        target_models = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it", "llama3-70b-8192"]
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
            max_tokens=4096
        )
        
        json_str = response.choices[0].message.content.replace('```json', '').replace('```', '').strip()
        analysis_result = json.loads(json_str)
        analysis_result["hr_contact_found_in_jd"] = None
        return analysis_result
    except Exception as e:
        print(f"Error matching JD with Groq: {e}")
        return {}

