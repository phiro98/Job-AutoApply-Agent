from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class EmailDispatch(BaseModel):
    recipient_email: str
    subject: str
    body_text: str
    cv_pdf_path: str
    cover_letter_pdf_path: str

@router.post("/send")
async def send_email(dispatch: EmailDispatch):
    """
    Connects to Gmail API and transmits the email with attachments.
    """
    # TODO: Connect to gmail_service
    return {"message": "Email dispatched successfully"}
