
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Award, Edit3, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface ProgressNote {
  id: string;
  date: string;
  content: string;
}

const Progress = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [notes, setNotes] = useState<ProgressNote[]>(() => {
    const savedNotes = localStorage.getItem('progress-notes');
    return savedNotes ? JSON.parse(savedNotes) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const history = JSON.parse(localStorage.getItem('practice-history') || '[]');
  
  const practicesByDate = history.reduce((acc: Record<string, any[]>, session: any) => {
    const date = session.date.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(session);
    return acc;
  }, {});

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const prevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const selectDay = (day: Date) => {
    setSelectedDate(day);
  };

  const saveNote = () => {
    if (newNote.trim()) {
      const newNoteObj = {
        id: Date.now().toString(),
        date: selectedDate.toISOString(),
        content: newNote
      };
      
      const updatedNotes = [...notes, newNoteObj];
      setNotes(updatedNotes);
      localStorage.setItem('progress-notes', JSON.stringify(updatedNotes));
      setNewNote('');
    }
  };

  const updateNote = (id: string, content: string) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, content } : note
    );
    setNotes(updatedNotes);
    localStorage.setItem('progress-notes', JSON.stringify(updatedNotes));
    setEditingNote(null);
  };

  const selectedDateISO = selectedDate.toISOString().split('T')[0];
  const selectedDateNotes = notes.filter(note => 
    note.date.split('T')[0] === selectedDateISO
  );
  
  const selectedDatePractices = practicesByDate[selectedDateISO] || [];
  
  // Calculate the streak
  const calculateStreak = () => {
    const practiceDates = Object.keys(practicesByDate).sort();
    if (practiceDates.length === 0) return 0;
    
    let currentStreak = 1;
    let maxStreak = 1;
    
    for (let i = 1; i < practiceDates.length; i++) {
      const prevDate = new Date(practiceDates[i-1]);
      const currDate = new Date(practiceDates[i]);
      
      const diffTime = Math.abs(currDate.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }
    
    return maxStreak;
  };

  const streak = calculateStreak();
  const totalSessions = history.length;
  const totalMinutes = history.reduce((sum: number, session: any) => sum + session.duration / 60, 0);

  return (
    <motion.div 
      className="container max-w-6xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Your Yoga Journey</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Practice Calendar
              </h2>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={prevMonth}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">
                  {format(currentDate, 'MMMM yyyy')}
                </span>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={nextMonth}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((day, i) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const hasPractice = !!practicesByDate[dateKey];
                const hasNote = notes.some(note => note.date.split('T')[0] === dateKey);
                const isSelected = isSameDay(day, selectedDate);
                
                return (
                  <Button
                    key={i}
                    variant={isSelected ? "default" : "outline"}
                    className={`h-14 p-1 ${
                      hasPractice 
                        ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-800/40' 
                        : ''
                    } ${
                      hasNote && !hasPractice 
                        ? 'bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/40' 
                        : ''
                    } flex flex-col items-center justify-center`}
                    onClick={() => selectDay(day)}
                  >
                    <span className="text-sm">{format(day, 'd')}</span>
                    {hasPractice && (
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-1"></span>
                    )}
                  </Button>
                );
              })}
            </div>
          </Card>
          
          <Card className="p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h2>
            
            {selectedDatePractices.length > 0 ? (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Practices:</h3>
                <div className="space-y-2">
                  {selectedDatePractices.map((practice: any) => (
                    <div key={practice.id} className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md">
                      <div className="flex justify-between">
                        <span className="font-medium">{practice.poseName}</span>
                        <span>{Math.round(practice.accuracy)}% accuracy</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Duration: {practice.duration} seconds
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 mb-6">No practices recorded for this day.</p>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Notes:</h3>
              {selectedDateNotes.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateNotes.map(note => (
                    <div key={note.id} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                      {editingNote === note.id ? (
                        <div className="flex items-start gap-2">
                          <Input 
                            value={note.content}
                            onChange={(e) => {
                              const updatedNotes = notes.map(n => 
                                n.id === note.id ? { ...n, content: e.target.value } : n
                              );
                              setNotes(updatedNotes);
                            }}
                            className="flex-1"
                          />
                          <Button 
                            size="icon" 
                            onClick={() => updateNote(note.id, notes.find(n => n.id === note.id)?.content || '')}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <p>{note.content}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setEditingNote(note.id)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-3">No notes for this day.</p>
              )}
              
              <div className="flex gap-2 mt-4">
                <Input 
                  placeholder="Add a note about how you feel today..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={saveNote}>Save</Button>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Your Stats
            </h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Current Streak</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{streak}</span>
                  <span className="ml-1 text-sm opacity-90">days</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Total Sessions</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{totalSessions}</span>
                  <span className="ml-1 text-sm opacity-90">practices</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-lg p-4 text-white">
                <p className="text-sm opacity-90">Total Practice Time</p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{Math.round(totalMinutes)}</span>
                  <span className="ml-1 text-sm opacity-90">minutes</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Monthly Goal</h2>
            
            <div className="mb-2 flex justify-between text-sm">
              <span>Progress</span>
              <span>{Object.keys(practicesByDate).length} / 30 days</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${Math.min(100, (Object.keys(practicesByDate).length / 30) * 100)}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Practice yoga regularly to maintain your streak and reach your monthly goal of 30 days.
            </p>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Progress;
