# Pneumonia Detection Web App

This project is a web application for detecting pneumonia from pediatric chest X-ray images using a Convolutional Neural Network (CNN) built with TensorFlow and Keras. The backend is powered by FastAPI, and the frontend is a simple HTML page.

## Features

- Upload chest X-ray images and get predictions (Normal or Pneumonia)
- Confidence score for each prediction
- FastAPI backend with CORS enabled for easy frontend integration

## Setup Instructions

### 1. Clone the repository

```sh
git clone https://github.com/zer-art/pneumonia-detection

```

### 2. Install dependencies

```sh
pip install -r requirements.txt
```

### 3. Place the Model

Ensure you have the trained model file `my_pneumonia_classifier_sequential_model.h5` in the project root directory.

### 4. Run the FastAPI server

```sh
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`.

### 5. Open the Frontend

Open `index.html` in your browser. Upload a chest X-ray image and click "Send" to get the prediction.

## File Structure

- `main.py` - FastAPI backend for prediction
- `index.html` - Frontend for uploading images and displaying results
- `requirements.txt` - Python dependencies
- `my_pneumonia_classifier_sequential_model.h5` - Trained model (not included)
- `Readme.md` - Project documentation

## Dataset
```
https://www.kaggle.com/datasets/andrewmvd/pediatric-pneumonia-chest-xray
```

## License

MIT License
