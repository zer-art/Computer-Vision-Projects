# Face Detection Project

A real-time face detection system built with OpenCV, FastAPI, and modern web technologies.

## Features

- **Real-time Face Detection**: Uses OpenCV's Haar cascade classifiers for accurate face detection
- **Web Interface**: Modern, responsive web interface with live video feed
- **Video Recording**: Record detected face sessions directly in the browser
- **FastAPI Backend**: Robust API backend for processing computer vision tasks
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Technology Stack

### Backend
- **Python 3.8+**: Core programming language
- **OpenCV**: Computer vision and image processing
- **FastAPI**: Modern web framework for APIs
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server for running FastAPI applications

### Frontend
- **HTML5**: WebRTC and Canvas API for video processing
- **CSS3**: Modern styling with flexbox and grid layouts
- **JavaScript**: Client-side video handling and UI interactions
- **Font Awesome**: Icons and visual elements

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zer-art/FACE-DETECTION.git
   cd FACE-DETECTION
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. **Start the application**
   ```bash
   python main.py
   ```

2. **Open your browser**
   Navigate to `http://localhost:8000` or simply open `index.html`

3. **Start face detection**
   - Click "Start Camera" to access your webcam
   - The system will automatically detect faces and draw bounding boxes
   - Use "Record" to save detection sessions

## Project Structure

```
FACE-DETECTION/
├── data/                           # Haar cascade files
│   ├── haarcascade_frontalface_default.xml
│   └── haarcascade_eye.xml
├── src/                           # Source code
│   ├── __init__.py
│   └── utils.py                   # Detection class
├── static/                        # Web assets
│   ├── style.css                  # Styling
│   └── script.js                  # JavaScript functionality
├── index.html                     # Main web interface
├── main.py                        # FastAPI application
├── requirements.txt               # Python dependencies
└── README.md                      # This file
```

## How It Works

1. **Video Capture**: The web interface captures video from the user's camera using WebRTC
2. **Frame Processing**: Video frames are processed using OpenCV's face detection algorithms
3. **Face Detection**: Haar cascade classifiers identify faces in the video stream
4. **Visualization**: Detected faces are highlighted with bounding boxes and labels
5. **Real-time Display**: Results are displayed in real-time on the web interface

## Configuration

The face detection can be configured by modifying parameters in `src/utils.py`:

- `scaleFactor`: How much the image size is reduced at each scale
- `minNeighbors`: How many neighbors each candidate rectangle should have to retain it
- `minSize`: Minimum possible object size, smaller objects are ignored

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Keyboard Shortcuts

- **Space**: Start/Stop camera
- **R**: Start/Stop recording
- **1**: Switch to README tab
- **2**: Switch to Code tab
- **3**: Switch to Tech Stack tab

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OpenCV community for excellent computer vision tools
- FastAPI team for the modern web framework
- Haar cascade classifiers from OpenCV's pre-trained models

## Troubleshooting

### Camera Access Issues
- Ensure your browser has camera permissions
- Check if another application is using the camera
- Try refreshing the page or restarting the browser

### Performance Issues
- Reduce video resolution in the camera settings
- Close unnecessary browser tabs
- Check system CPU usage

### Detection Accuracy
- Ensure good lighting conditions
- Position your face clearly in the camera view
- Adjust the cascade parameters for better detection

## Future Enhancements

- [ ] Real-time emotion detection
- [ ] Multiple face tracking
- [ ] Age and gender estimation
- [ ] Export detection data
- [ ] WebSocket integration for live streaming
- [ ] Mobile app development
