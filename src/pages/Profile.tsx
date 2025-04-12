
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Heart, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: FoodItem[];
}

interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number; // in kg
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  goal: 'lose' | 'maintain' | 'gain';
  goalDeadline: string; // ISO date string
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  age: 30,
  height: 170,
  weight: 70,
  targetWeight: 65,
  gender: 'female',
  activityLevel: 'moderate',
  goal: 'lose',
  goalDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days from now
};

const ACTIVITY_MULTIPLIERS = {
  'sedentary': 1.2,
  'light': 1.375,
  'moderate': 1.55,
  'active': 1.725,
  'very active': 1.9
};

const FOOD_DATABASE: FoodItem[] = [
  { id: '1', name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: '2', name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: '3', name: 'Chicken Breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: '4', name: 'Eggs (1)', calories: 78, protein: 6, carbs: 0.6, fat: 5 },
  { id: '5', name: 'Brown Rice (100g, cooked)', calories: 112, protein: 2.6, carbs: 23, fat: 0.9 },
  { id: '6', name: 'Salmon (100g)', calories: 208, protein: 20, carbs: 0, fat: 13 },
  { id: '7', name: 'Avocado (half)', calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  { id: '8', name: 'Greek Yogurt (100g)', calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { id: '9', name: 'Almonds (28g)', calories: 164, protein: 6, carbs: 6, fat: 14 },
  { id: '10', name: 'Sweet Potato (100g, cooked)', calories: 90, protein: 2, carbs: 20.7, fat: 0.2 },
];

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const savedProfile = localStorage.getItem('user-profile');
    return savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE;
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [meals, setMeals] = useState<MealEntry[]>(() => {
    const savedMeals = localStorage.getItem('meal-entries');
    return savedMeals ? JSON.parse(savedMeals) : [];
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    localStorage.setItem('user-profile', JSON.stringify(profile));
  }, [profile]);
  
  useEffect(() => {
    localStorage.setItem('meal-entries', JSON.stringify(meals));
  }, [meals]);
  
  const calculateBMR = () => {
    // Harris-Benedict Equation
    if (profile.gender === 'male') {
      return 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      return 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
  };
  
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    return bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];
  };
  
  const calculateCalorieTarget = () => {
    const tdee = calculateTDEE();
    
    if (profile.goal === 'lose') {
      return Math.round(tdee - 500); // 500 calorie deficit for weight loss
    } else if (profile.goal === 'gain') {
      return Math.round(tdee + 500); // 500 calorie surplus for weight gain
    } else {
      return Math.round(tdee); // maintain current weight
    }
  };
  
  const filteredFoods = FOOD_DATABASE.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const todaysMeals = meals.filter(meal => meal.date === selectedDate);
  
  const caloriesConsumed = todaysMeals.reduce((total, meal) => {
    return total + meal.items.reduce((mealTotal, item) => mealTotal + item.calories, 0);
  }, 0);
  
  const proteinConsumed = todaysMeals.reduce((total, meal) => {
    return total + meal.items.reduce((mealTotal, item) => mealTotal + item.protein, 0);
  }, 0);
  
  const carbsConsumed = todaysMeals.reduce((total, meal) => {
    return total + meal.items.reduce((mealTotal, item) => mealTotal + item.carbs, 0);
  }, 0);
  
  const fatConsumed = todaysMeals.reduce((total, meal) => {
    return total + meal.items.reduce((mealTotal, item) => mealTotal + item.fat, 0);
  }, 0);
  
  const calorieTarget = calculateCalorieTarget();
  const caloriesRemaining = calorieTarget - caloriesConsumed;
  
  const addFoodToMeal = (food: FoodItem) => {
    const existingMeal = meals.find(
      meal => meal.date === selectedDate && meal.mealType === activeMealType
    );
    
    if (existingMeal) {
      const updatedMeals = meals.map(meal => {
        if (meal.id === existingMeal.id) {
          return {
            ...meal,
            items: [...meal.items, food]
          };
        }
        return meal;
      });
      setMeals(updatedMeals);
    } else {
      const newMeal: MealEntry = {
        id: Date.now().toString(),
        date: selectedDate,
        mealType: activeMealType,
        items: [food]
      };
      setMeals([...meals, newMeal]);
    }
    
    setIsAddingFood(false);
    setSearchQuery('');
  };
  
  const removeFoodFromMeal = (mealId: string, foodIndex: number) => {
    const updatedMeals = meals.map(meal => {
      if (meal.id === mealId) {
        const updatedItems = [...meal.items];
        updatedItems.splice(foodIndex, 1);
        return {
          ...meal,
          items: updatedItems
        };
      }
      return meal;
    }).filter(meal => meal.items.length > 0);
    
    setMeals(updatedMeals);
  };
  
  const saveProfile = () => {
    setIsEditing(false);
  };
  
  const getMealByType = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    return todaysMeals.find(meal => meal.mealType === type);
  };
  
  const mealTypeCalories = (type: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    const meal = getMealByType(type);
    if (!meal) return 0;
    return meal.items.reduce((total, item) => total + item.calories, 0);
  };
  
  return (
    <motion.div 
      className="container max-w-6xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <User className="mr-2 h-5 w-5" />
                Your Information
              </h2>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  Edit
                </Button>
              ) : (
                <Button onClick={saveProfile} variant="default" size="sm">
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Age</label>
                    <Input 
                      type="number"
                      value={profile.age}
                      onChange={(e) => setProfile({...profile, age: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Gender</label>
                    <select 
                      className="w-full px-3 py-2 border rounded-md"
                      value={profile.gender}
                      onChange={(e) => setProfile({
                        ...profile, 
                        gender: e.target.value as 'male' | 'female' | 'other'
                      })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Height (cm)</label>
                    <Input 
                      type="number"
                      value={profile.height}
                      onChange={(e) => setProfile({...profile, height: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                    <Input 
                      type="number"
                      value={profile.weight}
                      onChange={(e) => setProfile({...profile, weight: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Target Weight (kg)</label>
                  <Input 
                    type="number"
                    value={profile.targetWeight}
                    onChange={(e) => setProfile({...profile, targetWeight: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Activity Level</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    value={profile.activityLevel}
                    onChange={(e) => setProfile({
                      ...profile, 
                      activityLevel: e.target.value as UserProfile['activityLevel']
                    })}
                  >
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (light exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                    <option value="active">Active (hard exercise 6-7 days/week)</option>
                    <option value="very active">Very Active (very hard exercise & physical job)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Goal</label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    value={profile.goal}
                    onChange={(e) => setProfile({
                      ...profile, 
                      goal: e.target.value as 'lose' | 'maintain' | 'gain'
                    })}
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="gain">Gain Weight</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Goal Deadline</label>
                  <Input 
                    type="date"
                    value={profile.goalDeadline.split('T')[0]}
                    onChange={(e) => setProfile({
                      ...profile, 
                      goalDeadline: new Date(e.target.value).toISOString()
                    })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.name && (
                  <div className="mb-4">
                    <h3 className="text-lg font-medium">{profile.name}</h3>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Age:</span>
                    <p>{profile.age} years</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                    <p className="capitalize">{profile.gender}</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Height:</span>
                    <p>{profile.height} cm</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                    <p>{profile.weight} kg</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Target:</span>
                    <p>{profile.targetWeight} kg</p>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Activity:</span>
                    <p className="capitalize">{profile.activityLevel.replace('-', ' ')}</p>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-md font-medium mb-2">Your Goal</h3>
                  <p className="mb-1">
                    {profile.goal === 'lose' 
                      ? `Lose ${Math.abs(profile.targetWeight - profile.weight).toFixed(1)} kg`
                      : profile.goal === 'gain'
                        ? `Gain ${Math.abs(profile.targetWeight - profile.weight).toFixed(1)} kg`
                        : 'Maintain current weight'
                    }
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Target date: {new Date(profile.goalDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm">Body Mass Index (BMI)</span>
                <span className="text-sm font-semibold">
                  {(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">Daily Calorie Target</span>
                <span className="text-sm font-semibold">{calorieTarget} kcal</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 mt-6">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-medium flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-500" />
                Body Model
              </h3>
            </div>
            
            <div className="flex justify-center my-4">
              <svg width="120" height="240" viewBox="0 0 120 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Simple body outline based on weight */}
                <g stroke="currentColor" strokeWidth="2" fill="none">
                  {/* Head */}
                  <circle cx="60" cy="30" r="20" />
                  
                  {/* Body - adjusts width based on weight */}
                  <rect 
                    x={60 - Math.min(40, Math.max(25, 25 + (profile.weight - profile.targetWeight) / 2))} 
                    y="50" 
                    width={Math.min(80, Math.max(50, 50 + (profile.weight - profile.targetWeight)))} 
                    height="80" 
                    rx="8"
                  />
                  
                  {/* Arms */}
                  <line 
                    x1={60 - Math.min(40, Math.max(25, 25 + (profile.weight - profile.targetWeight) / 2))} 
                    y1="70" 
                    x2={20 - Math.max(0, (profile.weight - profile.targetWeight) / 3)} 
                    y2="90" 
                  />
                  <line 
                    x1={60 + Math.min(40, Math.max(25, 25 + (profile.weight - profile.targetWeight) / 2))} 
                    y1="70" 
                    x2={100 + Math.max(0, (profile.weight - profile.targetWeight) / 3)} 
                    y2="90" 
                  />
                  
                  {/* Legs */}
                  <line x1="50" y1="130" x2="40" y2="200" />
                  <line x1="70" y1="130" x2="80" y2="200" />
                </g>
              </svg>
            </div>
            
            <div className="text-center text-sm">
              <p className="font-medium mb-1">
                {profile.weight > profile.targetWeight 
                  ? `${(profile.weight - profile.targetWeight).toFixed(1)}kg to lose` 
                  : profile.weight < profile.targetWeight
                    ? `${(profile.targetWeight - profile.weight).toFixed(1)}kg to gain`
                    : 'You are at your target weight!'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Current BMI: {(profile.weight / ((profile.height / 100) ** 2)).toFixed(1)}
              </p>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Daily Nutrition</h2>
            
            <div className="flex mb-4">
              <Input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-48"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Calories</p>
                <p className="text-2xl font-bold">{caloriesConsumed}</p>
                <p className="text-sm text-gray-500">
                  of {calorieTarget} goal
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Protein</p>
                <p className="text-2xl font-bold">{Math.round(proteinConsumed)}g</p>
                <p className="text-sm text-gray-500">
                  {Math.round((proteinConsumed * 4 / caloriesConsumed) * 100) || 0}% of calories
                </p>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Carbs</p>
                <p className="text-2xl font-bold">{Math.round(carbsConsumed)}g</p>
                <p className="text-sm text-gray-500">
                  {Math.round((carbsConsumed * 4 / caloriesConsumed) * 100) || 0}% of calories
                </p>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Fat</p>
                <p className="text-2xl font-bold">{Math.round(fatConsumed)}g</p>
                <p className="text-sm text-gray-500">
                  {Math.round((fatConsumed * 9 / caloriesConsumed) * 100) || 0}% of calories
                </p>
              </div>
            </div>
            
            <div className="mb-2 flex justify-between">
              <span className="font-medium">Calories Remaining</span>
              <span className={`font-bold ${caloriesRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {caloriesRemaining} kcal
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-6">
              <div 
                className={`h-2.5 rounded-full ${
                  caloriesRemaining >= 0 ? 'bg-green-600' : 'bg-red-600'
                }`} 
                style={{ width: `${Math.min(100, (caloriesConsumed / calorieTarget) * 100)}%` }}
              ></div>
            </div>
            
            <div className="space-y-6">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
                <div key={mealType} className="border rounded-lg overflow-hidden">
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer bg-gray-50 dark:bg-gray-800"
                    onClick={() => setActiveMealType(mealType as any)}
                  >
                    <div>
                      <h3 className="font-medium capitalize">{mealType}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {mealTypeCalories(mealType as any)} calories
                      </p>
                    </div>
                    {activeMealType === mealType ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                  
                  {activeMealType === mealType && (
                    <div className="p-4 border-t">
                      {getMealByType(mealType as any)?.items.length ? (
                        <div className="space-y-2 mb-4">
                          {getMealByType(mealType as any)?.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                              <div>
                                <p className="font-medium">{item.name}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  P: {item.protein}g · C: {item.carbs}g · F: {item.fat}g
                                </p>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-3">{item.calories} kcal</span>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => removeFoodFromMeal(
                                    getMealByType(mealType as any)?.id || '', 
                                    index
                                  )}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 mb-4">No foods added to this meal yet.</p>
                      )}
                      
                      {isAddingFood && activeMealType === mealType ? (
                        <div>
                          <Input
                            placeholder="Search for a food..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="mb-3"
                          />
                          
                          <div className="max-h-60 overflow-y-auto">
                            {filteredFoods.length === 0 ? (
                              <p className="text-sm text-gray-500">No foods match your search.</p>
                            ) : (
                              <div className="space-y-2">
                                {filteredFoods.map((food) => (
                                  <div 
                                    key={food.id}
                                    className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                                    onClick={() => addFoodToMeal(food)}
                                  >
                                    <div>
                                      <p className="font-medium">{food.name}</p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400">
                                        P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
                                      </p>
                                    </div>
                                    <span>{food.calories} kcal</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <Button 
                            variant="outline" 
                            className="mt-3"
                            onClick={() => setIsAddingFood(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => setIsAddingFood(true)}
                          variant="outline"
                          className="w-full"
                        >
                          <Plus size={16} className="mr-1" />
                          Add Food
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
          
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Nutrition Recommendations</h2>
            
            <div className="space-y-4">
              {profile.goal === 'lose' && (
                <>
                  <p className="text-sm">Based on your weight loss goal, consider focusing on:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>High protein foods (lean meats, eggs, legumes)</li>
                    <li>Fiber-rich vegetables and fruits</li>
                    <li>Whole grains instead of refined carbs</li>
                    <li>Limiting added sugars and processed foods</li>
                    <li>Staying hydrated with water instead of caloric beverages</li>
                  </ul>
                </>
              )}
              
              {profile.goal === 'gain' && (
                <>
                  <p className="text-sm">Based on your weight gain goal, consider focusing on:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Calorie-dense whole foods</li>
                    <li>Healthy fats like nuts, avocados, and olive oil</li>
                    <li>Protein-rich foods to support muscle growth</li>
                    <li>Nutritious smoothies with fruits, nut butters, and protein</li>
                    <li>Regular, slightly larger meals with healthy snacks between</li>
                  </ul>
                </>
              )}
              
              {profile.goal === 'maintain' && (
                <>
                  <p className="text-sm">Based on your maintenance goal, consider focusing on:</p>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Balanced meals with proteins, complex carbs, and healthy fats</li>
                    <li>Consistent meal timing and portion sizes</li>
                    <li>Mindful eating practices</li>
                    <li>Variety of colorful vegetables and fruits</li>
                    <li>Adjusting intake based on activity levels day to day</li>
                  </ul>
                </>
              )}
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Recommended Macronutrient Balance</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium">Protein</p>
                    <p className="text-lg font-bold">
                      {profile.goal === 'gain' ? '25-30%' : profile.goal === 'lose' ? '30-35%' : '20-25%'}
                    </p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium">Carbs</p>
                    <p className="text-lg font-bold">
                      {profile.goal === 'gain' ? '50-55%' : profile.goal === 'lose' ? '40-45%' : '45-55%'}
                    </p>
                  </div>
                  
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
                    <p className="text-sm font-medium">Fat</p>
                    <p className="text-lg font-bold">
                      {profile.goal === 'gain' ? '20-25%' : profile.goal === 'lose' ? '20-25%' : '20-30%'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
