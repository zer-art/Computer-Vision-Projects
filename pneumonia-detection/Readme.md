# 🫁 Pneumonia Detection using Deep Learning (CNN)

A computer vision project that uses a custom Convolutional Neural Network (CNN) to classify chest X-ray images as either **NORMAL** or **PNEUMONIA**. The model was trained on the Pediatric Chest X-Ray Pneumonia dataset from Kaggle and achieves ~**93.69% validation accuracy**.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Dataset](#dataset)
- [Project Structure](#project-structure)
- [Model Architecture](#model-architecture)
- [How It Works](#how-it-works)
- [Data Preprocessing & Augmentation](#data-preprocessing--augmentation)
- [Training Details](#training-details)
- [Results](#results)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Running Inference](#running-inference)
- [Future Improvements](#future-improvements)

---

## Overview

Pneumonia is a serious infection that inflames the air sacs in one or both lungs. Early and accurate diagnosis from chest X-rays is critical for effective treatment. This project automates pneumonia detection using a deep learning model trained end-to-end on labeled chest X-ray images.

The workflow includes:
1. **Data Loading** — Loading and splitting the Pediatric Chest X-Ray dataset.
2. **Augmentation & Preprocessing** — Applying random flips, rotations, zooms, and pixel normalization.
3. **Model Building** — A custom 3-block CNN with dense layers and dropout regularization.
4. **Training** — Optimizing with Adam and sparse categorical cross-entropy loss.
5. **Evaluation** — Measuring accuracy and loss on held-out validation and test sets.
6. **Inference** — Running the saved model on new X-ray images.

---

## Dataset

**Name:** Pediatric Chest X-Ray Pneumonia  
**Source:** [Kaggle — Chest X-Ray Images (Pneumonia)](https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia)  
**Original Paper:** Kermany et al., *Identifying Medical Diagnoses and Treatable Diseases by Image-Based Deep Learning*, Cell 2018.

### Dataset Summary

The dataset contains chest X-ray images organized into two classes:

| Split     | NORMAL | PNEUMONIA | Total |
|-----------|--------|-----------|-------|
| Train     | 1,349  | 3,883     | 5,232 |
| Test      | 234    | 390       | 624   |

> **Note:** 80% of the training data was used for training and 20% was held out as the validation set (using a fixed `seed=123`), giving:
> - Training: **4,186** images
> - Validation: **1,046** images

### Class Labels

| Index | Class     |
|-------|-----------|
| 0     | NORMAL    |
| 1     | PNEUMONIA |

Pneumonia cases include both **bacterial** and **viral** subtypes, identifiable by the image file naming convention (e.g., `person1_bacteria_1.jpeg`, `person1_virus_1.jpeg`).

---

## Project Structure

```
pneumonia-detection/
│
├── data/                        # Dataset directory (locally stored)
│   ├── train/
│   │   ├── NORMAL/              # 1,349 normal chest X-rays
│   │   └── PNEUMONIA/           # 3,883 pneumonia chest X-rays
│   └── test/
│       ├── NORMAL/              # 234 normal chest X-rays
│       └── PNEUMONIA/           # 390 pneumonia chest X-rays
│
├── input/                       # Sample input images for inference
│   └── person1_virus_6.jpeg
│
├── models/                      # Saved trained models
│   ├── my_pneumonia_classifier_sequential_model.h5   # Classifier model
│   └── preprocessor.h5                               # Preprocessing/rescaling model
│
├── notebooks/
│   └── pneumonia-detection.ipynb   # Full training + evaluation notebook (Kaggle)
│
├── main.py                      # Inference script
├── pixi.toml                    # Dependency management (Pixi)
├── pixi.lock                    # Locked dependency versions
└── README.md                    # This file
```

---

## Model Architecture

The classifier is a **Sequential CNN** built with TensorFlow/Keras. It accepts 224×224 RGB chest X-ray images and outputs a probability distribution over 2 classes.

### Full Architecture

| Layer               | Output Shape          | Parameters  |
|---------------------|-----------------------|-------------|
| Conv2D (32 filters, 3×3, ReLU) | (None, 222, 222, 32) | 896       |
| MaxPooling2D (2×2)  | (None, 111, 111, 32)  | 0           |
| Conv2D (64 filters, 3×3, ReLU) | (None, 109, 109, 64) | 18,496    |
| MaxPooling2D (2×2)  | (None, 54, 54, 64)    | 0           |
| Conv2D (128 filters, 3×3, ReLU) | (None, 52, 52, 128) | 73,856    |
| MaxPooling2D (2×2)  | (None, 26, 26, 128)   | 0           |
| Flatten             | (None, 86,528)        | 0           |
| Dense (128, ReLU)   | (None, 128)           | 11,075,712  |
| Dropout (0.5)       | (None, 128)           | 0           |
| Dense (2, Softmax)  | (None, 2)             | 258         |

**Total Parameters:** 11,169,218 (~42.61 MB)  
**Trainable Parameters:** 11,169,218  
**Non-trainable Parameters:** 0

### Design Rationale

- **3 Convolutional Blocks** — Each block progressively doubles the number of filters (32 → 64 → 128), allowing the network to learn low-level features (edges, textures) and higher-level semantic patterns (lung patterns, opacities).
- **MaxPooling** — Reduces spatial dimensions after each conv block, improving computational efficiency and translational invariance.
- **Flatten + Dense** — Converts spatial feature maps into a 1D vector for classification decisions.
- **Dropout (0.5)** — Randomly drops 50% of neurons during training to combat overfitting.
- **Softmax Output** — Produces calibrated probabilities for each of the 2 classes.

---

## How It Works

### Training Phase (Notebook)

```
Input X-ray Image (224×224 RGB)
        │
        ▼
   Data Augmentation
  (Flip, Rotate, Zoom)
        │
        ▼
  Pixel Rescaling [0,255] → [0,1]
        │
        ▼
  Convolutional Block 1 (32 filters)
        │
        ▼
  Convolutional Block 2 (64 filters)
        │
        ▼
  Convolutional Block 3 (128 filters)
        │
        ▼
    Flatten Layer
        │
        ▼
  Dense (128 units, ReLU) + Dropout (0.5)
        │
        ▼
  Dense (2 units, Softmax)
        │
        ▼
  [P(NORMAL), P(PNEUMONIA)]
```

### Inference Phase (`main.py`)

```
Input Image
     │
     ▼
Load preprocessor.h5  →  Rescale pixels
     │
     ▼
Load classifier.h5  →  Forward pass
     │
     ▼
argmax(predictions)
     │
     ├── index == 1  →  "Pneumonia found"
     └── index == 0  →  "Normal"
```

---

## Data Preprocessing & Augmentation

### Augmentation (Training only)

Applied **on-the-fly** during training using a Keras `Sequential` augmentation pipeline:

| Technique       | Parameter             | Purpose                                           |
|-----------------|-----------------------|---------------------------------------------------|
| Random Flip     | Horizontal            | Simulates left/right variation in X-ray positioning |
| Random Rotation | ±10% (±18°)          | Accounts for slight patient rotation              |
| Random Zoom     | ±10%                  | Handles varying distances/magnifications          |

> Augmentation is **only applied during training** — validation/test data is not augmented.

### Normalization

All images are rescaled using `Rescaling(1./255)`, mapping pixel values from `[0, 255]` to `[0, 1]`. This is applied to both training and validation/test data.

### Performance Optimization

The `tf.data` API is used with:
- **`.cache()`** — Caches the dataset in memory after the first epoch for faster access.
- **`.prefetch(AUTOTUNE)`** — Prefetches batches in background to avoid GPU/CPU idle time.

---

## Training Details

| Hyperparameter     | Value                                  |
|--------------------|----------------------------------------|
| Image Size         | 224 × 224                              |
| Batch Size         | 32                                     |
| Epochs             | 4                                      |
| Optimizer          | Adam (default lr = 0.001)              |
| Loss Function      | Sparse Categorical Cross-Entropy       |
| Validation Split   | 20% of training data (seed=123)        |
| Augmentation       | Flip, Rotation ±10%, Zoom ±10%        |

### Training Environment

The model was trained on **Kaggle** (CPU-only environment — no GPU was available during training):
- Python 3.11
- TensorFlow ≥ 2.21.0
- Training time: ~4 minutes per epoch (~16 minutes total)

---

## Results

### Training Progress

| Epoch | Train Loss | Train Accuracy | Val Loss | Val Accuracy |
|-------|------------|----------------|----------|--------------|
| 1     | 0.8266     | 71.68%         | 0.3868   | 78.20%       |
| 2     | 0.4114     | 78.83%         | 0.2622   | 91.49%       |
| 3     | 0.3212     | 86.91%         | 0.2415   | 93.79%       |
| 4     | 0.2564     | 89.17%         | 0.1815   | **93.69%**   |

### Final Evaluation

| Metric             | Value   |
|--------------------|---------|
| Validation Loss    | 0.1815  |
| Validation Accuracy| 93.69%  |

### Sample Predictions

| True Label | Predicted | Confidence     |
|------------|-----------|----------------|
| PNEUMONIA  | PNEUMONIA | 99.97%         |
| PNEUMONIA  | PNEUMONIA | 83.57%         |
| PNEUMONIA  | PNEUMONIA | 99.99%         |
| NORMAL     | NORMAL    | 69.57%         |
| PNEUMONIA  | PNEUMONIA | 95.72%         |

---

## Technologies Used

| Technology            | Version      | Purpose                                              |
|-----------------------|--------------|------------------------------------------------------|
| **Python**            | 3.11.*       | Core programming language                            |
| **TensorFlow/Keras**  | ≥ 2.21.0     | Deep learning framework — model building & training  |
| **NumPy**             | Latest       | Numerical operations & array manipulation            |
| **Matplotlib**        | ≥ 3.11.2     | Plotting training accuracy & loss curves             |
| **Scikit-learn**      | ≥ 1.9.1      | Metrics & evaluation utilities                       |
| **Seaborn**           | ≥ 0.13.2     | Statistical data visualization                       |
| **Pillow**            | ≥ 12.3.0     | Image loading & manipulation                         |
| **OpenCV (headless)** | ≥ 4.11.0     | Computer vision utilities                            |
| **ipykernel**         | ≥ 7.4.0      | Jupyter notebook kernel                              |
| **Pixi**              | —            | Conda-compatible package & environment manager       |
| **Kaggle**            | —            | Training platform with dataset hosting               |

---

## Getting Started

### Prerequisites

- [Pixi](https://prefix.dev/docs/pixi/overview) installed on your system.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd pneumonia-detection
   ```

2. **Install dependencies using Pixi:**
   ```bash
   pixi install
   ```
   This will create an isolated environment with all required packages as specified in `pixi.toml`.

3. **Activate the environment:**
   ```bash
   pixi shell
   ```

---

## Running Inference

To classify a chest X-ray image as NORMAL or PNEUMONIA using the pre-trained model:

1. **Place your input image** in the `input/` directory.

2. **Edit `main.py`** to point to your image (if needed):
   ```python
   img = tf.keras.utils.load_img('input/your_image.jpeg')
   ```

3. **Run the inference script:**
   ```bash
   pixi run python main.py
   ```

### How `main.py` works:

```python
import numpy as np
import tensorflow as tf

# Load the saved models
preprocessor = tf.keras.models.load_model('models/preprocessor.h5')
classifier   = tf.keras.models.load_model('models/my_pneumonia_classifier_sequential_model.h5')

# Load and prepare the input image
img       = tf.keras.utils.load_img('input/person1_virus_6.jpeg')
img_array = tf.keras.utils.img_to_array(img)

# Add batch dimension → (1, H, W, C)
raw_img_batch   = np.expand_dims(img_array, axis=0)

# Preprocess (rescale to [0,1])
processed_batch = preprocessor(raw_img_batch)

# Predict
predictions          = classifier.predict(processed_batch)
predicted_class_index = np.argmax(predictions[0])

# Output result
if predicted_class_index == 1:
    print("Pneumonia found")
else:
    print("Normal")
```

---

## Future Improvements

- **Transfer Learning** — Fine-tune a pre-trained backbone (e.g., ResNet50, EfficientNet, VGG16) for higher accuracy with fewer training epochs.
- **Class Imbalance Handling** — Apply class weights or oversampling (SMOTE) to address the 3:1 PNEUMONIA:NORMAL imbalance in the training set.
- **More Epochs & LR Scheduling** — Train for longer with a learning rate scheduler (e.g., cosine annealing) to squeeze out additional accuracy.
- **Grad-CAM Visualization** — Add gradient-weighted class activation mapping to highlight which regions of the X-ray influenced the prediction, improving model interpretability.
- **Bacteria vs. Virus Classification** — Extend the model to a 3-class problem (Normal, Bacterial Pneumonia, Viral Pneumonia).
- **Web/API Deployment** — Wrap the inference script in a Flask/FastAPI endpoint for real-world integration.
- **Data Augmentation Tuning** — Experiment with more aggressive augmentations (brightness, contrast, shear) to further improve generalization.

---

## Author

**Pawan Parida**  
GitHub: [@zer-art](https://github.com/zer-art)

---

## License

This project is open source and available under the [MIT License](LICENSE).
