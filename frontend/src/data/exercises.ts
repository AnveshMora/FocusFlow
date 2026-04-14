export interface Exercise {
  id: string;
  name: string;
  category: 'warmup' | 'strength' | 'stretch' | 'posture' | 'cooldown' | 'mobility';
  muscleGroup: string;
  instructions: string;
  duration: string;
  icon: string;
}

export const exercises: Exercise[] = [
  // Warm-up
  { id: 'neck-rolls', name: 'Neck Rolls', category: 'warmup', muscleGroup: 'Neck', instructions: 'Slowly roll your head in a circle — 5 times clockwise, 5 counter-clockwise. Keep shoulders relaxed.', duration: '1 min', icon: '🔄' },
  { id: 'arm-circles', name: 'Arm Circles', category: 'warmup', muscleGroup: 'Shoulders', instructions: 'Extend arms to sides. Make small circles, gradually increasing size. 15 forward, 15 backward.', duration: '1 min', icon: '⭕' },
  { id: 'jumping-jacks', name: 'Jumping Jacks', category: 'warmup', muscleGroup: 'Full Body', instructions: 'Jump feet apart while raising arms overhead. Return to start. Keep a steady rhythm.', duration: '1 min', icon: '⭐' },
  { id: 'high-knees', name: 'High Knees', category: 'warmup', muscleGroup: 'Legs / Core', instructions: 'Run in place, bringing knees to hip height. Pump arms for momentum. Stay on balls of feet.', duration: '1 min', icon: '🦵' },
  { id: 'hip-circles', name: 'Hip Circles', category: 'warmup', muscleGroup: 'Hips', instructions: 'Hands on hips, feet shoulder-width. Circle hips clockwise 10×, then counter-clockwise 10×.', duration: '1 min', icon: '🔄' },

  // Strength
  { id: 'pushups', name: 'Push-ups', category: 'strength', muscleGroup: 'Chest / Triceps', instructions: 'Hands shoulder-width, body straight. Lower chest to ground, push back up. Modify on knees if needed.', duration: '10-15 reps', icon: '💪' },
  { id: 'squats', name: 'Bodyweight Squats', category: 'strength', muscleGroup: 'Legs / Glutes', instructions: 'Feet shoulder-width. Sit back and down, keeping chest up and knees over toes. Stand back up.', duration: '15-20 reps', icon: '🏋️' },
  { id: 'plank', name: 'Plank Hold', category: 'strength', muscleGroup: 'Core', instructions: 'Forearms on ground, body straight from head to heels. Engage core, don\'t let hips sag. Breathe steadily.', duration: '30-60 sec', icon: '🧱' },
  { id: 'lunges', name: 'Walking Lunges', category: 'strength', muscleGroup: 'Legs / Glutes', instructions: 'Step forward, lower back knee toward ground. Push through front heel to step forward. Alternate legs.', duration: '10 each leg', icon: '🚶' },
  { id: 'band-rows', name: 'Resistance Band Rows', category: 'strength', muscleGroup: 'Back / Biceps', instructions: 'Anchor band at chest height. Pull handles toward ribs, squeezing shoulder blades. Slow return.', duration: '12-15 reps', icon: '🎯' },
  { id: 'band-press', name: 'Resistance Band Press', category: 'strength', muscleGroup: 'Chest / Shoulders', instructions: 'Band behind back, press forward at chest height. Fully extend arms, slow return.', duration: '12-15 reps', icon: '🎯' },
  { id: 'glute-bridge', name: 'Glute Bridges', category: 'strength', muscleGroup: 'Glutes / Hamstrings', instructions: 'Lie on back, feet flat on floor. Drive hips up, squeeze glutes at top. Lower slowly.', duration: '15-20 reps', icon: '🌉' },

  // Stretch
  { id: 'neck-stretch', name: 'Neck Side Stretch', category: 'stretch', muscleGroup: 'Neck', instructions: 'Tilt head toward right shoulder, hold 15 sec. Repeat left. Gently press with hand for deeper stretch.', duration: '30 sec each', icon: '↔️' },
  { id: 'shoulder-stretch', name: 'Cross-Body Shoulder Stretch', category: 'stretch', muscleGroup: 'Shoulders', instructions: 'Pull right arm across chest with left hand. Hold 20 sec. Switch sides.', duration: '20 sec each', icon: '🤗' },
  { id: 'chest-stretch', name: 'Doorway Chest Stretch', category: 'stretch', muscleGroup: 'Chest', instructions: 'Place forearm on doorframe at 90°. Step through gently until you feel stretch across chest. Hold.', duration: '20 sec each', icon: '🚪' },
  { id: 'hamstring-stretch', name: 'Standing Hamstring Stretch', category: 'stretch', muscleGroup: 'Hamstrings', instructions: 'Place foot on low surface. Keep leg straight, hinge at hips, reach toward toes.', duration: '20 sec each', icon: '🦵' },
  { id: 'quad-stretch', name: 'Standing Quad Stretch', category: 'stretch', muscleGroup: 'Quadriceps', instructions: 'Stand on one leg, grab ankle behind you. Pull heel toward glute, keep knees together.', duration: '20 sec each', icon: '🦵' },
  { id: 'hip-flexor', name: 'Hip Flexor Stretch', category: 'stretch', muscleGroup: 'Hip Flexors', instructions: 'Kneel on one knee, front foot flat. Push hips forward gently. Feel stretch in front of hip.', duration: '20 sec each', icon: '🧘' },

  // Posture Correction
  { id: 'chin-tuck', name: 'Chin Tucks', category: 'posture', muscleGroup: 'Neck / Upper Back', instructions: 'Pull chin straight back (make a double chin). Hold 5 sec. Release. Great for desk workers.', duration: '10 reps', icon: '📏' },
  { id: 'wall-angel', name: 'Wall Angels', category: 'posture', muscleGroup: 'Shoulders / Back', instructions: 'Back against wall, arms in "goalpost" position. Slide arms up and down, keeping contact with wall.', duration: '10 reps', icon: '👼' },
  { id: 'thoracic-ext', name: 'Thoracic Extension', category: 'posture', muscleGroup: 'Upper Back', instructions: 'Sit in chair, hands behind head. Lean back over chair backrest, extending upper back. Hold 5 sec.', duration: '8-10 reps', icon: '🪑' },

  // Cool-down
  { id: 'child-pose', name: 'Child\'s Pose', category: 'cooldown', muscleGroup: 'Back / Hips', instructions: 'Kneel, sit back on heels, reach arms forward on floor. Relax and breathe deeply.', duration: '30-60 sec', icon: '🙏' },
  { id: 'cat-cow', name: 'Cat-Cow Stretch', category: 'cooldown', muscleGroup: 'Spine', instructions: 'On all fours — arch back up (cat), then drop belly down (cow). Move slowly with breath.', duration: '10 reps', icon: '🐱' },
  { id: 'deep-breathing', name: 'Deep Breathing', category: 'cooldown', muscleGroup: 'Recovery', instructions: 'Inhale 4 counts through nose, hold 4 counts, exhale 6 counts through mouth. Full body relaxation.', duration: '2 min', icon: '🌬️' },

  // Mobility
  { id: 'ankle-circles', name: 'Ankle Circles', category: 'mobility', muscleGroup: 'Ankles', instructions: 'Lift one foot, circle ankle clockwise 10×, counter-clockwise 10×. Switch feet.', duration: '1 min', icon: '🔄' },
  { id: 'wrist-circles', name: 'Wrist Circles', category: 'mobility', muscleGroup: 'Wrists', instructions: 'Circle wrists clockwise 10×, counter-clockwise 10×. Good for desk workers and lifters.', duration: '1 min', icon: '🔄' },
  { id: 'shoulder-rolls', name: 'Shoulder Rolls', category: 'mobility', muscleGroup: 'Shoulders', instructions: 'Roll shoulders forward 10×, backward 10×. Exaggerate the motion, focus on full range.', duration: '1 min', icon: '🔄' },
];

export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return exercises.filter((e) => e.category === category);
}

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}
