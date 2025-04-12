
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Play, CheckCircle, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPoseById } from '@/services/yogaService';
import AudioCue from '@/components/AudioCue';

const PoseDetail = () => {
  const { poseId } = useParams<{ poseId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);

  const { data: pose, isLoading, error } = useQuery({
    queryKey: ['pose', poseId],
    queryFn: () => getPoseById(poseId || ''),
    enabled: !!poseId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4"></div>
          <div className="h-12 w-3/4 bg-gray-200 dark:bg-gray-800 rounded mb-6"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
            <div className="md:w-1/2 space-y-4">
              <div className="h-8 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-24 w-full bg-gray-200 dark:bg-gray-800 rounded"></div>
              <div className="h-12 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pose) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Pose</h2>
        <p className="text-red-500 mb-6">We couldn't find the pose you were looking for.</p>
        <Button onClick={() => navigate('/library')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>
      </div>
    );
  }

  // For development, use placeholder image if not available
  const imageUrl = pose.imageUrl || `https://source.unsplash.com/random/800x600?yoga,${pose.name.replace(' ', '')}`;

  const difficultyColor = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }[pose.difficulty];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -20 }}
        transition={{ duration: 0.3 }}
      >
        <Button variant="ghost" onClick={() => navigate('/library')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Library
        </Button>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-8">
        <motion.div 
          className="md:w-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative rounded-lg overflow-hidden shadow-elegant mb-6">
            <img 
              src={imageUrl} 
              alt={pose.name} 
              className="w-full h-auto object-cover aspect-[4/3]"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
              <Badge variant="outline" className={`${difficultyColor} border-none mb-2`}>
                {pose.difficulty.charAt(0).toUpperCase() + pose.difficulty.slice(1)}
              </Badge>
              <div className="flex items-center text-white gap-2">
                <Clock className="h-4 w-4" />
                <span>{pose.duration} seconds</span>
              </div>
            </div>
          </div>

          <Card className="mb-6 shadow-elegant">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">Audio Guidance</h3>
              <div className="space-y-3">
                <AudioCue cue={`Begin ${pose.name} pose. ${pose.instructions[0]}`} />
                <AudioCue cue={`Next, ${pose.instructions[1]}`} />
                {pose.instructions[2] && (
                  <AudioCue cue={`Finally, ${pose.instructions[2]}`} />
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={() => navigate(`/practice/${pose.id}`)}
            >
              <Play className="mr-2 h-4 w-4" />
              Practice Now
            </Button>
            <Link to={`https://www.youtube.com/results?search_query=${pose.name}+yoga+pose+tutorial`} target="_blank" className="flex-1">
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Watch Tutorials
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="md:w-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-1">{pose.name}</h1>
            <p className="text-lg text-muted-foreground italic mb-4">{pose.sanskritName}</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{pose.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {pose.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
              <TabsTrigger value="instructions" className="flex-1">Instructions</TabsTrigger>
              <TabsTrigger value="precautions" className="flex-1">Precautions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="pt-2">
              <h3 className="text-lg font-semibold mb-4">Benefits</h3>
              <ul className="space-y-2 mb-6">
                {pose.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="text-lg font-semibold mb-4">Related Poses</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Warrior I', 'Mountain Pose'].map((related, index) => (
                  <Card key={index} className="hover-scale">
                    <CardContent className="p-4 flex items-center">
                      <span>{related}</span>
                      <ArrowRight className="ml-auto h-4 w-4 text-gray-400" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="instructions" className="pt-2">
              <h3 className="text-lg font-semibold mb-4">Step-by-Step Instructions</h3>
              <ol className="space-y-4">
                {pose.instructions.map((instruction, index) => (
                  <li key={index} className="flex">
                    <span className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </TabsContent>
            
            <TabsContent value="precautions" className="pt-2">
              <h3 className="text-lg font-semibold mb-4">Precautions & Contraindications</h3>
              <ul className="space-y-2">
                {pose.precautions.map((precaution, index) => (
                  <li key={index} className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{precaution}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default PoseDetail;
