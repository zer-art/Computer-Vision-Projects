# Pneumonia Detection Web App

This project is a web application for detecting pneumonia from pediatric chest X-ray images using a Convolutional Neural Network (CNN) built with TensorFlow and Keras. The backend is powered by FastAPI, and the frontend is a simple HTML page.

## Model Details
- **Architecture**: Sequential Convolutional Neural Network (CNN)
- **Parameters**: 11,169,218 (~42.6 MB)
- **Input Shape**: (224, 224, 3)

## Dataset Details
- **Source**: [Pediatric Pneumonia Chest X-ray (Kaggle)](https://www.kaggle.com/datasets/andrewmvd/pediatric-pneumonia-chest-xray)
- **Split Strategy**:
    - **Training**: 4,186 images
    - **Validation**: 1,046 images
    - **Test**: 624 images
- **Augmentation Strategy**: Random Horizontal Flip, Random Rotation (10%), Random Zoom (10%)
- **Class Balance**: Imbalanced (Typical for medical datasets, addressed via metrics like Sensitivity/Specificity)

## Performance Metrics
| Metric | Value |
| **Test Accuracy** | **81.09%** |
| **Validation Accuracy** | **93.69%** |
| **Test Loss** | 0.4493 |
| **Validation Loss** | 0.1598 |
| **Sensitivity (Recall)** | **94.87%** |
| **Specificity** | **58.12%** |

> [!NOTE]
> **Metric Interpretation:** High sensitivity (94.87%) is excellent for disease screening, minimizing false negatives. The lower specificity (58.12%) indicates a higher rate of false positives, which is a safer trade-off in medical contexts than missing cases.

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

> [!WARNING]
> The trained model file `my_pneumonia_classifier_sequential_model.h5` is required but **not included** in this repository.

To generate the model:
1.  Open `training_notebook.ipynb` (renamed from `Pneumonia Detection`).
2.  Run all cells to train the model and save it as `my_pneumonia_classifier_sequential_model.h5`.

### 4. Run the FastAPI server

```sh
uvicorn main:app --reload
```

The server will start at `http://localhost:8000`.

### 5. Open the Frontend

Open `index.html` in your browser. Upload a chest X-ray image and click "Send" to get the prediction.

## File Structure

- `main.py`: FastAPI backend for prediction
- `index.html`: Frontend for uploading images and displaying results
- `requirements.txt`: Python dependencies
- `training_notebook.ipynb`: Jupyter notebook used for training and evaluation
- `my_pneumonia_classifier_sequential_model.h5`: Trained model (needs to be generated)
- `Readme.md`: Project documentation

## License

MIT License
