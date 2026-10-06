from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal, List
import os
import shutil
import time

app = FastAPI(title="Squrts Minimal API")

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Allow all origins so Android emulator & real devices can reach this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SquatResultSchema(BaseModel):
    exercise: str
    state: Literal["STANDING", "DESCENDING", "BOTTOM", "ASCENDING"]
    reps: int
    valid_rep: bool
    confidence: Optional[float]
    completed: bool

class AlarmSettings(BaseModel):
    target_reps: int
    active_tune: str
    is_active: bool

# In-memory stores
current_squat_state = None
current_squat_timestamp = 0.0
current_settings = AlarmSettings(target_reps=10, active_tune="alarm.wav", is_active=False)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Squat API is running"}

@app.post("/squat/result")
def receive_squat_result(result: SquatResultSchema):
    global current_squat_state, current_squat_timestamp
    current_squat_timestamp = time.time()
    current_squat_state = {**result.model_dump(), "timestamp": current_squat_timestamp}
    return {"status": "received", "data": current_squat_state}

@app.get("/squat/state")
def get_squat_state():
    if current_squat_state is None:
        return {}
    # Mark as stale if no update in last 5 seconds
    stale = (time.time() - current_squat_timestamp) > 5.0
    return {**current_squat_state, "stale": stale}

@app.post("/alarm/settings")
def update_settings(settings: AlarmSettings):
    global current_settings
    current_settings = settings
    return {"status": "updated", "data": current_settings.model_dump()}

@app.get("/alarm/settings")
def get_settings():
    return current_settings.model_dump()

@app.get("/alarm/tunes")
def list_tunes():
    os.makedirs("tunes", exist_ok=True)
    return [f for f in os.listdir("tunes") if f.endswith(".wav")]

@app.post("/alarm/upload")
def upload_tune(file: UploadFile = File(...)):
    os.makedirs("tunes", exist_ok=True)
    filepath = f"tunes/{file.filename}"
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
