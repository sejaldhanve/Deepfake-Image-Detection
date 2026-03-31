import torch
from transformers import pipeline
from PIL import Image
import os
import io

print("="*60)
print("Loading State-of-the-Art Hugging Face Face Deepfake Model...")
print("="*60)

# We use a state-of-the-art model specifically trained to detect StyleGAN and Deepfake faces
MODEL_NAME = "dima806/deepfake_vs_real_image_detection"
pipe = None

def load_model():
    global pipe
    if pipe is None:
        try:
            pipe = pipeline("image-classification", model=MODEL_NAME)
            print("Hugging Face model loaded successfully.")
            return True
        except Exception as e:
            print(f"Failed to load Hugging Face model: {e}")
            return False
    return True

def predict_image(image_bytes: bytes):
    if not load_model():
        return {"error": "Model initialization failed."}
    
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # Run inference using the pipeline
        results = pipe(image)
        
        top_prediction = results[0]
        label = str(top_prediction['label']).upper()
        confidence = float(top_prediction['score']) * 100
        
        # 'prithivida/deepfake-detector' predicts "Real" or "Fake"
        if "REAL" in label:
            prediction = "REAL"
        else:
            prediction = "FAKE"
            
        return {
            "prediction": prediction,
            "confidence": round(confidence, 2)
        }
    except Exception as e:
        return {"error": str(e)}
