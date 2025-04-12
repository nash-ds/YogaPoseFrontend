import { Link } from 'react-router-dom';
import { YogaPose } from '@/types/yoga';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface PoseCardProps {
  pose: YogaPose;
  index: number;
}

// Define consistent yoga pose images mapped by ID
const poseImages: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1000&auto=format&fit=crop',
  '2': 'https://images.unsplash.com/photo-1588286840104-8957b019727f?q=80&w=1000&auto=format&fit=crop',
  '3': 'https://images.unsplash.com/photo-1510894347713-fc3ed6fdf539?q=80&w=1000&auto=format&fit=crop',
  '4': 'https://images.unsplash.com/photo-1545389336-cf090694435e?q=80&w=1000&auto=format&fit=crop',
  '5': 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?q=80&w=1000&auto=format&fit=crop',
  '6': 'https://images.unsplash.com/photo-1593164842264-990881bd9237?q=80&w=1000&auto=format&fit=crop',
  '7': 'https://images.unsplash.com/photo-1552196563-55cd4e45efb3?q=80&w=1000&auto=format&fit=crop',
  '8': 'https://images.unsplash.com/photo-1599447292411-45af23d8bc88?q=80&w=1000&auto=format&fit=crop',
  '9': 'https://images.unsplash.com/photo-1562088287-bde35a1ea917?q=80&w=1000&auto=format&fit=crop',
  '10': 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1000&auto=format&fit=crop',
};

const PoseCard = ({ pose, index }: PoseCardProps) => {
  const imageUrl = poseImages[pose.id] || pose.imageUrl;

  const handleStartPractice = () => {
    const encodedPoseName = encodeURIComponent(pose.name);
    window.location.href = `http://localhost:5000/yoga_try?pose=${encodedPoseName}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="overflow-hidden hover-scale h-full shadow-elegant">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl}
            alt={pose.name}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-4">
            <h3 className="text-xl font-semibold text-white">{pose.name}</h3>
            <p className="text-sm text-gray-200">{pose.sanskritName}</p>
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary">{pose.difficulty}</Badge>
            <Badge variant="outline">{pose.category}</Badge>
            {pose.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="secondary" className="opacity-75">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {pose.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Link to={`/poses/${pose.id}`} className="flex-1">
            <Button variant="outline" className="w-full">View Details</Button>
          </Link>
          <Button 
            className="flex-1"
            onClick={handleStartPractice}
          >
            Start Practice
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default PoseCard;
