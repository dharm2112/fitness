# Fitness Counter (Squats)

This project implements a live fitness counter using MediaPipe for pose detection and simple algorithms for angle calculation, smoothing, and repetition counting.

Features
- Real-time webcam processing using MediaPipe Pose
- Squat counting state machine
- Side-panel UI with confidence, FPS, and warnings
- CLI options for camera, video file input, processing scale, and MediaPipe thresholds

Quickstart
1. Create and activate a Python virtual environment (recommended):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # PowerShell
# or .\.venv\Scripts\activate  # cmd
```

2. Install dependencies (example):

```powershell
pip install -r requirements.txt
```

3. Run with webcam (default camera 0):

```powershell
python main.py
```

4. Run from a video file (useful for debugging):

```powershell
python main.py --video samples/sample.mp4
```

Useful CLI flags
- --camera N           : camera device index (default 0)
- --video PATH         : path to a video file to process instead of webcam
- --width, --height    : set capture resolution for webcam
- --proc-scale FLOAT   : scale factor <=1.0 to speed up processing (0.5 = half resolution)
- --min-detect-confidence FLOAT : MediaPipe detection threshold (default 0.5)
- --min-track-confidence FLOAT  : MediaPipe tracking threshold (default 0.5)

Running tests

```powershell
python -m pytest -q
```

Troubleshooting
- If no landmarks are detected: ensure the subject is visible, good lighting, and try `--proc-scale 1.0` and lower detection thresholds `--min-detect-confidence 0.3`.
- If camera can't open: check Windows Privacy settings and other apps that may be using the camera.

Contributing
- Add tests under `tests/` for any algorithmic code.
- Follow PEP8; consider running `black` and `flake8` before opening PRs.

License: MIT (add your license here)
