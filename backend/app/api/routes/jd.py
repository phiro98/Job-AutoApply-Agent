from fastapi import APIRouter
from pydantic import BaseModel
from app.services.matcher import analyze_gap, update_cover_letter_with_skills

router = APIRouter()

class JDInput(BaseModel):
    jd_text: str
    ground_truth_cv: dict

@router.post("/analyze")
async def analyze_jd(jd_input: JDInput):
    """
    Analyzes the JD text, extracts requirements, compares with Ground Truth CV,
    and drafts an initial Cover Letter.
    """
    analysis = analyze_gap(jd_input.ground_truth_cv, jd_input.jd_text)
    return {
        "message": "JD analyzed successfully", 
        "analysis": analysis
    }

class UpdateCoverLetterInput(BaseModel):
    current_cover_letter: str
    job_title: str = "Position"
    company_name: str = "Company"
    added_skills: list[str] = []
    new_bullets: list[str] = []

@router.post("/update_cover_letter")
async def update_cover_letter_endpoint(payload: UpdateCoverLetterInput):
    """
    Refines an existing cover letter with newly confirmed human-in-the-loop skills and bullets.
    """
    updated = update_cover_letter_with_skills(
        current_cover_letter=payload.current_cover_letter,
        job_title=payload.job_title,
        company_name=payload.company_name,
        added_skills=payload.added_skills,
        new_bullets=payload.new_bullets
    )
    return {
        "message": "Cover letter updated successfully",
        "updated_cover_letter": updated
    }
