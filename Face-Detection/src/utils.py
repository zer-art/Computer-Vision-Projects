import cv2 

class Detection: 
    def __init__(self, cascade_path='data/haarcascade_frontalface_default.xml'): 
        self.cascade_path = cascade_path
        self.face_cascade = cv2.CascadeClassifier(cascade_path)
        
    def detect_faces(self): 
        """Original face detection method for direct camera access"""
        cap = cv2.VideoCapture(0)
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            grey = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(grey, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

            for (x,y,w,h) in faces: 
                cv2.rectangle(frame,(x,y),(x+w,y+h),(255,0,0),2)
                cv2.putText(frame, 'Face Detected', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
                
            cv2.imshow('face_detection', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
                
        cap.release()
        cv2.destroyAllWindows()
    
    def detect_faces_in_frame(self, frame):
        try:
            # Convert to grayscale
            grey = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            faces = self.face_cascade.detectMultiScale(
                grey, 
                scaleFactor=1.1, 
                minNeighbors=5, 
                minSize=(30, 30),
                flags=cv2.CASCADE_SCALE_IMAGE
            )
            
            # Convert to list of dictionaries
            face_list = []
            for (x, y, w, h) in faces:
                face_list.append({
                    "x": int(x),
                    "y": int(y),
                    "width": int(w),
                    "height": int(h),
                    "confidence": 0.8  # Placeholder confidence score
                })
            
            return face_list
            
        except Exception as e:
            print(f"Error in face detection: {str(e)}")
            return []
    
    def get_detection_params(self):
        """Return current detection parameters"""
        return {
            "cascade_path": self.cascade_path,
            "scaleFactor": 1.1,
            "minNeighbors": 5,
            "minSize": (30, 30)
        }
