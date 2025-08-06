import tensorflow as tf
from tensorflow.keras.models import load_model
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import numpy as np
import io

# Load model and class names
model = load_model('my_pneumonia_classifier_sequential_model.h5')
class_names = ['NORMAL', 'PNEUMONIA']

# Create app
app = FastAPI()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict/")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image = image.resize((224, 224))

        # Preprocess
        image_array = np.array(image) / 255.0  # Normalize
        image_array = np.expand_dims(image_array, axis=0)  # (1, 224, 224, 3)

        # Predict
        predictions = model.predict(image_array)
        predicted_class = int(np.argmax(predictions))
        confidence = float(predictions[0][predicted_class])
        label = class_names[predicted_class]

        return {
            "message": label,
            "confidence": confidence
        }
    except Exception as e:
        return {"error": str(e)}
