import pdfplumber
import json
import re
from groq import Groq
from app.core.config import settings

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from a PDF file using pdfplumber, and cleans it."""
    extracted_pages = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                extracted_pages.append(text)
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""
        
    full_text = "\n".join(extracted_pages)
    
    # Collapse excessive newlines and whitespace
    full_text = re.sub(r'[ \t]+', ' ', full_text)
    full_text = re.sub(r'\n{3,}', '\n\n', full_text).strip()
    
    # Safety cap: A realistic CV never exceeds ~15,000 characters
    return full_text[:15000]

def parse_cv(file_path: str) -> dict:
    """
    Extracts text from the CV document and structures it into a JSON schema via Groq.
    """
    raw_text = extract_text_from_pdf(file_path)
    client = Groq(api_key=settings.GROQ_API_KEY)
    
    prompt = f"""
    Extract the following resume text into a structured JSON format. 
    It MUST contain exactly these keys: 
    "personal_details" (name, email, phone, location, links array), 
    "summary" (string containing a professional summary or objective),
    "work_history" (array of objects with company, title, dates, bullets array), 
    "education" (array of objects with degree_or_course, institution, year, details_array),
    "skills" (array of strings),
    "certifications" (array of strings).
    Return ONLY valid JSON. Do not include markdown formatting like ```json.
    
    Resume Text:
    {raw_text}
    """
    
    try:
        available_models = [m.id for m in client.models.list().data]
        target_models = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it", "llama3-70b-8192"]
        selected_model = next((m for m in target_models if m in available_models), available_models[0])
        
        print(f"==== GROQ API LOG ====")
        print(f"Available models: {available_models}")
        print(f"Selected model: {selected_model}")
        print(f"Payload char length: {len(prompt)}")
        print(f"Estimated tokens: {len(prompt) // 4}")
        print(f"Payload preview: {prompt[:200]}...")
        print(f"======================")
        
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
        structured_data = json.loads(json_str)
        return structured_data
    except Exception as e:
        print(f"Error parsing CV with Groq: {e}")
        return {} # Fallback

