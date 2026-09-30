import json
import google.generativeai as genai
from app.core.config import settings

def analyze_gap(ground_truth_cv: dict, jd_text: str) -> dict:
    """
    Analyzes the Job Description against the Ground Truth CV using Gemini.
    Identifies matching skills, missing requirements, and proposes tailored bullets.
    """
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
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
        model = genai.GenerativeModel('gemini-3.8-flash')
        response = model.generate_content(prompt)
        
        json_str = response.text.replace('```json', '').replace('```', '').strip()
        analysis_result = json.loads(json_str)
        analysis_result["hr_contact_found_in_jd"] = None
        return analysis_result
    except Exception as e:
        print(f"Error matching JD with Gemini: {e}")
        return {}

