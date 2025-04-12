import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight, PlayCircle, History, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAllPoses } from '@/services/yogaService';
import PoseCard from '@/components/PoseCard';

const Index = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: poses, isLoading, error } = useQuery({
    queryKey: ['poses'],
    queryFn: getAllPoses
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const featuredPoses = poses?.slice(0, 4) || [];

  return (
    <div className="container mx-auto px-4 mb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yoga-soft-purple to-yoga-soft-peach -z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1545389336-cf090694435e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1364&q=80')] bg-cover bg-center opacity-10 -z-10" />
        
        <div className="flex flex-col lg:flex-row items-center py-12 md:py-20 lg:py-28 px-4">
          <motion.div 
            className="lg:w-1/2 text-center lg:text-left mb-8 lg:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              Find Your <span className="yoga-title-gradient">Balance</span> with AI-Guided Yoga
            </h1>
            <p className="text-lg md:text-xl opacity-80 max-w-xl mx-auto lg:mx-0 mb-8">
              Experience real-time pose guidance, personalized audio cues, and track your progress with our cutting-edge yoga application.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-white font-medium"
                onClick={() => navigate('/library')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Explore Poses
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-background/80 backdrop-blur-sm"
                onClick={() => navigate('/history')}
              >
                <History className="mr-2 h-4 w-4" />
                View History
              </Button>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.9 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-elegant">
              <img 
                src="https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80" 
                alt="Yoga Practice" 
                className="w-full h-auto rounded-2xl image-fade-mask"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/40 text-primary"
                  onClick={() => navigate('/library')}
                >
                  <PlayCircle className="h-10 w-10" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perfect Your Practice with Technology
          </h2>
          <p className="text-lg opacity-80 max-w-3xl mx-auto">
            Our application combines machine learning with yoga expertise to deliver an immersive and effective practice experience.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Real-time Pose Guidance",
              description: "Our AI analyzes your form through your camera and provides instant feedback to help you achieve perfect alignment.",
              icon: "🎯",
              color: "bg-yoga-soft-green",
              delay: 0.7
            },
            {
              title: "Audio Cues & Instructions",
              description: "Receive clear, timely audio instructions as you move through each pose to maintain proper form.",
              icon: "🔊",
              color: "bg-yoga-soft-purple",
              delay: 0.8
            },
            {
              title: "Accuracy Tracking",
              description: "Measure your pose accuracy and track improvements over time with detailed progress metrics.",
              icon: "📊",
              color: "bg-yoga-soft-peach",
              delay: 0.9
            },
            {
              title: "Comprehensive Pose Library",
              description: "Access a growing library of yoga poses with detailed instructions, benefits, and precautions.",
              icon: "📚",
              color: "bg-yoga-soft-green",
              delay: 1.0
            },
            // {
            //   title: "Augmented Reality Overlays",
            //   description: "Visualize proper alignment with AR overlays that guide your positioning in real-time.",
            //   icon: "👁️",
            //   color: "bg-yoga-soft-purple",
            //   delay: 1.1
            // },
            {
              title: "Progress History",
              description: "Review your practice history, track improvements, and set goals for future sessions.",
              icon: "🗓️",
              color: "bg-yoga-soft-peach",
              delay: 1.2
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: feature.delay }}
            >
              <Card className="h-full hover-scale shadow-elegant overflow-hidden">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-full ${feature.color} flex items-center justify-center mb-4 text-2xl`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Poses */}
      <section className="py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Featured Poses</h2>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/library')}
            className="text-primary"
          >
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading poses. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPoses.map((pose, index) => (
              <PoseCard key={pose.id} pose={pose} index={index} />
            ))}
          </div>
        )}
      </section>
      
      {/* Call to Action */}
      <section className="py-16">
        <div className="bg-gradient-to-r from-yoga-soft-purple to-yoga-primary/10 rounded-2xl p-8 md:p-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to start your yoga session?</h2>
            <p className="text-lg opacity-80 mb-6 max-w-xl">
              Begin your yoga journey today with real-time AI guidance and personalized session tracking.
            </p>
            <Button 
              onClick={() => window.location.href = 'http://localhost:5000/session'}
              className="bg-primary hover:bg-primary/90"
              size="lg"
            >
              Start a Session <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          <div className="absolute right-0 bottom-0 opacity-10 -z-0">
            <svg width="300" height="300" viewBox="0 0 200 200">
              <path
                fill="currentColor"
                d="M40,120 C40,120 80,150 120,120 C160,90 180,60 160,40 C140,20 100,40 80,60 C60,80 40,120 40,120 Z"
              />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
