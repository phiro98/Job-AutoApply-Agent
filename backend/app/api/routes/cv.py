from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.post("/upload")
async def upload_baseline_cv(file: UploadFile = File(...)):
    \"\"\"
    Uploads the user's baseline CV/Resume (.pdf or .docx).
    Parses the document into a structured JSON schema.
    \"\"\"
    # TODO: Connect to parser service
    return {"message": f"Successfully received {file.filename}", "schema": {}}
