import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const SessionCard = ({ index }: { index: number }) => {
  const handleStartSession = () => {
    window.location.href = 'http://localhost:5000/session';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover-scale h-full shadow-elegant cursor-pointer" onClick={handleStartSession}>
        <div className="relative h-48 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop"
            alt="Yoga Session"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <h3 className="text-xl font-semibold text-white">Start Custom Session</h3>
          </div>
        </div>
        <CardContent className="pt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create a personalized yoga session by selecting multiple poses. Track your progress and earn achievements!
          </p>
          <Button className="w-full mt-4" onClick={handleStartSession}>
            Start Session
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SessionCard; 