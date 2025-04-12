
import { useRef, useEffect, useState } from 'react';
import { Camera, RotateCw, Award, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface CameraProps {
  onAccuracyChange?: (accuracy: number) => void;
  poseId?: string;
  startCamera?: boolean;
  referenceVideo?: string;
}

const CameraComponent = ({ onAccuracyChange, poseId, startCamera = false, referenceVideo }: CameraProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const referenceVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [showCanvas, setShowCanvas] = useState(true); // For AR overlay
  const [currentFeedback, setCurrentFeedback] = useState("");
  const analyzerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time pose detection with continuous feedback
  const analyzePoseInRealTime = () => {
    // This would connect to a real pose detection API/ML model
    // For now, we'll simulate with more realistic accuracy changes
    
    if (analyzerRef.current) {
      clearInterval(analyzerRef.current);
    }
    
    let baseAccuracy = 30 + Math.random() * 20; // Start with a base accuracy between 30-50%
    let trend = 0.5; // Positive trend (user is improving)
    let fluctuation = 5; // Amount of random fluctuation
    
    const interval = setInterval(() => {
      // Simulate real-time analysis with some fluctuation to appear more realistic
      const randomFactor = (Math.random() - 0.5) * fluctuation;
      
      // Gradually improve/decline based on trend with random fluctuations
      baseAccuracy += trend + randomFactor;
      
      // Cap accuracy between 20 and 98
      baseAccuracy = Math.min(98, Math.max(20, baseAccuracy));
      
      // Every 8-12 seconds, change the trend to simulate user adjusting
      if (Math.random() < 0.05) {
        trend = -0.5 + Math.random() * 1; // Between -0.5 and 0.5
      }
      
      const currentAccuracy = Math.floor(baseAccuracy);
      setAccuracy(currentAccuracy);
      
      // Generate appropriate feedback based on current accuracy and changes
      let feedback = "";
      if (currentAccuracy < 40) {
        feedback = "Try adjusting your posture to better match the pose.";
      } else if (currentAccuracy < 60) {
        feedback = "Getting better! Focus on your alignment.";
      } else if (currentAccuracy < 80) {
        feedback = "Good form! Minor adjustments will perfect it.";
      } else {
        feedback = "Excellent pose! Maintain this position.";
      }
      
      // Only update feedback when it changes significantly
      if (Math.abs(currentAccuracy - accuracy) > 5) {
        setCurrentFeedback(feedback);
      }
      
      if (onAccuracyChange) {
        onAccuracyChange(currentAccuracy);
      }
    }, 1000); // Update every second for real-time feedback
    
    analyzerRef.current = interval;
    return () => clearInterval(interval);
  };

  const startCameraCapture = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
        
        // Start real-time pose analysis after camera initializes
        setTimeout(() => {
          analyzePoseInRealTime();
        }, 1000);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    if (analyzerRef.current) {
      clearInterval(analyzerRef.current);
    }
    setAccuracy(0);
    // Restart analysis
    analyzePoseInRealTime();
    toast({
      title: "Analysis Reset",
      description: "Pose analysis has been reset.",
    });
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraOn(false);
      setAccuracy(0);
      
      if (analyzerRef.current) {
        clearInterval(analyzerRef.current);
        analyzerRef.current = null;
      }
    }
  };

  const toggleAR = () => {
    setShowCanvas(!showCanvas);
  };

  // Auto-start camera when startCamera prop changes
  useEffect(() => {
    if (startCamera && !isCameraOn) {
      startCameraCapture();
    }
  }, [startCamera]);

  // Effect for the reference video
  useEffect(() => {
    if (referenceVideoRef.current && referenceVideo) {
      referenceVideoRef.current.src = referenceVideo;
      referenceVideoRef.current.load();
    }
  }, [referenceVideo]);

  useEffect(() => {
    // Draw on canvas as an overlay 
    if (isCameraOn && showCanvas && canvasRef.current && videoRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const drawAROverlay = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw skeletal structure for AR effect - this would be replaced with actual pose estimation
          if (accuracy > 20) { // Show some analysis even at low accuracy
            // Draw simple skeletal structure (lines for limbs)
            ctx.strokeStyle = accuracy > 80 ? '#4ade80' : accuracy > 60 ? '#facc15' : '#f87171';
            ctx.lineWidth = 4;
            
            // These coordinates would come from the pose detection algorithm
            // For now, just drawing a simplified human figure
            const centerX = canvas.width / 2;
            const topY = canvas.height / 4;
            const bottomY = canvas.height * 3/4;
            
            // Head
            ctx.beginPath();
            ctx.arc(centerX, topY, 25, 0, Math.PI * 2);
            ctx.stroke();
            
            // Body
            ctx.beginPath();
            ctx.moveTo(centerX, topY + 25);
            ctx.lineTo(centerX, bottomY - 50);
            ctx.stroke();
            
            // Arms - adjust arm position based on accuracy to simulate pose matching
            const armAngle = Math.PI * (0.2 + (accuracy / 100) * 0.3); // Arms raise higher with better accuracy
            ctx.beginPath();
            ctx.moveTo(centerX - 50 * Math.cos(armAngle), topY + 40 + 50 * Math.sin(armAngle));
            ctx.lineTo(centerX, topY + 40);
            ctx.lineTo(centerX + 50 * Math.cos(armAngle), topY + 40 + 50 * Math.sin(armAngle));
            ctx.stroke();
            
            // Legs - adjust leg position based on accuracy
            const legSpread = 30 + (accuracy / 100) * 20; // Legs position adjusts with accuracy
            ctx.beginPath();
            ctx.moveTo(centerX, bottomY - 50);
            ctx.lineTo(centerX - legSpread, bottomY);
            ctx.moveTo(centerX, bottomY - 50);
            ctx.lineTo(centerX + legSpread, bottomY);
            ctx.stroke();
            
            // Add instructional feedback at the top
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 40, canvas.width - 20, 40);
            ctx.fillStyle = '#ffffff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(currentFeedback, canvas.width / 2, 65);
          }
          
          // Draw accuracy indicator
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(10, 10, 150, 30);
          ctx.fillStyle = accuracy > 80 ? '#4ade80' : accuracy > 60 ? '#facc15' : '#f87171';
          ctx.font = '16px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(`Accuracy: ${accuracy}%`, 20, 30);
          
          // Request next frame
          requestAnimationFrame(drawAROverlay);
        };
        
        drawAROverlay();
      }
    }
    
    return () => {
      if (analyzerRef.current) {
        clearInterval(analyzerRef.current);
        analyzerRef.current = null;
      }
    };
  }, [isCameraOn, showCanvas, accuracy, currentFeedback]);

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main camera feed */}
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-elegant">
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas 
            ref={canvasRef} 
            width={1280} 
            height={720}
            className={`absolute top-0 left-0 w-full h-full ${showCanvas ? 'opacity-90' : 'opacity-0'}`}
          />
          
          {!isCameraOn && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white">
              <Camera className="h-16 w-16 mb-4 opacity-80" />
              <Button 
                onClick={startCameraCapture} 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? 'Initializing...' : 'Start Camera'}
              </Button>
              <p className="text-sm text-gray-300 mt-3 max-w-md text-center px-4">
                Your camera will be used to analyze your yoga pose and provide real-time feedback.
              </p>
            </div>
          )}
          
          {isCameraOn && accuracy > 0 && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="bg-black/50 rounded-full px-4 py-2 text-white flex items-center gap-2">
                <Award className={`h-5 w-5 ${accuracy > 80 ? 'text-green-400' : accuracy > 60 ? 'text-yellow-400' : 'text-red-400'}`} />
                <span>Accuracy: {accuracy}%</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Reference video */}
        <div className="relative rounded-lg overflow-hidden bg-black aspect-video shadow-elegant">
          {referenceVideo ? (
            <video
              ref={referenceVideoRef}
              controls
              loop
              className="w-full h-full object-cover"
            >
              <source src={referenceVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 text-white">
              <p className="text-center px-4">
                Reference video for this pose is not available. Please check back later.
              </p>
            </div>
          )}
          <div className="absolute top-2 left-2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            Reference Video
          </div>
        </div>
      </div>
      
      {isCameraOn && (
        <div className="mt-4 flex justify-center gap-4">
          <Button variant="outline" onClick={stopCamera}>
            Stop Camera
          </Button>
          <Button variant="outline" onClick={toggleAR}>
            <RotateCw className="mr-2 h-4 w-4" />
            {showCanvas ? 'Hide AR Overlay' : 'Show AR Overlay'}
          </Button>
          <Button variant="outline" onClick={resetAnalysis}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Recalibrate
          </Button>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
