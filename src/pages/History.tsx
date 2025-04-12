import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PracticeSession, UserStats } from '@/types/yoga';
import { practiceService } from '@/services/practiceService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const History = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalSessions: 0,
    totalDuration: 0,
    averageAccuracy: 0,
    favoriteCategory: '',
    streak: 0
  });

  const loadSessions = async () => {
    const sessions = await practiceService.getPracticeSessions();
    setSessions(sessions);
    if (sessions.length > 0) {
      calculateStats(sessions);
    }
  };

  useEffect(() => {
    loadSessions();
    
    // Set up polling to check for new sessions every 10 seconds
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const calculateStats = (sessions: PracticeSession[]) => {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalAccuracy = sessions.reduce((sum, session) => sum + session.accuracy, 0);
    const averageAccuracy = totalSessions > 0 ? Math.round(totalAccuracy / totalSessions) : 0;
    
    // Calculate streak (consecutive days with practice)
    const dateMap = new Map<string, boolean>();
    sessions.forEach(session => {
      const date = new Date(session.date).toLocaleDateString();
      dateMap.set(date, true);
    });
    
    let currentStreak = 0;
    let today = new Date();
    
    // Check back for consecutive days with practice
    while (dateMap.has(today.toLocaleDateString())) {
      currentStreak++;
      today.setDate(today.getDate() - 1);
    }
    
    setStats({
      totalSessions,
      totalDuration,
      averageAccuracy,
      favoriteCategory: 'N/A', // Would need pose categories to calculate this
      streak: currentStreak
    });
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear your practice history?')) {
      practiceService.clearHistory();
      setSessions([]);
      setStats({
        totalSessions: 0,
        totalDuration: 0,
        averageAccuracy: 0,
        favoriteCategory: '',
        streak: 0
      });
    }
  };

  // Prepare data for charts
  const prepareChartData = () => {
    const lastSevenSessions = [...sessions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7)
      .reverse();
      
    return lastSevenSessions.map(session => ({
      name: new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      accuracy: session.accuracy,
      duration: session.duration
    }));
  };

  const chartData = prepareChartData();

  return (
    <motion.div 
      className="container max-w-6xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Your Practice History</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Sessions</h3>
            <p className="text-3xl font-bold">{stats.totalSessions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Duration</h3>
            <p className="text-3xl font-bold">{stats.totalDuration} <span className="text-base font-normal">sec</span></p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Accuracy</h3>
            <p className="text-3xl font-bold">{stats.averageAccuracy}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Current Streak</h3>
            <p className="text-3xl font-bold">{stats.streak} <span className="text-base font-normal">days</span></p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="chart" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chart">Performance Charts</TabsTrigger>
          <TabsTrigger value="sessions">Session History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart">
          <Card className="p-4">
            <h3 className="text-xl font-semibold mb-4">Recent Progress</h3>
            {chartData.length > 0 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="accuracy" name="Accuracy (%)" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="duration" name="Duration (s)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">No practice data available yet</p>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="sessions">
          <Card>
            {sessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left p-4">Date</th>
                      <th className="text-left p-4">Pose</th>
                      <th className="text-left p-4">Duration</th>
                      <th className="text-left p-4">Accuracy</th>
                      <th className="text-left p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <tr key={session.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          {new Date(session.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-4 font-medium">{session.poseName}</td>
                        <td className="p-4">{session.duration}s</td>
                        <td className="p-4">{session.accuracy}%</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            session.completed 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          }`}>
                            {session.completed ? 'Completed' : 'Partial'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <p>No practice sessions recorded yet.</p>
                <p className="mt-2">Start practicing poses to build your history!</p>
              </div>
            )}
            
            {sessions.length > 0 && (
              <div className="p-4 border-t">
                <button 
                  onClick={clearHistory}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Clear Practice History
                </button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default History;
