from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

from app.services.matcher import analyze_gap

class JDInput(BaseModel):
    jd_text: str
    ground_truth_cv: dict

@router.post("/analyze")
async def analyze_jd(jd_input: JDInput):
    """
    Analyzes the JD text, extracts requirements, and compares with Ground Truth CV.
    """
    analysis = analyze_gap(jd_input.ground_truth_cv, jd_input.jd_text)
    return {
        "message": "JD analyzed successfully", 
        "analysis": analysis
    }
