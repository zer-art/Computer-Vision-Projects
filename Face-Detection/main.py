from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from src.utils import Detection
import cv2
import numpy as np
import base64
import io
from PIL import Image
import json

app = FastAPI(title="Face Detection API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize detection
detector = Detection()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("index.html", "r") as file:
        return HTMLResponse(content=file.read())

@app.post("/api/detect_faces")
async def detect_faces_from_image(file: UploadFile = File(...)):
    try:
        # Read image file
        contents = await file.read()
        
        # Convert to opencv format
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Detect faces
        faces = detector.detect_faces_in_frame(img)
        
        return JSONResponse({
            "success": True,
            "faces_count": len(faces),
            "faces": faces,
            "image_shape": {
                "height": img.shape[0],
                "width": img.shape[1]
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.post("/api/detect_faces_base64")
async def detect_faces_from_base64(data: dict):
    try:
        # Extract base64 data
        image_data = data.get("image")
        if not image_data:
            raise HTTPException(status_code=400, detail="No image data provided")
        
        # Remove data URL prefix if present
        if "data:image" in image_data:
            image_data = image_data.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Convert to opencv format
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Detect faces
        faces = detector.detect_faces_in_frame(img)
        
        return JSONResponse({
            "success": True,
            "faces_count": len(faces),
            "faces": faces,
            "image_shape": {
                "height": img.shape[0],
                "width": img.shape[1]
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "message": "Face Detection API is running"}

@app.get("/api/detection_info")
async def get_detection_info():
    """
    Get information about the detection system
    """
    return {
        "cascade_path": detector.cascade_path,
        "detection_params": {
            "scaleFactor": 1.1,
            "minNeighbors": 5,
            "minSize": [30, 30]
        },
        "supported_formats": ["jpg", "jpeg", "png", "bmp", "webp"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)