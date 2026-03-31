# ================================================
#   4_test_model.py
#   Step 4: Test the Trained Model
# ================================================

import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import os

print("="*60)
print("Testing the Trained Deepfake Detector")
print("="*60)

MODEL_PATH = "models/final_deepfake_detector.pth"
IMG_SIZE = 128
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model
model = models.efficientnet_b0(weights=None)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
model = model.to(DEVICE)
model.eval()

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3),
])

def test_image(image_path):
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        return

    image = Image.open(image_path).convert("RGB")
    input_tensor = transform(image).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        output = model(input_tensor)
        probs = torch.nn.functional.softmax(output[0], dim=0)
        confidence, pred_idx = torch.max(probs, 0)

    prediction = "FAKE" if pred_idx.item() == 0 else "REAL"
    confidence_pct = confidence.item() * 100

    print(f"\nImage     : {os.path.basename(image_path)}")
    print(f"Prediction: {prediction}")
    print(f"Confidence: {confidence_pct:.2f}%")
    print("-" * 50)

# ================== TEST YOUR IMAGES ==================
if __name__ == "__main__":
    # Test your previous problematic image
    test_image("styleGan4.jpg")

    # Add more test images here
    # test_image("path/to/another_ai_image.jpg")
    # test_image("data/real_vs_fake/real-vs-fake/test/fake/some_image.jpg")