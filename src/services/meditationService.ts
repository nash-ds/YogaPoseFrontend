import { Affirmation, SoothingSound, MeditationSession } from '@/types/yoga';

// Mock affirmations data
const affirmations: Affirmation[] = [
  {
    id: 'aff-1',
    text: 'I am present in this moment, fully aware and at peace.',
    category: 'mindfulness'
  },
  {
    id: 'aff-2',
    text: 'I am grateful for the abundance that surrounds me.',
    category: 'gratitude'
  },
  {
    id: 'aff-3',
    text: 'I love and accept myself completely as I am right now.',
    category: 'self-love'
  },
  {
    id: 'aff-4',
    text: 'I have the courage to face any challenge with confidence.',
    category: 'courage'
  },
  {
    id: 'aff-5',
    text: 'My body is healing, and I am getting stronger every day.',
    category: 'self-love'
  },
  {
    id: 'aff-6',
    text: 'I release all tension and allow my mind to be still.',
    category: 'peace'
  },
  {
    id: 'aff-7',
    text: 'I am thankful for the opportunities that come my way today.',
    category: 'gratitude'
  },
  {
    id: 'aff-8',
    text: 'I breathe in calmness and breathe out tension.',
    category: 'peace'
  },
  {
    id: 'aff-9',
    text: 'I am aware of my thoughts without being controlled by them.',
    category: 'mindfulness'
  },
  {
    id: 'aff-10',
    text: 'I have the strength to overcome obstacles and grow from them.',
    category: 'courage'
  }
];

// Mock soothing sounds with updated reliable sources
const soothingSounds: SoothingSound[] = [
  {
    id: 'sound-1',
    name: 'Ocean Waves',
    source: '/audio/ocean-waves.mp3',
    icon: '🌊'
  },
  {
    id: 'sound-2',
    name: 'Gentle Rain',
    source: '/audio/gentle-rain.mp3',
    icon: '🌧️'
  },
  {
    id: 'sound-3',
    name: 'Forest Birds',
    source: '/audio/forest-birds.mp3',
    icon: '🐦'
  },
  {
    id: 'sound-4',
    name: 'Meditation Bells',
    source: '/audio/meditation-bells.mp3',
    icon: '🔔'
  },
  {
    id: 'sound-5',
    name: 'Calm Stream',
    source: '/audio/calm-stream.mp3',
    icon: '💧'
  }
];

// Mock meditation sessions storage
let meditationSessions: MeditationSession[] = [];

// Get all affirmations or filtered by category
export const getAffirmations = (category?: string): Affirmation[] => {
  if (!category || category === 'all') {
    return [...affirmations];
  }
  return affirmations.filter(aff => aff.category === category);
};

// Get affirmation categories
export const getAffirmationCategories = (): string[] => {
  const categories = affirmations.map(aff => aff.category);
  return ['all', ...new Set(categories)];
};

// Get all soothing sounds
export const getSoothingSounds = (): SoothingSound[] => {
  return [...soothingSounds];
};

// Get a sound by ID
export const getSoundById = (id: string): SoothingSound | undefined => {
  return soothingSounds.find(sound => sound.id === id);
};

// Save a meditation session
export const saveMeditationSession = (session: Omit<MeditationSession, 'id'>): MeditationSession => {
  const newSession = {
    ...session,
    id: `med-${Date.now()}`
  };
  
  // In a real app, we'd save to a database or local storage
  meditationSessions = [newSession, ...meditationSessions];
  
  // For persistence across page refreshes
  try {
    const existingSessions = JSON.parse(localStorage.getItem('meditationSessions') || '[]');
    localStorage.setItem('meditationSessions', JSON.stringify([newSession, ...existingSessions]));
  } catch (error) {
    console.error('Error saving meditation session to localStorage:', error);
  }
  
  return newSession;
};

// Get all meditation sessions
export const getMeditationSessions = (): MeditationSession[] => {
  // Try to load from localStorage for persistence
  try {
    const storedSessions = localStorage.getItem('meditationSessions');
    if (storedSessions) {
      meditationSessions = JSON.parse(storedSessions);
    }
  } catch (error) {
    console.error('Error loading meditation sessions from localStorage:', error);
  }
  
  return [...meditationSessions];
};
