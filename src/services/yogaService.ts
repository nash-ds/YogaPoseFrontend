
import { YogaPose, PracticeSession, UserStats } from '@/types/yoga';

// Base URL of your backend 
const BASE_URL = 'http://localhost:8000/api';

/**
 * Fetches all yoga poses from the backend
 */
export const getAllPoses = async (): Promise<YogaPose[]> => {
  try {
    const response = await fetch(`${BASE_URL}/poses`);
    if (!response.ok) throw new Error('Failed to fetch poses');
    return await response.json();
  } catch (error) {
    console.error('Error fetching poses:', error);
    // For development, let's return mock data
    return yogaPoseMockData;
  }
};

/**
 * Fetches a single yoga pose by ID
 */
export const getPoseById = async (id: string): Promise<YogaPose> => {
  try {
    const response = await fetch(`${BASE_URL}/poses/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch pose with ID ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching pose ${id}:`, error);
    // For development, find in mock data
    const pose = yogaPoseMockData.find(pose => pose.id === id);
    if (!pose) throw new Error(`Pose with ID ${id} not found`);
    return pose;
  }
};

/**
 * Records a practice session
 */
export const recordPracticeSession = async (session: Omit<PracticeSession, 'id'>): Promise<PracticeSession> => {
  try {
    const response = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(session),
    });
    if (!response.ok) throw new Error('Failed to record practice session');
    return await response.json();
  } catch (error) {
    console.error('Error recording practice session:', error);
    // For development
    return {
      id: Date.now().toString(),
      ...session
    };
  }
};

/**
 * Fetches user's practice history
 */
export const getPracticeHistory = async (): Promise<PracticeSession[]> => {
  try {
    const response = await fetch(`${BASE_URL}/sessions`);
    if (!response.ok) throw new Error('Failed to fetch practice history');
    return await response.json();
  } catch (error) {
    console.error('Error fetching practice history:', error);
    // For development
    return practiceHistoryMockData;
  }
};

/**
 * Fetches user statistics
 */
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await fetch(`${BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch user stats');
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // For development
    return userStatsMockData;
  }
};

// Mock data for development
const yogaPoseMockData: YogaPose[] = [
  // {
  //   id: "1",
  //   name: "Mountain Pose",
  //   sanskritName: "Tadasana",
  //   description: "The foundation of all standing poses, Mountain Pose establishes proper alignment and posture.",
  //   difficulty: "beginner",
  //   benefits: [
  //     "Improves posture and body awareness",
  //     "Strengthens thighs, knees, and ankles",
  //     "Firms abdomen and buttocks",
  //     "Relieves sciatica and reduces flat feet"
  //   ],
  //   instructions: [
  //     "Stand with feet together or hip-width apart",
  //     "Distribute weight evenly across both feet",
  //     "Engage your thigh muscles and lift your kneecaps",
  //     "Lengthen your tailbone toward the floor",
  //     "Draw your shoulders back and down",
  //     "Extend arms alongside your body with palms facing forward",
  //     "Hold for 30 seconds to 1 minute"
  //   ],
  //   precautions: [
  //     "If you have low blood pressure or feel dizzy, avoid holding this pose for extended periods",
  //     "Those with headaches should keep their head in a neutral position",
  //     "If balance is challenging, stand with feet hip-width apart"
  //   ],
  //   imageUrl: "/images/mountain-pose.jpg",
  //   category: "Standing",
  //   duration: 30,
  //   tags: ["beginner", "foundation", "alignment"]
  // },
  // {
  //   id: "2",
  //   name: "Downward-Facing Dog",
  //   sanskritName: "Adho Mukha Svanasana",
  //   description: "A classic yoga pose that forms an inverted V-shape. It stretches and strengthens the entire body.",
  //   difficulty: "beginner",
  //   benefits: [
  //     "Stretches shoulders, hamstrings, calves, and hands",
  //     "Strengthens arms and legs",
  //     "Improves digestion",
  //     "Relieves stress and calms the mind"
  //   ],
  //   instructions: [
  //     "Start on your hands and knees with wrists under shoulders and knees under hips",
  //     "Tuck your toes and lift your hips up and back",
  //     "Straighten your legs as much as comfortable, creating an inverted V shape",
  //     "Press your hands firmly into the mat and rotate your arms outward",
  //     "Allow your head to hang freely and gaze toward your navel",
  //     "Hold for 5-10 breaths"
  //   ],
  //   precautions: [
  //     "Avoid this pose if you have a wrist injury or carpal tunnel syndrome",
  //     "Those with high blood pressure should keep their head above their heart",
  //     "If hamstrings are tight, keep knees slightly bent"
  //   ],
  //   imageUrl: "/images/downward-facing-dog.jpg",
  //   category: "Standing",
  //   duration: 30,
  //   tags: ["beginner", "strength", "flexibility"]
  // },
  {
    id: "3",
    name: "Warrior 1",
    sanskritName: "Virabhadrasana I",
    description: "A standing pose that strengthens the legs and opens the hips and chest.",
    difficulty: "beginner",
    benefits: [
      "Strengthens legs, shoulders, and arms",
      "Opens chest, lungs, and shoulders",
      "Improves focus and balance",
      "Stretches hip flexors"
    ],
    instructions: [
      "Start in Mountain Pose",
      "Step one foot back about 4 feet and turn it out at a 45-degree angle",
      "Bend your front knee to a 90-degree angle, keeping it aligned with your ankle",
      "Raise your arms overhead, palms facing each other",
      "Gently arch your back and look up toward your hands",
      "Hold for 5-10 breaths"
    ],
    precautions: [
      "Avoid deep knee bend if you have knee injuries",
      "Those with shoulder problems should keep arms alongside the body",
      "If you have neck problems, don't look up"
    ],
    imageUrl: "/images/warrior-1.jpg",
    category: "Standing",
    duration: 45,
    tags: ["beginner", "strength", "balance"]
  },
  {
    id: "4",
    name: "Warrior 2",
    sanskritName: "Virabhadrasana II",
    description: "A powerful standing pose that builds strength and stamina in the legs and core.",
    difficulty: "beginner",
    benefits: [
      "Strengthens legs, ankles, and feet",
      "Opens hips and chest",
      "Improves stamina and concentration",
      "Stretches groins, chest, lungs, and shoulders"
    ],
    instructions: [
      "Stand with legs 4 to 5 feet apart",
      "Turn your right foot out 90 degrees and left foot in slightly",
      "Extend your arms parallel to the floor, actively reaching through the fingertips",
      "Bend your right knee to 90 degrees, keeping it over the ankle",
      "Turn your head to gaze over your right hand",
      "Hold for 5 breaths, then switch sides"
    ],
    precautions: [
      "Avoid if you have hip or knee injury",
      "Keep the bent knee aligned with ankle to protect the joint",
      "If you have neck issues, look forward instead of over the hand"
    ],
    imageUrl: "/images/warrior-2.jpg",
    category: "Standing",
    duration: 45,
    tags: ["beginner", "strength", "endurance"]
  },
  {
    id: "5",
    name: "Tree Pose",
    sanskritName: "Vrikshasana",
    description: "A balancing pose where you stand on one leg with the other foot placed on the inner thigh.",
    difficulty: "beginner",
    benefits: [
      "Improves balance and focus",
      "Strengthens legs and core",
      "Opens hips and stretches inner thighs",
      "Improves posture"
    ],
    instructions: [
      "Start in Mountain Pose",
      "Shift your weight onto your left foot",
      "Place your right foot on your left inner thigh or calf (avoid the knee)",
      "Bring your palms together at heart center or extend arms overhead",
      "Fix your gaze on a steady point for balance",
      "Hold for 5-10 breaths, then switch sides"
    ],
    precautions: [
      "If you have balance issues, stand near a wall for support",
      "Avoid if you have low blood pressure or migraine",
      "If you have knee issues, place foot below the knee"
    ],
    imageUrl: "/images/tree-pose.jpg",
    category: "Standing",
    duration: 30,
    tags: ["beginner", "balance", "focus"]
  },
  {
    id: "6",
    name: "Triangle Pose",
    sanskritName: "Trikonasana",
    description: "A standing pose that stretches and strengthens the legs, hips, and spine while opening the chest.",
    difficulty: "beginner",
    benefits: [
      "Stretches legs, hips, spine, chest, and shoulders",
      "Strengthens thighs, knees, and ankles",
      "Improves digestion and relieves backache",
      "Reduces stress and anxiety"
    ],
    instructions: [
      "Stand with legs 3-4 feet apart",
      "Turn right foot out 90 degrees and left foot in slightly",
      "Extend arms parallel to the floor",
      "Reach right hand down toward the right foot, extending left arm upward",
      "Turn head to gaze at left fingertips",
      "Hold for 30-60 seconds, then switch sides"
    ],
    precautions: [
      "If you have low blood pressure, avoid turning head upward",
      "Those with neck problems should keep gaze forward",
      "Use a block under the lower hand if needed for comfort"
    ],
    imageUrl: "/images/Trikonasana.jpg",
    category: "Standing",
    duration: 45,
    tags: ["beginner", "stretch", "alignment"]
  },
  {
    id: "7",
    name: "Child's Pose",
    sanskritName: "Balasana",
    description: "A restful pose that gently stretches the back, hips, thighs, and ankles.",
    difficulty: "beginner",
    benefits: [
      "Gently stretches lower back, hips, and thighs",
      "Calms the nervous system and reduces stress",
      "Relieves tension in the back, shoulders, and chest",
      "Promotes relaxation and steady breathing"
    ],
    instructions: [
      "Kneel on the floor with big toes touching, knees apart",
      "Sit back on your heels",
      "Fold forward, extending arms in front or alongside your body",
      "Rest your forehead on the floor",
      "Relax your shoulders and breathe deeply",
      "Hold for 1-3 minutes or as long as comfortable"
    ],
    precautions: [
      "If you have knee injuries, place a blanket under knees or between calves and thighs",
      "Pregnant women should keep knees together",
      "Those with shoulder injuries can rest arms alongside the body",
      "If you have diarrhea or are pregnant, avoid this pose"
    ],
    imageUrl: "/images/childs-pose.jpg",
    category: "Seated",
    duration: 60,
    tags: ["beginner", "restorative", "relaxation"]
  },
  {
    id: "8",
    name: "Cobra Pose",
    sanskritName: "Bhujangasana",
    description: "A gentle backbend that strengthens the spine and opens the chest.",
    difficulty: "beginner",
    benefits: [
      "Strengthens the spine",
      "Opens the chest and lungs",
      "Strengthens the arms and shoulders",
      "Stimulates abdominal organs",
      "Helps relieve stress and fatigue"
    ],
    instructions: [
      "Lie on your stomach with hands under shoulders, elbows close to the body",
      "Press the tops of the feet, thighs, and pelvis into the floor",
      "On an inhale, straighten the arms to lift the chest off the floor",
      "Keep a slight bend in the elbows and shoulders away from the ears",
      "Lift through the sternum rather than pushing with hands",
      "Hold for 15-30 seconds, breathing easily"
    ],
    precautions: [
      "Avoid with back injury, headache, or carpal tunnel syndrome",
      "If pregnant, avoid after the first trimester",
      "If you have wrist issues, try using forearms instead of hands",
      "Keep the legs active to protect the lower back"
    ],
    imageUrl: "/images/cobra-pose.jpg",
    category: "Prone",
    duration: 30,
    tags: ["beginner", "backbend", "strength"]
  },
  {
    id: "9",
    name: "Lord of Dance",
    sanskritName: "Paschimottanasana",
    description: "A seated forward bend that deeply stretches the back of the body from the heels to the head.",
    difficulty: "intermediate",
    benefits: [
      "Stretches hamstrings, spine, and shoulders",
      "Calms the mind and relieves stress",
      "Stimulates the liver, kidneys, and ovaries",
      "Improves digestion",
      "Helps relieve headache and fatigue"
    ],
    instructions: [
      "Sit with legs extended straight in front",
      "Engage your quadriceps and flex your feet",
      "Inhale, lengthen your spine",
      "Exhale and hinge at the hips to fold forward",
      "Hold your feet, ankles, or shins, wherever you can reach comfortably",
      "Hold for 1-3 minutes, breathing deeply"
    ],
    precautions: [
      "Avoid with lower back injuries",
      "If hamstrings are tight, bend knees slightly",
      "Sit on a folded blanket to tilt pelvis forward",
      "Focus on lengthening the spine rather than reaching the toes"
    ],
    imageUrl: "/images/seated-forward-bend.jpg",
    category: "Seated",
    duration: 60,
    tags: ["intermediate", "forward bend", "flexibility"]
  },
  {
    id: "10",
    name: "Bridge Pose",
    sanskritName: "Setu Bandha Sarvangasana",
    description: "A gentle backbend that strengthens the spine, opens the chest, and improves spinal flexibility.",
    difficulty: "beginner",
    benefits: [
      "Strengthens the back, glutes, and hamstrings",
      "Opens the chest and shoulders",
      "Calms the mind and reduces anxiety",
      "Stimulates organs in the abdomen",
      "Improves digestion and circulation"
    ],
    instructions: [
      "Lie on your back with knees bent, feet hip-width apart",
      "Place arms alongside the body with palms down",
      "Press feet into the floor and lift the hips up",
      "Roll shoulders under and interlace fingers below hips (optional)",
      "Keep thighs and feet parallel",
      "Hold for 30-60 seconds, breathing deeply"
    ],
    precautions: [
      "Avoid with neck injuries or if pregnant",
      "Keep head centered, not turning to sides",
      "If shoulder mobility is limited, keep arms alongside body",
      "Place a block under sacrum for a supported version"
    ],
    imageUrl: "/images/bridge-pose.jpg",
    category: "Supine",
    duration: 45,
    tags: ["beginner", "backbend", "strength"]
  }
];

const practiceHistoryMockData: PracticeSession[] = [
  {
    id: "1",
    poseId: "2",
    poseName: "Downward-Facing Dog",
    date: "2023-06-01T10:30:00Z",
    duration: 180,
    accuracy: 85,
    completed: true
  },
  {
    id: "2",
    poseId: "5",
    poseName: "Tree Pose",
    date: "2023-06-02T09:15:00Z",
    duration: 240,
    accuracy: 78,
    completed: true
  },
  {
    id: "3",
    poseId: "7",
    poseName: "Child's Pose",
    date: "2023-06-03T16:45:00Z",
    duration: 300,
    accuracy: 92,
    completed: true
  },
  {
    id: "4",
    poseId: "4",
    poseName: "Warrior II",
    date: "2023-06-04T08:00:00Z",
    duration: 270,
    accuracy: 81,
    completed: true
  },
  {
    id: "5",
    poseId: "3",
    poseName: "Warrior I",
    date: "2023-06-05T17:30:00Z",
    duration: 210,
    accuracy: 75,
    completed: false
  }
];

const userStatsMockData: UserStats = {
  totalSessions: 15,
  totalDuration: 3600,
  averageAccuracy: 82.3,
  favoriteCategory: "Standing",
  streak: 5
};
