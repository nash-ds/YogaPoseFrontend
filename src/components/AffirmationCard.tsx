
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Affirmation } from '@/types/yoga';
import AudioCue from '@/components/AudioCue';

interface AffirmationCardProps {
  affirmations: Affirmation[];
  category: string;
  onAffirmationChange?: (affirmation: Affirmation) => void;
}

const AffirmationCard = ({ 
  affirmations, 
  category,
  onAffirmationChange 
}: AffirmationCardProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

  const filteredAffirmations = category === 'all' 
    ? affirmations 
    : affirmations.filter(a => a.category === category);

  const currentAffirmation = filteredAffirmations[currentIndex];

  useEffect(() => {
    // Reset to first affirmation when category changes
    setCurrentIndex(0);
  }, [category]);

  useEffect(() => {
    if (onAffirmationChange && currentAffirmation) {
      onAffirmationChange(currentAffirmation);
    }
  }, [currentAffirmation, onAffirmationChange]);

  useEffect(() => {
    let intervalId: number;
    
    if (autoPlayEnabled && filteredAffirmations.length > 1) {
      // Change affirmation every 12 seconds
      intervalId = window.setInterval(() => {
        handleNext();
      }, 12000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoPlayEnabled, currentIndex, filteredAffirmations.length]);

  const handlePrevious = () => {
    setDirection(-1);
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? filteredAffirmations.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex(prevIndex => 
      prevIndex === filteredAffirmations.length - 1 ? 0 : prevIndex + 1
    );
  };

  const toggleAutoPlay = () => {
    setAutoPlayEnabled(!autoPlayEnabled);
  };

  if (!currentAffirmation) {
    return (
      <Card className="w-full h-48 flex items-center justify-center">
        <CardContent>
          <p className="text-center text-muted-foreground">No affirmations available for this category.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <Card className="w-full p-6 overflow-hidden min-h-48">
        <div className="absolute top-4 right-4">
          <Button 
            variant={autoPlayEnabled ? "secondary" : "ghost"} 
            size="sm"
            onClick={toggleAutoPlay}
            className="gap-1"
          >
            <RefreshCw size={16} className={autoPlayEnabled ? "animate-spin-slow" : ""} />
            {autoPlayEnabled ? "Auto" : "Cycle"}
          </Button>
        </div>
        
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div 
            key={currentAffirmation.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center min-h-36"
          >
            <p className="text-xl md:text-2xl text-center mb-4 font-medium italic text-primary">
              "{currentAffirmation.text}"
            </p>
            <AudioCue cue={currentAffirmation.text} autoPlay={false} />
          </motion.div>
        </AnimatePresence>
      </Card>
      
      <div className="flex justify-center gap-2 mt-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePrevious}
          disabled={filteredAffirmations.length <= 1}
        >
          <ChevronLeft size={18} />
        </Button>
        <p className="flex items-center text-sm text-muted-foreground">
          {currentIndex + 1} / {filteredAffirmations.length}
        </p>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNext}
          disabled={filteredAffirmations.length <= 1}
        >
          <ChevronRight size={18} />
        </Button>
      </div>
    </div>
  );
};

export default AffirmationCard;
