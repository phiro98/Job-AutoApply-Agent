import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.parser import parse_cv

router = APIRouter()

@router.post("/upload")
async def upload_baseline_cv(file: UploadFile = File(...)):
    """
    Uploads the user's baseline CV/Resume (.pdf or .docx).
    Parses the document into a structured JSON schema via Gemini.
    """
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported.")
        
    temp_path = f"temp_{file.filename}"
    
    try:
        # Save uploaded file temporarily to disk so pdfplumber can read it
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Send to Gemini for parsing
        structured_data = parse_cv(temp_path)
        
        # Clean up temporary file
        os.remove(temp_path)
        
        if not structured_data:
            raise HTTPException(status_code=500, detail="Gemini failed to parse the CV.")
            
        return {"message": "Successfully parsed CV", "schema": structured_data}
        
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Failed to process CV: {str(e)}")
