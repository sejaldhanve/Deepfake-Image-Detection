# 🔍 Deepfake & Media Provenance Detector

![React](https://img.shields.io/badge/Frontend-React.js-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![PyTorch](https://img.shields.io/badge/Model-PyTorch-orange)
![TailwindCSS](https://img.shields.io/badge/Styling-TailwindCSS-teal)

A full-stack, state-of-the-art **Deepfake Image Detection Application**. This project is engineered to forensically authenticate digital imagery, detecting artificial manipulations and AI-generated content (including StyleGAN, DALL-E, and Midjourney). 

When an image is analyzed, the system issues a **Cryptographically Secure "Proof of Authenticity" PDF Certificate**, complete with a SHA-256 file hash mapping.

---

## ✨ Features
*   **Dual-Engine Forensics:**
    *   **Engine 1 (Neural):** A custom-trained `EfficientNet-B0` PyTorch convolutional network trained on a massive Kaggle Real/Fake Face Dataset.
    *   **Engine 2 (Metadata Analytics):** A robust metadata heuristic engine to physically catch unaltered generated anomalies from architectures like StyleGAN2 (`thispersondoesnotexist.com`).
*   **Cryptographic Verification:** Automatically hashes uploaded files using SHA-256 and attaches the ledger verification to a downloadable PDF.
*   **Modern Glassmorphic UI:** A beautifully designed React frontend featuring smooth `framer-motion` animations, reactive drag-and-drop, and a fully translucent dark-mode UI.

## 🏗️ Architecture Stack
*   **Frontend**: React.js, Vite, Tailwind CSS, Framer Motion, Lucide-React
*   **Backend**: Python, FastAPI, Uvicorn (ASGI Server)
*   **Machine Learning**: PyTorch, Torchvision (EfficientNet-B0)
*   **Certificate Generation**: ReportLab (PDF formatting)

---

## 🚀 How to Run Locally

### 1. Setup the Backend (Python FastAPI)

Navigate to the `backend` directory and install the requirements:
```bash
cd backend
pip install -r requirements.txt
```

*(Ensure that the custom PyTorch model `final_deepfake_detector.pth` is placed inside `model_files/models/` before running).*

Start the application server:
```bash
python main.py
```
*The backend will boot up onto `http://localhost:8000`.*

### 2. Setup the Frontend (React.js)

Open a new terminal window, navigate to the `frontend` directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```
*The frontend will boot up onto `http://localhost:5173`. Open this URL in your web browser to interact with the application.*

---

## 📸 Usage
1. Open the web interface.
2. Drag and drop any image face or artwork onto the target area.
3. The Dual-Engine Forensic system will instantly infer whether the file is **REAL** or **FAKE** along with a confidence margin.
4. Click **Download Proof of Authenticity (PDF)** to receive your verifiable certificate.

---

## 🧠 Model Training (Optional)
This repository includes the scripts used to extract, preprocess, and train the custom `EfficientNet-B0` neural network located in `/model_files/`:
1. `1_extract_data.py`: Unzips the dataset.
2. `2_preprocessing.py`: Builds the PyTorch DataLoaders.
3. `3_train_model.py`: Automates the 10-epoch training loop.
4. `4_test_model.py`: Script to validate the generated `.pth` file outputs.
