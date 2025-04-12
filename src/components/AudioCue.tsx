
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface AudioCueProps {
  cue: string;
  autoPlay?: boolean;
  delay?: number;
  accuracy?: number;
  isActive?: boolean;
}

const AudioCue = ({ cue, autoPlay = false, delay = 0, accuracy = 0, isActive = false }: AudioCueProps) => {
  const [muted, setMuted] = useState(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lastFeedbackRef = useRef<string>('');
  const feedbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [lastSpokenTime, setLastSpokenTime] = useState(0);

  useEffect(() => {
    // Initialize speech synthesis on component mount
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = new SpeechSynthesisUtterance(cue);
      
      // Configure speech synthesis
      if (synthRef.current) {
        synthRef.current.rate = 0.9; // Slightly slower for clarity
        synthRef.current.pitch = 1;
        synthRef.current.volume = 1.0;
        
        // Get available voices
        const voicesChangedHandler = () => {
          if (synthRef.current) {
            // Try to use a calm, neutral voice if available
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
              voice.name.includes('Samantha') || 
              voice.name.includes('Female') || 
              voice.name.includes('Google UK English Female')
            );
            
            if (preferredVoice) {
              synthRef.current.voice = preferredVoice;
            }
          }
        };
        
        // Handle voices being loaded asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = voicesChangedHandler;
        }
        
        // Initial voice loading attempt
        voicesChangedHandler();
      }
    } else {
      console.warn("Speech synthesis not supported in this browser");
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      if (feedbackIntervalRef.current) {
        clearInterval(feedbackIntervalRef.current);
      }
    };
  }, []);

  // Update utterance when cue changes
  useEffect(() => {
    if (synthRef.current && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current.text = cue;
    }
  }, [cue]);

  useEffect(() => {
    if (autoPlay && !muted && delay >= 0) {
      const timer = setTimeout(() => {
        speak();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, muted, delay, cue]);

  // Set up corrective feedback based on accuracy when active
  useEffect(() => {
    if (!isActive || muted) {
      if (feedbackIntervalRef.current) {
        clearInterval(feedbackIntervalRef.current);
        feedbackIntervalRef.current = null;
      }
      return;
    }

    // Start providing feedback at regular intervals
    feedbackIntervalRef.current = setInterval(() => {
      provideCorrectionFeedback(accuracy);
    }, 10000); // Provide feedback every 10 seconds

    return () => {
      if (feedbackIntervalRef.current) {
        clearInterval(feedbackIntervalRef.current);
      }
    };
  }, [isActive, accuracy, muted]);

  const provideCorrectionFeedback = (accuracy: number) => {
    if (muted) return;
    
    // Prevent speaking too frequently (minimum 5 second gap)
    const now = Date.now();
    if (now - lastSpokenTime < 5000) {
      return;
    }
    
    let feedback = '';
    
    // Generate appropriate feedback based on accuracy
    if (accuracy < 40) {
      const lowAccuracyFeedback = [
        "Try adjusting your position to match the pose better.",
        "Your form needs significant improvement. Check your alignment.",
        "Please try to align your body with the pose shown.",
        "Let's work on your form. It's quite different from the ideal pose."
      ];
      feedback = lowAccuracyFeedback[Math.floor(Math.random() * lowAccuracyFeedback.length)];
    } else if (accuracy < 70) {
      const mediumAccuracyFeedback = [
        "Getting better! Try focusing on your alignment.",
        "You're on the right track. Check your posture.",
        "Almost there. Adjust your position slightly.",
        "Good effort. Straighten your back more to improve."
      ];
      feedback = mediumAccuracyFeedback[Math.floor(Math.random() * mediumAccuracyFeedback.length)];
    } else if (accuracy < 90) {
      const highAccuracyFeedback = [
        "Very good form! Minor adjustments will perfect it.",
        "Great job! Focus on your breathing now.",
        "Excellent! Hold this position and breathe deeply.",
        "Your form is nearly perfect. Maintain this position."
      ];
      feedback = highAccuracyFeedback[Math.floor(Math.random() * highAccuracyFeedback.length)];
    } else {
      const excellentAccuracyFeedback = [
        "Perfect form! Maintain this position.",
        "Excellent work! Your alignment is perfect.",
        "Outstanding! You've mastered this pose.",
        "Perfect! Enjoy the benefits of this well-executed pose."
      ];
      feedback = excellentAccuracyFeedback[Math.floor(Math.random() * excellentAccuracyFeedback.length)];
    }
    
    // Avoid repeating the same feedback consecutively
    if (feedback !== lastFeedbackRef.current) {
      lastFeedbackRef.current = feedback;
      speakFeedback(feedback);
      setLastSpokenTime(now);
    }
  };

  const speak = () => {
    if (muted || !synthRef.current || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    try {
      // Cancel any ongoing speech before starting new one
      window.speechSynthesis.cancel();
      
      // Update the text in case it changed
      synthRef.current.text = cue;
      
      // Start speaking
      window.speechSynthesis.speak(synthRef.current);
      setLastSpokenTime(Date.now());
      
      // Debug log
      console.log("Speaking:", cue);
    } catch (error) {
      console.error("Error using speech synthesis:", error);
      toast({
        title: "Audio Error",
        description: "There was an issue with the voice guidance. Please try again.",
        variant: "destructive",
      });
    }
  };

  const speakFeedback = (feedback: string) => {
    if (muted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(feedback);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      // Try to use a calm, neutral voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Female') || 
        voice.name.includes('Google UK English Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
      console.log("Speaking feedback:", feedback);
    } catch (error) {
      console.error("Error using speech synthesis for feedback:", error);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    if (!muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    } else if (muted) {
      // When unmuting, speak the current cue
      setTimeout(() => speak(), 100);
    }
    
    toast({
      title: muted ? "Voice Guidance Enabled" : "Voice Guidance Disabled",
      description: muted ? "Audio instructions are now on." : "Audio instructions are now off.",
    });
  };

  return (
    <div className="inline-flex items-center gap-2 p-2 bg-background/80 backdrop-blur-sm rounded-lg shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleMute} 
        className="text-primary hover:text-primary/80"
      >
        {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </Button>
      <span className="text-sm font-medium">{cue}</span>
    </div>
  );
};

export default AudioCue;
