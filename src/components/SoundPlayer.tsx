
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SoothingSound } from '@/types/yoga';
import { toast } from '@/components/ui/use-toast';

interface SoundPlayerProps {
  sound: SoothingSound;
  isPlaying: boolean;
  onPlayToggle: (soundId: string, isPlaying: boolean) => void;
}

const SoundPlayer = ({ sound, isPlaying, onPlayToggle }: SoundPlayerProps) => {
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create a new audio element
    const audio = new Audio();
    
    // Set up event listeners for debugging
    audio.addEventListener('canplaythrough', () => {
      console.log(`Audio loaded successfully: ${sound.name}`);
      setLoading(false);
    });
    
    audio.addEventListener('error', (e) => {
      console.error(`Error loading audio for ${sound.name}:`, e);
      setError(`Could not load audio: ${e.message || 'Unknown error'}`);
      setLoading(false);
    });
    
    audio.loop = true;
    audio.volume = volume;
    
    // Preload the audio
    setLoading(true);
    audio.src = sound.source;
    audio.load();
    
    // Log audio source to debug
    console.log("Audio source:", sound.source);
    
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, [sound.source, sound.name]);

  useEffect(() => {
    if (audioRef.current) {
      // Update play state based on isPlaying prop and muted state
      if (isPlaying && !muted) {
        console.log("Attempting to play audio:", sound.name);
        
        // Use the play promise to catch and log errors
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing audio:", error);
            
            // If autoplay was prevented, show a toast
            if (error.name === 'NotAllowedError') {
              toast({
                title: "Audio Playback Blocked",
                description: "Your browser blocked autoplay. Click play again to start the audio.",
                variant: "destructive",
              });
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, muted, sound.name]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
      console.log(`Volume for ${sound.name} set to ${muted ? 0 : volume}`);
    }
  }, [volume, muted, sound.name]);

  const handlePlayToggle = () => {
    // If there was an error, try reloading the audio
    if (error && audioRef.current) {
      setError(null);
      setLoading(true);
      audioRef.current.src = sound.source;
      audioRef.current.load();
    }
    
    console.log("Toggle play for sound:", sound.name, "current state:", isPlaying);
    onPlayToggle(sound.id, !isPlaying);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-background border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
          {sound.icon}
        </div>
        <span className="font-medium">{sound.name}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMute}
          className="text-primary"
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </Button>
        
        <div className="w-24">
          <Slider 
            value={[volume]} 
            min={0} 
            max={1} 
            step={0.01}
            onValueChange={handleVolumeChange}
          />
        </div>
        
        <Button 
          variant={isPlaying ? "secondary" : "default"}
          size="sm"
          onClick={handlePlayToggle}
          className="min-w-20"
          disabled={loading}
        >
          {loading ? 'Loading...' : isPlaying ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
        </Button>
      </div>
      
      {error && (
        <div className="text-red-500 text-xs mt-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default SoundPlayer;
