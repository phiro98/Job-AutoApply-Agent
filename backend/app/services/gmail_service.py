# Service for dispatching emails via Gmail API

import os
import base64
from email.message import EmailMessage
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Scope required to send emails on behalf of the user
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    """Authenticates the user and returns the Gmail service instance."""
    creds = None
    # token.json stores the user's access and refresh tokens.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If no valid credentials available, require user login.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # Assumes credentials.json is downloaded from Google Cloud Console
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    try:
        service = build('gmail', 'v1', credentials=creds)
        return service
    except HttpError as error:
        print(f'An error occurred connecting to Gmail: {error}')
        return None

def send_email_with_attachments(recipient: str, subject: str, body: str, attachments: list[str]):
    """
    Constructs a MIME message with attachments and sends it via Gmail API.
    """
    service = get_gmail_service()
    if not service:
        raise Exception("Failed to initialize Gmail service")

    try:
        message = EmailMessage()
        message.set_content(body)
        message['To'] = recipient
        message['From'] = 'me' # Dispatches from the authenticated user's email
        message['Subject'] = subject

        # Attach the tailored PDF files
        for file_path in attachments:
            if not os.path.exists(file_path):
                print(f"Attachment not found: {file_path}")
                continue
                
            with open(file_path, 'rb') as f:
                content = f.read()
                
            # Defaulting to application/pdf as per architecture requirements
            message.add_attachment(
                content, 
                maintype='application', 
                subtype='pdf', 
                filename=os.path.basename(file_path)
            )

        # Encode message payload as base64url string
        encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
        create_message = {'raw': encoded_message}
        
        # Execute the send request
        send_message = service.users().messages().send(userId="me", body=create_message).execute()
        print(f'Successfully dispatched email. Message Id: {send_message["id"]}')
        return send_message
        
    except HttpError as error:
        print(f'An error occurred sending the email: {error}')
        raise
