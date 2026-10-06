from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException, status
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

    @classmethod
    def validate_reps(cls, value):
        if value < 1:
            raise ValueError("Target reps must be at least 1")
        return value

# In-memory stores
current_squat_state = None
current_squat_timestamp = 0.0
current_settings = AlarmSettings(target_reps=10, active_tune="alarm.wav", is_active=False)

# ─── WebSockets ───────────────────────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

@app.websocket("/squat/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send current state immediately upon connection
        if current_squat_state:
            await websocket.send_json(current_squat_state)
        while True:
            # Keep connection open, client doesn't need to send anything
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Squat API is running"}

@app.post("/squat/result")
async def receive_squat_result(result: SquatResultSchema):
    global current_squat_state, current_squat_timestamp
    current_squat_timestamp = time.time()
    current_squat_state = {**result.model_dump(), "timestamp": current_squat_timestamp}
    # Broadcast to all connected app clients instantly
    await manager.broadcast_json(current_squat_state)
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
    if settings.target_reps < 1:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Target reps must be at least 1")
    if not settings.active_tune.endswith(".wav"):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Active tune must be a .wav file")
        
    global current_settings
    current_settings = settings
    return {"status": "updated", "data": current_settings.model_dump()}

@app.get("/alarm/settings")
def get_settings():
    return current_settings.model_dump()

@app.get("/alarm/tunes")
def list_tunes():
    try:
        os.makedirs("tunes", exist_ok=True)
        return [f for f in os.listdir("tunes") if f.endswith(".wav")]
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to list tunes: {str(e)}")

@app.post("/alarm/upload")
def upload_tune(file: UploadFile = File(...)):
    if not file.filename.endswith(".wav"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only .wav files are allowed")
        
    try:
        os.makedirs("tunes", exist_ok=True)
        filepath = f"tunes/{file.filename}"
        
        # Check file size (limit to 5MB for safety)
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > 5 * 1024 * 1024:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large. Maximum size is 5MB.")

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename, "size": file_size}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
