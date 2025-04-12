
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, Pause, Timer, 
  Save, Clock, RefreshCw,
  VolumeX, Volume2, AlarmClock, Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';

import AffirmationCard from '@/components/AffirmationCard';
import SoundPlayer from '@/components/SoundPlayer';
import AudioCue from '@/components/AudioCue';

import { 
  getAffirmations, 
  getAffirmationCategories, 
  getSoothingSounds,
  saveMeditationSession
} from '@/services/meditationService';

import { 
  Affirmation, 
  SoothingSound
} from '@/types/yoga';

const Meditation = () => {
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [timer, setTimer] = useState<number>(0);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [customSeconds, setCustomSeconds] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [activeSounds, setActiveSounds] = useState<string[]>([]);
  const [timerPresets, setTimerPresets] = useState<number[]>([5, 10, 15, 20, 30]);
  const [selectedAffirmations, setSelectedAffirmations] = useState<Affirmation[]>([]);
  const [guidanceEnabled, setGuidanceEnabled] = useState<boolean>(true);
  const [isSettingCustomTimer, setIsSettingCustomTimer] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const { toast } = useToast();

  const { data: affirmations = [] } = useQuery({
    queryKey: ['affirmations'],
    queryFn: () => getAffirmations()
  });
  
  const { data: categories = [] } = useQuery({
    queryKey: ['affirmationCategories'],
    queryFn: () => getAffirmationCategories()
  });
  
  const { data: sounds = [] } = useQuery({
    queryKey: ['soothingSounds'],
    queryFn: () => getSoothingSounds()
  });

  useEffect(() => {
    if (sounds.length > 0 && !selectedSound) {
      setSelectedSound(sounds[0].id);
    }
  }, [sounds, selectedSound]);

  useEffect(() => {
    let nextGuidanceInterval = 60000; // 1 minute for next guidance

    if (isRunning && guidanceEnabled) {
      const guidanceIntervalId = setInterval(() => {
        // Provide audio guidance periodically
        const minutesRemaining = Math.ceil((timer - elapsedTime) / 60);
        
        if (minutesRemaining > 1) {
          const guidanceMessage = `${minutesRemaining} minutes remaining in your meditation session.`;
          speak(guidanceMessage);
        } else if (minutesRemaining === 1) {
          speak("You have about one minute remaining in your meditation session.");
        }
      }, nextGuidanceInterval);
      
      return () => {
        clearInterval(guidanceIntervalId);
      };
    }
  }, [isRunning, guidanceEnabled, timer, elapsedTime]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setElapsedTime(prevTime => {
          if (prevTime >= timer) {
            handleTimerComplete();
            return prevTime;
          }
          return prevTime + 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, timer]);

  const speak = (message: string) => {
    if (!guidanceEnabled) return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      // Try to get preferred voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || 
        voice.name.includes('Female') || 
        voice.name.includes('Google UK English Female')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechSynthesis.speak(utterance);
      console.log("Speaking meditation guidance:", message);
    } catch (error) {
      console.error("Error with speech synthesis:", error);
    }
  };

  const handleStartPause = () => {
    if (timer === 0) {
      toast({
        title: "Set a Timer",
        description: "Please select a meditation duration before starting.",
        variant: "destructive"
      });
      return;
    }

    if (!isRunning) {
      // Starting the meditation session
      setIsRunning(true);
      speak("Starting your meditation session now. Take a deep breath and relax.");
    } else {
      // Pausing the meditation session
      setIsRunning(false);
      speak("Pausing your meditation session.");
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedTime(0);
    speak("Meditation timer has been reset.");
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    speak("Your meditation session is complete. Take a moment to bring your awareness back to the room.");
    
    // Save the meditation session
    if (elapsedTime > 0) {
      saveMeditationSession({
        date: new Date().toISOString(),
        duration: elapsedTime,
        affirmationIds: selectedAffirmations.map(aff => aff.id),
        soundId: selectedSound || '',
        completed: true
      });
      
      toast({
        title: "Meditation Complete",
        description: `You've completed a ${formatTime(elapsedTime)} meditation session.`,
        variant: "default"
      });
    }
  };

  const handleSaveSession = () => {
    if (elapsedTime < 60) {
      toast({
        title: "Session Too Short",
        description: "Meditate for at least one minute to save your session.",
        variant: "destructive"
      });
      return;
    }
    
    saveMeditationSession({
      date: new Date().toISOString(),
      duration: elapsedTime,
      affirmationIds: selectedAffirmations.map(aff => aff.id),
      soundId: selectedSound || '',
      completed: isRunning ? false : true
    });
    
    toast({
      title: "Session Saved",
      description: "Your meditation session has been saved to your history.",
      variant: "default"
    });
  };

  const handleSoundToggle = (soundId: string, isPlaying: boolean) => {
    if (isPlaying) {
      setActiveSounds(prev => [...prev, soundId]);
    } else {
      setActiveSounds(prev => prev.filter(id => id !== soundId));
    }
  };

  const handleAffirmationChange = (affirmation: Affirmation) => {
    if (!selectedAffirmations.find(a => a.id === affirmation.id)) {
      setSelectedAffirmations(prev => [...prev, affirmation]);
    }
  };

  const handleTimerPresetClick = (minutes: number) => {
    setTimer(minutes * 60);
    speak(`Timer set for ${minutes} minutes.`);
  };

  const toggleGuidance = () => {
    setGuidanceEnabled(!guidanceEnabled);
    if (!guidanceEnabled) {
      speak("Voice guidance enabled.");
    } else {
      window.speechSynthesis.cancel();
    }
    
    toast({
      title: guidanceEnabled ? "Voice Guidance Disabled" : "Voice Guidance Enabled",
      description: guidanceEnabled ? "Audio instructions are now off." : "Audio instructions are now on.",
    });
  };

  const handleSetCustomTimer = () => {
    const minutes = parseInt(customMinutes) || 0;
    const seconds = parseInt(customSeconds) || 0;
    
    if (minutes === 0 && seconds === 0) {
      toast({
        title: "Invalid Timer",
        description: "Please enter a valid time greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    const totalSeconds = (minutes * 60) + seconds;
    setTimer(totalSeconds);
    speak(`Timer set for ${minutes} minutes and ${seconds} seconds.`);
    
    // Close the dialog
    setIsSettingCustomTimer(false);
    
    toast({
      title: "Custom Timer Set",
      description: `Meditation timer set for ${minutes}:${seconds.toString().padStart(2, '0')}`,
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = timer > 0 ? (elapsedTime / timer) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Mindful Meditation</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Combine soothing sounds with powerful affirmations for a transformative meditation experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Timer Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Meditation Timer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-8">
              <div className="w-40 h-40 mx-auto relative">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="opacity-10" 
                  />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * progressPercentage) / 100}
                    className="text-primary transition-all duration-300" 
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatTime(timer - elapsedTime)}</div>
                    <div className="text-xs text-muted-foreground">Remaining</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              {timerPresets.map(minutes => (
                <Button
                  key={minutes}
                  variant={timer === minutes * 60 ? "default" : "outline"}
                  className="text-sm"
                  onClick={() => handleTimerPresetClick(minutes)}
                >
                  {minutes} min
                </Button>
              ))}
            </div>
            
            {/* Custom Timer Dialog */}
            <Dialog open={isSettingCustomTimer} onOpenChange={setIsSettingCustomTimer}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-6">
                  <AlarmClock className="mr-2 h-4 w-4" />
                  Custom Timer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Custom Meditation Timer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="minutes" className="text-sm font-medium mb-2 block">
                        Minutes
                      </label>
                      <Input
                        id="minutes"
                        type="number"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        min="0"
                        max="180"
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label htmlFor="seconds" className="text-sm font-medium mb-2 block">
                        Seconds
                      </label>
                      <Input
                        id="seconds"
                        type="number"
                        value={customSeconds}
                        onChange={(e) => setCustomSeconds(e.target.value)}
                        min="0"
                        max="59"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSetCustomTimer} className="w-full">
                    <Check className="mr-2 h-4 w-4" />
                    Set Timer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant={isRunning ? "secondary" : "default"}
                  onClick={handleStartPause}
                  className="w-full"
                  disabled={timer === 0}
                >
                  {isRunning ? (
                    <><Pause className="mr-2 h-4 w-4" /> Pause</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4" /> Start</>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={elapsedTime === 0}
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Reset
                </Button>
              </div>
              
              <Button 
                variant="secondary" 
                onClick={handleSaveSession}
                disabled={elapsedTime === 0}
              >
                <Save className="mr-2 h-4 w-4" /> Save Session
              </Button>
              
              <Button
                variant={guidanceEnabled ? "default" : "outline"}
                onClick={toggleGuidance}
                className="mt-2"
              >
                {guidanceEnabled ? (
                  <><Volume2 className="mr-2 h-4 w-4" /> Voice Guidance On</>
                ) : (
                  <><VolumeX className="mr-2 h-4 w-4" /> Voice Guidance Off</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Affirmations Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Affirmations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={currentCategory} onValueChange={setCurrentCategory}>
              <TabsList className="mb-4">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category} className="capitalize">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={currentCategory}>
                <AffirmationCard 
                  affirmations={affirmations} 
                  category={currentCategory}
                  onAffirmationChange={handleAffirmationChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Sounds Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Soothing Sounds</h2>
        <p className="text-muted-foreground mb-6">
          Select and combine different sounds to create your perfect meditation atmosphere.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sounds.map(sound => (
            <motion.div
              key={sound.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SoundPlayer 
                sound={sound}
                isPlaying={activeSounds.includes(sound.id)}
                onPlayToggle={handleSoundToggle}
              />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Meditation Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Meditation Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Choose your preferred duration using the timer presets or set a custom timer</li>
            <li>Select one or more soothing sounds to play during your meditation</li>
            <li>Read through the affirmations and choose a category that resonates with you</li>
            <li>Find a comfortable position in a quiet space</li>
            <li>Click Start to begin your meditation journey</li>
            <li>Focus on your breath and let the affirmations guide your thoughts</li>
            <li>When the timer completes, take a moment to reflect before returning to your day</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default Meditation;
