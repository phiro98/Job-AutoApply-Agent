from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class JDInput(BaseModel):
    jd_text: str

@router.post("/analyze")
async def analyze_jd(jd_input: JDInput):
    \"\"\"
    Analyzes the JD text, extracts requirements, and compares with Ground Truth CV.
    \"\"\"
    # TODO: Connect to matcher service
    return {"message": "JD analyzed successfully", "match_score": 0.0, "missing_skills": []}
