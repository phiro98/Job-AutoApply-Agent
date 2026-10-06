import pdfplumber
import re
import json

def parse_static_cv(file_path: str):
    """
    Deterministically parses a CV PDF to extract static data and tailorable corpus without LLMs.
    """
    extracted_pages = []
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                extracted_pages.append(text)
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return None
        
    full_text = "\n".join(extracted_pages)
    
    # 1. Deterministic Regex Extraction for Contact Info
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    phone_pattern = r'(\+\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'
    url_pattern = r'(https?://[^\s]+|www\.[^\s]+|linkedin\.com/in/[^\s]+|github\.com/[^\s]+)'
    
    email_match = re.search(email_pattern, full_text)
    phone_match = re.search(phone_pattern, full_text)
    urls = re.findall(url_pattern, full_text)
    
    email = email_match.group(0) if email_match else None
    phone = phone_match.group(0) if phone_match else None
    
    # 2. Simple Section Segmentation
    # We look for common headings (all caps usually)
    headings = ["EXPERIENCE", "WORK HISTORY", "EMPLOYMENT", "SKILLS", "EDUCATION", "CERTIFICATIONS", "SUMMARY", "PROJECTS"]
    
    sections = {}
    current_heading = "SUMMARY"
    sections[current_heading] = []
    
    lines = full_text.split('\n')
    for line in lines:
        clean_line = line.strip().upper()
        if any(h == clean_line for h in headings):
            current_heading = clean_line
            sections[current_heading] = []
        else:
            sections[current_heading].append(line)
            
    # Combine back to strings
    for k in sections:
        sections[k] = "\n".join(sections[k]).strip()
        
    # Re-grouping into required schema
    experience_text = sections.get("EXPERIENCE", "") + "\n" + sections.get("WORK HISTORY", "") + "\n" + sections.get("EMPLOYMENT", "")
    skills_text = sections.get("SKILLS", "")
    education_text = sections.get("EDUCATION", "")
    certifications_text = sections.get("CERTIFICATIONS", "")
    summary_text = sections.get("SUMMARY", "")
    
    master_profile = {
        "personal_details": {
            "name": lines[0].strip() if lines else "", # Assumes name is first line
            "email": email,
            "phone": phone,
            "location": None, # Hard to regex deterministically without NER
            "links": list(set(urls))
        },
        "education_raw": education_text,
        "certifications_raw": certifications_text,
        "summary": summary_text,
        "tailorable_corpus": {
            "skills_raw": skills_text.strip(),
            "experience_raw": experience_text.strip()
        }
    }
    
    return master_profile
