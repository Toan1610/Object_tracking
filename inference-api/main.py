from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
import tempfile
from pathlib import Path
from run_inference import run_model
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Khởi tạo Supabase
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase environment variables.")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI()

# 🔥 Dùng đường dẫn tương đối để hoạt động cả local lẫn Docker
BASE_DIR = Path(__file__).parent
STATIC_DIR = BASE_DIR / "static"
STATIC_DIR.mkdir(parents=True, exist_ok=True)  # Tạo nếu chưa có

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Cho phép CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "This is the AI inference API. Use POST /predict to analyze images."}

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    model: str = Form(...),
    user_id: str = Form(None),
):
    temp_dir = tempfile.gettempdir()
    filename = file.filename or "uploaded_file"
    temp_path = os.path.join(temp_dir, filename)

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"[INFO] Saved temp file to {temp_path}")

    result = run_model(temp_path, model)
    if not isinstance(result, dict):
        result = {}

    # Lưu log vào Supabase
    try:
        supabase_client.table("predictions").insert({
            "filename": filename,
            "model": model,
            "result_type": result.get("resultType", ""),
            "detections": result.get("detections", 0),
            "classes": result.get("classes", []),
            "raw_result": result,
            "user_id": user_id
        }).execute()
    except Exception as e:
        print("[WARN] Failed to insert log into Supabase:", e)

    return result
