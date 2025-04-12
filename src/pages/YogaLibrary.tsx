
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getAllPoses } from '@/services/yogaService';
import PoseCard from '@/components/PoseCard';
import { YogaPose } from '@/types/yoga';

const YogaLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [filteredPoses, setFilteredPoses] = useState<YogaPose[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: poses, isLoading, error } = useQuery({
    queryKey: ['poses'],
    queryFn: getAllPoses
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!poses) return;

    let filtered = [...poses];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pose => 
        pose.name.toLowerCase().includes(query) || 
        pose.sanskritName.toLowerCase().includes(query) ||
        pose.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(pose => pose.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty.length > 0) {
      filtered = filtered.filter(pose => 
        selectedDifficulty.includes(pose.difficulty)
      );
    }

    setFilteredPoses(filtered);
  }, [poses, searchQuery, selectedCategory, selectedDifficulty]);

  const toggleDifficulty = (difficulty: string) => {
    if (selectedDifficulty.includes(difficulty)) {
      setSelectedDifficulty(selectedDifficulty.filter(d => d !== difficulty));
    } else {
      setSelectedDifficulty([...selectedDifficulty, difficulty]);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDifficulty([]);
  };

  // Extract unique categories
  const categories = poses ? ['all', ...new Set(poses.map(pose => pose.category))] : ['all'];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Yoga Pose Library</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore our comprehensive collection of yoga poses with detailed instructions and benefits.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Search poses by name, sanskrit name, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-6"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setSearchQuery('')}
            >
              <X size={18} />
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <Tabs 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full sm:w-auto overflow-auto scrollbar-hidden">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="capitalize">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mr-2">
              <Filter size={16} className="mr-1" />
              <span>Difficulty:</span>
            </div>
            {['beginner', 'intermediate', 'advanced'].map(difficulty => (
              <Badge
                key={difficulty}
                variant={selectedDifficulty.includes(difficulty) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => toggleDifficulty(difficulty)}
              >
                {difficulty}
              </Badge>
            ))}
            
            {(searchQuery || selectedCategory !== 'all' || selectedDifficulty.length > 0) && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters} 
                className="ml-2 text-xs"
              >
                Clear All <X size={14} className="ml-1" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 text-lg">Error loading poses. Please try again later.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : filteredPoses.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg mb-4">No poses match your current filters.</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPoses.map((pose, index) => (
            <PoseCard key={pose.id} pose={pose} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default YogaLibrary;
