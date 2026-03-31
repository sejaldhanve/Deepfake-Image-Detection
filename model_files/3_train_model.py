# ================================================
#   3_train_model.py
#   Step 3: Train Deepfake Detection Model
# ================================================

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import models, transforms
from PIL import Image
import os
from tqdm import tqdm

print("="*70)
print("Step 3: Training Deepfake Detection Model")
print("="*70)

# ================== CONFIG ==================
IMG_SIZE = 128
BATCH_SIZE = 64
EPOCHS = 10
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"Training on device: {DEVICE}")

# ================== DATA LOADERS (from previous step) ==================
# We will reuse the same dataset class for simplicity
class FaceDataset(torch.utils.data.Dataset):
    def __init__(self, root_dir, split="train", transform=None):
        self.transform = transform
        self.samples = []
        fake_dir = os.path.join(root_dir, split, "fake")
        real_dir = os.path.join(root_dir, split, "real")
        
        for img in os.listdir(fake_dir):
            if img.lower().endswith(('.jpg', '.jpeg', '.png')):
                self.samples.append((os.path.join(fake_dir, img), 0))
        for img in os.listdir(real_dir):
            if img.lower().endswith(('.jpg', '.jpeg', '.png')):
                self.samples.append((os.path.join(real_dir, img), 1))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]
        image = Image.open(img_path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, torch.tensor(label, dtype=torch.long)

# Transforms
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3),
])

val_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.5]*3, [0.5]*3),
])

BASE_DIR = "data/real_vs_fake/real-vs-fake"

train_dataset = FaceDataset(BASE_DIR, split="train", transform=train_transform)
val_dataset   = FaceDataset(BASE_DIR, split="valid", transform=val_transform)

train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)
val_loader   = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

print(f"Train samples: {len(train_dataset):,}")
print(f"Val samples  : {len(val_dataset):,}")

# ================== MODEL ==================
model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.IMAGENET1K_V1)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, 2)
model = model.to(DEVICE)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.0005, weight_decay=1e-5)
scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=3)

# ================== TRAINING ==================
best_val_acc = 0.0
os.makedirs("models", exist_ok=True)

print(f"\nStarting training for {EPOCHS} epochs...\n")

for epoch in range(EPOCHS):
    # Training
    model.train()
    train_loss = 0.0
    for images, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS} [Train]"):
        images, labels = images.to(DEVICE), labels.to(DEVICE)
        
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()
        train_loss += loss.item() * images.size(0)
    
    train_loss /= len(train_dataset)

    # Validation
    model.eval()
    val_loss = 0.0
    correct = 0
    total = 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            outputs = model(images)
            loss = criterion(outputs, labels)
            val_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            correct += (predicted == labels).sum().item()
            total += labels.size(0)
    
    val_loss /= len(val_dataset)
    val_acc = 100 * correct / total

    scheduler.step(val_loss)

    print(f"Epoch {epoch+1:2d} | Train Loss: {train_loss:.4f} | Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%")

    if val_acc > best_val_acc:
        best_val_acc = val_acc
        torch.save(model.state_dict(), "models/best_deepfake_detector.pth")
        print(f"   → Best model saved! ({val_acc:.2f}%)")

print(f"\n✅ Training Finished!")
print(f"Best Validation Accuracy: {best_val_acc:.2f}%")
torch.save(model.state_dict(), "models/final_deepfake_detector.pth")
print("Model saved in 'models/' folder")