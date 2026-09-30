import os
from app.services.parser import parse_cv, extract_text_from_pdf

def test():
    try:
        from reportlab.pdfgen import canvas
        pdf_path = "test_dummy.pdf"
        c = canvas.Canvas(pdf_path)
        c.drawString(100, 750, "Jane Doe")
        c.drawString(100, 730, "Software Engineer with 5 years of Python experience.")
        c.save()
    except ImportError:
        pass
        
    try:
        print("Sending to Gemini...")
        data = parse_cv(pdf_path)
        print(f"Gemini output: {data}")
    except Exception as e:
        print(f"Gemini Error: {e}")
        
if __name__ == "__main__":
    test()
