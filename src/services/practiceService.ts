import { PracticeSession } from '@/types/yoga';
import { toast } from '@/components/ui/use-toast';

const FLASK_API_URL = 'http://localhost:5000';
const STORAGE_KEY = 'practice-history';

interface SaveSessionResponse {
  status: 'success' | 'error';
  data?: any;
  message?: string;
}

export const practiceService = {
  async savePracticeSession(poseName: string, accuracy: number, duration: number): Promise<PracticeSession> {
    console.log('Saving practice session:', { poseName, accuracy, duration });

    const session: PracticeSession = {
      id: Date.now().toString(),
      poseId: poseName.toLowerCase().replace(/\s+/g, '-'),
      poseName,
      date: new Date().toISOString(),
      duration,
      accuracy,
      completed: true
    };

    try {
      // Save to local storage first
      const existingSessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      existingSessions.push(session);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingSessions));
      console.log('Session saved to local storage');

      // Save to Flask backend
      const response = await fetch(`${FLASK_API_URL}/api/save_session_result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poses: [poseName],
          accuracies: { [poseName]: accuracy },
          duration,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save session to backend: ${errorText}`);
      }

      const result: SaveSessionResponse = await response.json();
      console.log('Session saved to backend:', result);

      toast({
        title: "Session Saved",
        description: `Your ${poseName} practice has been recorded with ${accuracy.toFixed(1)}% accuracy.`,
        variant: "default",
      });

      return session;
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error Saving Session",
        description: "Your session was saved locally but couldn't be synced with the server. Your progress will sync when connection is restored.",
        variant: "destructive",
      });
      return session;
    }
  },

  async getPracticeSessions(): Promise<PracticeSession[]> {
    console.log('Fetching practice sessions');
    
    // Get from local storage
    const sessions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    console.log('Local sessions:', sessions);

    // Try to sync with backend
    try {
      const response = await fetch(`${FLASK_API_URL}/api/session_history`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${await response.text()}`);
      }

      const backendSessions = await response.json();
      console.log('Backend sessions:', backendSessions);
      
      // Convert backend sessions to PracticeSession format
      const convertedSessions = backendSessions.map((session: any) => ({
        id: session.timestamp,
        poseId: session.poses[0].toLowerCase().replace(/\s+/g, '-'),
        poseName: session.poses[0],
        date: session.timestamp,
        duration: session.duration,
        accuracy: Object.values(session.accuracies)[0] as number,
        completed: true
      }));

      // Merge with local sessions
      const mergedSessions = [...sessions];
      let newSessionsCount = 0;
      
      convertedSessions.forEach(backendSession => {
        if (!sessions.some(s => s.id === backendSession.id)) {
          mergedSessions.push(backendSession);
          newSessionsCount++;
        }
      });

      // Update local storage with merged sessions
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedSessions));
      console.log('Sessions merged and saved:', mergedSessions);

      if (newSessionsCount > 0) {
        toast({
          title: "Sessions Synced",
          description: `${newSessionsCount} new session${newSessionsCount === 1 ? '' : 's'} synced from the server.`,
          variant: "default",
        });
      }

      return mergedSessions;
    } catch (error) {
      console.error('Error fetching sessions from backend:', error);
      toast({
        title: "Sync Error",
        description: "Couldn't sync with the server. Showing locally saved sessions.",
        variant: "destructive",
      });
      return sessions;
    }
  },

  clearHistory() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      console.log('Local history cleared');

      toast({
        title: "History Cleared",
        description: "Your practice history has been cleared successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error Clearing History",
        description: "Failed to clear history. Please try again.",
        variant: "destructive",
      });
    }
  }
};