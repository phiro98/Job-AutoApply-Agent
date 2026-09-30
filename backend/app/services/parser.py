import pdfplumber
import json
import google.generativeai as genai
from app.core.config import settings

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts raw text from a PDF file using pdfplumber."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text

def parse_cv(file_path: str) -> dict:
    """
    Extracts text from the CV document and structures it into a JSON schema via Gemini.
    """
    raw_text = extract_text_from_pdf(file_path)
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    prompt = f"""
    Extract the following resume text into a structured JSON format. 
    It MUST contain exactly these keys: 
    "personal_details" (name, email, phone, links array), 
    "work_history" (array of objects with company, title, dates, bullets array), 
    "skills" (array of strings), and "education" (string).
    Return ONLY valid JSON. Do not include markdown formatting like ```json.
    
    Resume Text:
    {raw_text}
    """
    
    try:
        model = genai.GenerativeModel('gemini-3.8-flash')
        response = model.generate_content(prompt)
        
        # Strip potential markdown formatting
        json_str = response.text.replace('```json', '').replace('```', '').strip()
        structured_data = json.loads(json_str)
        return structured_data
    except Exception as e:
        print(f"Error parsing CV with Gemini: {e}")
        return {} # Fallback

