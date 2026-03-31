# ================================================
#   1_count_images.py
#   Count images in real_vs_fake dataset
# ================================================

import os

base_path = "data/real_vs_fake/real-vs-fake"

print("="*60)
print("Image Count in real_vs_fake Dataset")
print("="*60)

folders = {
    "Train - Fake": "train/fake",
    "Train - Real": "train/real",
    "Valid - Fake": "valid/fake",
    "Valid - Real": "valid/real",
    "Test - Fake" : "test/fake",
    "Test - Real" : "test/real"
}

total_images = 0

for name, folder in folders.items():
    full_path = os.path.join(base_path, folder)
    
    if os.path.exists(full_path):
        # Count only image files
        images = [f for f in os.listdir(full_path) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        count = len(images)
        print(f"{name:15} : {count:6,} images")
        total_images += count
    else:
        print(f"{name:15} : Folder not found")

print("-" * 60)
print(f"Total Images    : {total_images:,} images")
print("="*60)