
export interface YogaPose {
  id: string;
  name: string;
  sanskritName: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  instructions: string[];
  precautions: string[];
  imageUrl: string;
  category: string;
  duration: number;
  tags: string[];
}

export interface PracticeSession {
  id: string;
  poseId: string;
  poseName: string;
  date: string;
  duration: number;
  accuracy: number;
  completed: boolean;
}

export interface UserStats {
  totalSessions: number;
  totalDuration: number;
  averageAccuracy: number;
  favoriteCategory: string;
  streak: number;
}

export interface Affirmation {
  id: string;
  text: string;
  category: 'mindfulness' | 'gratitude' | 'self-love' | 'courage' | 'peace';
}

export interface SoothingSound {
  id: string;
  name: string;
  source: string;
  icon: string;
}

export interface MeditationSession {
  id: string;
  date: string;
  duration: number;
  affirmationIds: string[];
  soundId: string;
  completed: boolean;
}
