import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPoseById } from '@/services/yogaService';

const Practice = () => {
  const { poseId } = useParams<{ poseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [flaskUrl, setFlaskUrl] = useState("http://localhost:5000/yoga_try");
  const [flaskServerRunning, setFlaskServerRunning] = useState(false);

  const { data: pose, isLoading, error } = useQuery({
    queryKey: ['pose', poseId],
    queryFn: () => getPoseById(poseId || ''),
    enabled: !!poseId,
  });

  useEffect(() => {
    if (pose?.name) {
      const encodedPoseName = encodeURIComponent(pose.name);
      setFlaskUrl(`http://localhost:5000/yoga_try?pose=${encodedPoseName}`);
    }
  }, [pose]);

  useEffect(() => {
    const checkFlaskServer = async () => {
      try {
        await fetch("http://localhost:5000/", { mode: 'no-cors' });
        setFlaskServerRunning(true);
      } catch (error) {
        setFlaskServerRunning(false);
      }
    };

    checkFlaskServer();
  }, []);

  if (isLoading) return <div className="container mt-10 text-center">Loading pose data...</div>;
  if (error) return <div className="container mt-10 text-center">Error loading pose data</div>;
  if (!pose) return <div className="container mt-10 text-center">Pose not found</div>;

  return (
    <motion.div 
      className="container max-w-full mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden w-full h-screen">
        {flaskServerRunning ? (
          <iframe 
            src={flaskUrl}
            className="w-full h-full border-0"
            allow="camera; microphone"
            title="Yoga Correction App"
          ></iframe>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-100 dark:bg-gray-800 p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Flask Server Not Running</h3>
            <p className="mb-4 text-muted-foreground">
              The Python Flask server with MediaPipe and OpenCV needs to be running locally on port 5000.
            </p>
            <div className="bg-black/80 text-white p-4 rounded-md text-left text-sm w-full max-w-lg overflow-auto">
              <p className="mb-2">Start the Flask server with:</p>
              <pre className="bg-black rounded p-2 overflow-x-auto">
                <code>python main.py</code>
              </pre>
              <p className="mt-2">Ensure the server is running on <span className="text-blue-400">http://localhost:5000</span></p>
            </div>
          </div>
        )}
      </Card>

      <div className="mt-4 flex justify-center">
        <Button variant="outline" onClick={() => navigate('/library')}>Back to Library</Button>
      </div>
    </motion.div>
  );
};

export default Practice;
