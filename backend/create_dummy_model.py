import torch
import torch.nn as nn
from torchvision import models
import os

print("Creating a temporary working ONNX model...")

# Path to the ONNX model destination
MODEL_DIR = os.path.join(os.path.dirname(__file__), "..", "model_files", "models")
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODEL_DIR, "deepfake_detector.onnx")

# 1. Instantiate the EXACT same architecture your teammate used.
model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)

# It will have generic 'Imagenet' weights, so its accuracy on deepfakes will be random,
# but it will guarantee the application compiles and works end-to-end for your demo!
model.eval()

# 2. Export it as a SINGLE contained ONNX file (so you don't need a .data file)
dummy_input = torch.randn(1, 3, 128, 128) # 1 batch, 3 channels, 128x128 resolution

torch.onnx.export(
    model,
    dummy_input,
    MODEL_PATH,
    export_params=True,       # Store the trained parameter weights inside the model file
    opset_version=11,         # ONNX version
    do_constant_folding=True, # Optimization
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
)

print(f"Model saved completely at: {MODEL_PATH}")
print("You can now restart your backend server!")
