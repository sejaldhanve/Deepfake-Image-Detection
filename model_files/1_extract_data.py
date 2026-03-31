# ================================================
#   1_extract_data.py
#   Step 1: Extract real_vs_fake.tar.gz and Organize
# ================================================

import os
import tarfile
from tqdm import tqdm

print("="*70)
print("DEEPFAKE DETECTION PROJECT")
print("Step 1: Extracting real_vs_fake.tar.gz")
print("="*70)

TAR_FILE = "real_vs_fake.tar.gz"
EXTRACT_DIR = "data/real_vs_fake"

os.makedirs(EXTRACT_DIR, exist_ok=True)

if os.path.exists(TAR_FILE):
    print(f"Found {TAR_FILE}. Extracting... (this may take a few minutes)")

    with tarfile.open(TAR_FILE, "r:gz") as tar:
        # Get total members for progress bar
        members = tar.getmembers()
        for member in tqdm(members, desc="Extracting"):
            tar.extract(member, path=EXTRACT_DIR)

    print(f"\n✅ Extraction completed to folder: {EXTRACT_DIR}")

    # Show folder structure
    real_dir = os.path.join(EXTRACT_DIR, "real")
    fake_dir = os.path.join(EXTRACT_DIR, "fake")

    if os.path.exists(real_dir):
        real_count = len([f for f in os.listdir(real_dir) if f.endswith(('.jpg', '.png'))])
        print(f"Real images found : {real_count}")
    if os.path.exists(fake_dir):
        fake_count = len([f for f in os.listdir(fake_dir) if f.endswith(('.jpg', '.png'))])
        print(f"Fake images found : {fake_count}")

    print("\n✅ Step 1 Completed!")
    print("You can now proceed to Step 2 (Preprocessing).")

else:
    print(f"❌ Error: File '{TAR_FILE}' not found in current directory.")
    print("Please make sure 'real_vs_fake.tar.gz' is in the project folder.")