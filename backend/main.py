from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
import os

from inference import predict_image
from certificate import generate_certificate_pdf, calculate_hash

app = FastAPI(title="Deepfake Detection API")

# Setup CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/detect")
async def detect_media(file: UploadFile = File(...)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are currently supported")

    file_bytes = await file.read()
    
    # Run Inference
    result = predict_image(file_bytes)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return {
        "filename": file.filename,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
    }

@app.post("/api/certificate")
async def get_certificate(file: UploadFile = File(...), prediction: str = "UNKNOWN", confidence: float = 0.0):
    file_bytes = await file.read()
    file_hash = calculate_hash(file_bytes)
    
    pdf_bytes = generate_certificate_pdf(file.filename, file_hash, prediction, confidence)
    
    return Response(
        content=pdf_bytes, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=certificate_{file.filename}.pdf"}
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
