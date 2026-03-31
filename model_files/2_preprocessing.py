# ================================================
#   2_preprocessing.py
#   Step 2: Preprocessing and Dataset Creation
# ================================================

import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import os

print("="*60)
print("Step 2: Preprocessing & Dataset Creation")
print("="*60)

BASE_DIR = "data/real_vs_fake/real-vs-fake"
IMG_SIZE = 128
BATCH_SIZE = 64

# Define transforms
train_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ColorJitter(brightness=0.2, contrast=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

val_test_transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

class FaceDataset(Dataset):
    def __init__(self, root_dir, split="train", transform=None):
        self.transform = transform
        self.samples = []
        
        fake_dir = os.path.join(root_dir, split, "fake")
        real_dir = os.path.join(root_dir, split, "real")
        
        # Fake = 0
        for img in os.listdir(fake_dir):
            if img.lower().endswith(('.jpg', '.jpeg', '.png')):
                self.samples.append((os.path.join(fake_dir, img), 0))
        
        # Real = 1
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

# Create datasets
print("Creating datasets...")
train_dataset = FaceDataset(BASE_DIR, split="train", transform=train_transform)
val_dataset   = FaceDataset(BASE_DIR, split="valid", transform=val_test_transform)
test_dataset  = FaceDataset(BASE_DIR, split="test",  transform=val_test_transform)

# Create DataLoaders
train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True,  num_workers=2, pin_memory=True)
val_loader   = DataLoader(val_dataset,   batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)
test_loader  = DataLoader(test_dataset,  batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)

print(f"\n✅ Preprocessing Completed!")
print(f"Train samples : {len(train_dataset):,}")
print(f"Val samples   : {len(val_dataset):,}")
print(f"Test samples  : {len(test_dataset):,}")
print(f"Image size    : {IMG_SIZE} x {IMG_SIZE}")
print(f"Batch size    : {BATCH_SIZE}")

# Optional: Quick check
batch = next(iter(train_loader))
print(f"Sample batch shape: {batch[0].shape}")

print("\nYou can now proceed to Step 3: Model Training")