// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const recordBtn = document.getElementById('recordBtn');
const videoElement = document.getElementById('videoElement');
const overlayCanvas = document.getElementById('overlayCanvas');
const statusText = document.getElementById('statusText');
const statusIcon = document.getElementById('statusIcon');

// Global variables
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;
let detectionInterval = null;
let isDetecting = false;

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Face detection variables
let lastDetectionTime = 0;
const DETECTION_INTERVAL = 500; // ms between detections

// Navigation functionality
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links and tabs
        navLinks.forEach(l => l.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Show corresponding tab content
        const tabId = link.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Video functionality
async function startCamera() {
    try {
        // Check API health first
        await checkAPIHealth();
        
        // Request camera access
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user'
            },
            audio: false
        });

        // Set video source
        videoElement.srcObject = mediaStream;
        
        // Update UI
        updateStatus('Camera active - Starting face detection...', 'online');
        startBtn.disabled = true;
        stopBtn.disabled = false;
        recordBtn.disabled = false;

        // Setup canvas for overlay
        setupCanvas();
        
        // Start face detection
        startFaceDetection();

    } catch (error) {
        console.error('Error accessing camera:', error);
        updateStatus('Camera access denied or API unavailable', 'offline');
        alert('Unable to access camera or connect to API. Please ensure you have granted camera permissions and the FastAPI server is running.');
    }
}

function stopCamera() {
    if (mediaStream) {
        // Stop face detection
        stopFaceDetection();
        
        // Stop all tracks
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
        
        // Clear video element
        videoElement.srcObject = null;
        
        // Stop recording if active
        if (isRecording) {
            stopRecording();
        }
        
        // Clear canvas
        const canvas = overlayCanvas;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update UI
        updateStatus('Camera not started', 'offline');
        startBtn.disabled = false;
        stopBtn.disabled = true;
        recordBtn.disabled = true;
    }
}

function setupCanvas() {
    const canvas = overlayCanvas;
    const video = videoElement;
    
    // Set canvas size to match video
    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });
    
    // Add detection overlay if it doesn't exist
    if (!document.getElementById('detectionOverlay')) {
        addDetectionOverlay();
    }
}

function startRecording() {
    if (!mediaStream) {
        alert('Please start the camera first');
        return;
    }

    try {
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(mediaStream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `face-detection-${new Date().toISOString().slice(0, 19)}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
        };

        mediaRecorder.start();
        isRecording = true;
        
        // Update button
        recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
        recordBtn.classList.add('recording');
        
        updateStatus('Recording...', 'online');

    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Recording not supported in this browser');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        isRecording = false;
        
        // Reset button
        recordBtn.innerHTML = '<i class="fas fa-record-vinyl"></i> Record';
        recordBtn.classList.remove('recording');
        
        updateStatus('Camera active', 'online');
    }
}

function updateStatus(text, status) {
    statusText.textContent = text;
    statusIcon.className = `status-dot ${status}`;
}

// Event listeners
startBtn.addEventListener('click', startCamera);
stopBtn.addEventListener('click', stopCamera);

recordBtn.addEventListener('click', () => {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

// API Functions
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (!response.ok) {
            throw new Error('API health check failed');
        }
        return await response.json();
    } catch (error) {
        throw new Error(`API is not available: ${error.message}`);
    }
}

async function detectFacesInFrame(imageData) {
    try {
        const response = await fetch(`${API_BASE_URL}/detect_faces_base64`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageData })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error detecting faces:', error);
        return { success: false, error: error.message };
    }
}

// Face Detection Functions
function startFaceDetection() {
    if (detectionInterval) {
        clearInterval(detectionInterval);
    }
    
    isDetecting = true;
    updateStatus('Face detection active', 'online');
    
    detectionInterval = setInterval(async () => {
        if (!videoElement.srcObject || !isDetecting) {
            return;
        }
        
        const currentTime = Date.now();
        if (currentTime - lastDetectionTime < DETECTION_INTERVAL) {
            return;
        }
        
        lastDetectionTime = currentTime;
        await performFaceDetection();
    }, 100);
}

function stopFaceDetection() {
    isDetecting = false;
    if (detectionInterval) {
        clearInterval(detectionInterval);
        detectionInterval = null;
    }
}

async function performFaceDetection() {
    const startTime = performance.now();
    
    try {
        // Capture frame from video
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        if (canvas.width === 0 || canvas.height === 0) {
            return;
        }
        
        ctx.drawImage(videoElement, 0, 0);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send to API for detection
        const result = await detectFacesInFrame(imageData);
        
        const processingTime = performance.now() - startTime;
        updateDetectionStats(processingTime);
        
        if (result.success && result.faces) {
            drawFaceDetections(result.faces);
            updateDetectionStatus(result.faces_count);
        } else {
            // Clear previous detections
            clearDetections();
        }
        
    } catch (error) {
        console.error('Face detection error:', error);
        clearDetections();
    }
}

function drawFaceDetections(faces) {
    const canvas = overlayCanvas;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw face rectangles
    faces.forEach((face, index) => {
        const { x, y, width, height, confidence } = face;
        
        // Scale coordinates to canvas size
        const scaleX = canvas.width / videoElement.videoWidth;
        const scaleY = canvas.height / videoElement.videoHeight;
        
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;
        
        // Draw rectangle
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 3;
        ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);
        
        // Draw label
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Arial';
        ctx.fillText(
            `Face ${index + 1} (${Math.round(confidence * 100)}%)`, 
            scaledX, 
            scaledY - 10
        );
        
        // Draw corner markers
        const cornerSize = 15;
        ctx.lineWidth = 2;
        
        // Top-left corner
        ctx.beginPath();
        ctx.moveTo(scaledX, scaledY + cornerSize);
        ctx.lineTo(scaledX, scaledY);
        ctx.lineTo(scaledX + cornerSize, scaledY);
        ctx.stroke();
        
        // Top-right corner
        ctx.beginPath();
        ctx.moveTo(scaledX + scaledWidth - cornerSize, scaledY);
        ctx.lineTo(scaledX + scaledWidth, scaledY);
        ctx.lineTo(scaledX + scaledWidth, scaledY + cornerSize);
        ctx.stroke();
        
        // Bottom-left corner
        ctx.beginPath();
        ctx.moveTo(scaledX, scaledY + scaledHeight - cornerSize);
        ctx.lineTo(scaledX, scaledY + scaledHeight);
        ctx.lineTo(scaledX + cornerSize, scaledY + scaledHeight);
        ctx.stroke();
        
        // Bottom-right corner
        ctx.beginPath();
        ctx.moveTo(scaledX + scaledWidth - cornerSize, scaledY + scaledHeight);
        ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight);
        ctx.lineTo(scaledX + scaledWidth, scaledY + scaledHeight - cornerSize);
        ctx.stroke();
    });
}

function clearDetections() {
    const canvas = overlayCanvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updateDetectionStatus(faceCount) {
    if (faceCount > 0) {
        updateStatus(`Detecting ${faceCount} face${faceCount > 1 ? 's' : ''}`, 'online');
    } else {
        updateStatus('No faces detected', 'online');
    }
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRecording) {
        stopRecording();
    }
});

// Handle window close/refresh
window.addEventListener('beforeunload', () => {
    if (mediaStream) {
        stopCamera();
    }
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', async () => {
    // Check API status on page load
    try {
        await checkAPIHealth();
        console.log('FastAPI backend is available');
    } catch (error) {
        console.warn('FastAPI backend is not available:', error.message);
        updateStatus('API unavailable - using offline mode', 'offline');
    }
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add loading animation to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.disabled) {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            }
        });
    });

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space bar to start/stop camera
        if (e.code === 'Space' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (mediaStream) {
                stopCamera();
            } else {
                startCamera();
            }
        }
        
        // R key to start/stop recording
        if (e.code === 'KeyR' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            if (!recordBtn.disabled) {
                recordBtn.click();
            }
        }
        
        // Tab navigation with numbers
        if (e.code === 'Digit1') {
            e.preventDefault();
            document.querySelector('[data-tab="readme"]').click();
        }
        if (e.code === 'Digit2') {
            e.preventDefault();
            document.querySelector('[data-tab="code"]').click();
        }
        if (e.code === 'Digit3') {
            e.preventDefault();
            document.querySelector('[data-tab="tech"]').click();
        }
    });
    
    // Add API status indicator
    addAPIStatusIndicator();
});

// Add CSS for recording animation and API status
const style = document.createElement('style');
style.textContent = `
    .btn.recording {
        animation: recordingPulse 1s infinite;
    }
    
    @keyframes recordingPulse {
        0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(255, 107, 107, 0); }
        100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
    }
    
    .tech-card:hover .tech-icon {
        transform: scale(1.1);
        transition: transform 0.3s ease;
    }
    
    .api-status {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .api-status.online {
        border-left: 4px solid #2ed573;
    }
    
    .api-status.offline {
        border-left: 4px solid #ff4757;
    }
    
    .detection-overlay {
        position: absolute;
        top: 10px;
        left: 10px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.5rem;
        border-radius: 5px;
        font-size: 0.9rem;
        z-index: 10;
    }
`;
document.head.appendChild(style);

// Utility Functions
function addAPIStatusIndicator() {
    const statusDiv = document.createElement('div');
    statusDiv.id = 'apiStatus';
    statusDiv.className = 'api-status offline';
    statusDiv.innerHTML = `
        <div class="status-dot offline"></div>
        <span>API: Checking...</span>
    `;
    document.body.appendChild(statusDiv);
    
    // Check API status periodically
    setInterval(async () => {
        try {
            await checkAPIHealth();
            updateAPIStatus(true);
        } catch (error) {
            updateAPIStatus(false);
        }
    }, 10000); // Check every 10 seconds
}

function updateAPIStatus(isOnline) {
    const statusDiv = document.getElementById('apiStatus');
    if (statusDiv) {
        statusDiv.className = `api-status ${isOnline ? 'online' : 'offline'}`;
        statusDiv.innerHTML = `
            <div class="status-dot ${isOnline ? 'online' : 'offline'}"></div>
            <span>API: ${isOnline ? 'Connected' : 'Offline'}</span>
        `;
    }
}

// Performance monitoring
let detectionStats = {
    totalDetections: 0,
    averageProcessingTime: 0,
    lastDetectionTime: 0
};

function updateDetectionStats(processingTime) {
    detectionStats.totalDetections++;
    detectionStats.averageProcessingTime = 
        (detectionStats.averageProcessingTime * (detectionStats.totalDetections - 1) + processingTime) / 
        detectionStats.totalDetections;
    detectionStats.lastDetectionTime = Date.now();
}

// Add detection statistics to the video overlay
function addDetectionOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'detectionOverlay';
    overlay.className = 'detection-overlay';
    overlay.innerHTML = 'Face Detection: Initializing...';
    
    const videoWrapper = document.querySelector('.video-wrapper');
    videoWrapper.appendChild(overlay);
    
    // Update overlay periodically
    setInterval(() => {
        if (isDetecting) {
            overlay.innerHTML = `
                Face Detection: Active<br>
                Total Detections: ${detectionStats.totalDetections}<br>
                Avg Processing: ${detectionStats.averageProcessingTime.toFixed(0)}ms
            `;
        } else {
            overlay.innerHTML = 'Face Detection: Inactive';
        }
    }, 1000);
}
