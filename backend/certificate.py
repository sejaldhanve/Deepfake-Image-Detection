from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import io
import datetime
import hashlib

def generate_certificate_pdf(filename: str, file_hash: str, prediction: str, confidence: float):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    # Certificate Border
    c.setStrokeColor(colors.HexColor("#2C3E50"))
    c.setLineWidth(5)
    c.rect(20, 20, width - 40, height - 40)
    
    # Internal Border
    c.setStrokeColor(colors.HexColor("#E74C3C") if prediction == "FAKE" else colors.HexColor("#27AE60"))
    c.setLineWidth(2)
    c.rect(30, 30, width - 60, height - 60)

    # Title
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(width / 2.0, height - 100, "Deepfake Detection Certificate")
    c.setFont("Helvetica", 14)
    c.drawCentredString(width / 2.0, height - 130, "Proof of Authenticity Analysis")

    # Separator
    c.line(100, height - 150, width - 100, height - 150)

    # Details
    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, height - 200, "Analysis Date:")
    c.setFont("Helvetica", 12)
    c.drawString(220, height - 200, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC"))

    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, height - 230, "Analyzed File:")
    c.setFont("Helvetica", 12)
    c.drawString(220, height - 230, filename)

    c.setFont("Helvetica-Bold", 12)
    c.drawString(100, height - 260, "File Hash (SHA-256):")
    c.setFont("Helvetica", 10)
    c.drawString(230, height - 260, file_hash)

    # Result Section
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 320, "Detection Result:")
    
    result_color = colors.HexColor("#E74C3C") if prediction == "FAKE" else colors.HexColor("#27AE60")
    c.setFillColor(result_color)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(250, height - 322, prediction)

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(100, height - 360, "Model Confidence:")
    c.setFont("Helvetica", 16)
    c.drawString(250, height - 360, f"{confidence}%")

    # Footer
    c.setFont("Helvetica-Oblique", 10)
    c.drawCentredString(width / 2.0, 100, "This certificate is generated automatically by the Deepfake Detection Application.")
    c.drawCentredString(width / 2.0, 80, "It represents the model's highest confidence estimation based on its training data.")

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return buffer.getvalue()

def calculate_hash(file_bytes: bytes) -> str:
    sha256_hash = hashlib.sha256()
    sha256_hash.update(file_bytes)
    return sha256_hash.hexdigest()
