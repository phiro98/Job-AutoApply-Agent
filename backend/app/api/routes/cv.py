import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from pydantic import BaseModel
from weasyprint import HTML
from app.services.parser import parse_cv

router = APIRouter()

class PdfDownloadRequest(BaseModel):
    html: str
    filename: str = "CV.pdf"

@router.post("/download_pdf")
async def download_cv_pdf(data: PdfDownloadRequest):
    """
    Directly converts HTML into an ATS-friendly PDF file and streams it for browser download.
    """
    try:
        pdf_bytes = HTML(string=data.html).write_pdf()
        safe_filename = data.filename if data.filename.endswith(".pdf") else f"{data.filename}.pdf"
        safe_filename = safe_filename.replace('"', '').replace('\n', '')
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{safe_filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as e:
        print(f"Error generating PDF in WeasyPrint: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

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
