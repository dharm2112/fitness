from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import Optional, Literal, List
import os
import shutil

app = FastAPI(title="Squrts Minimal API")

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
current_settings = AlarmSettings(target_reps=10, active_tune="alarm.wav", is_active=False)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Squat API is running"}

@app.post("/squat/result")
def receive_squat_result(result: SquatResultSchema):
    global current_squat_state
    current_squat_state = result.model_dump()
    return {"status": "received", "data": current_squat_state}

@app.get("/squat/state")
def get_squat_state():
    return current_squat_state or {}

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
