export interface MeditationStep {
  text: string;
  pauseSeconds: number;
}

export interface MeditationScript {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  steps: MeditationStep[];
}

export const MEDITATION_SCRIPTS: MeditationScript[] = [
  {
    id: 'breathing-focus',
    title: 'Breathing Focus',
    description: 'A calming breathing exercise to center your mind',
    durationMinutes: 5,
    steps: [
      { text: 'Find a comfortable seated position. Close your eyes gently.', pauseSeconds: 5 },
      { text: 'Take a deep breath in through your nose... hold... and slowly exhale through your mouth.', pauseSeconds: 8 },
      { text: 'Again, breathe in deeply... feel your chest and belly expand... and exhale slowly, releasing any tension.', pauseSeconds: 8 },
      { text: 'Now settle into a natural breathing rhythm. Just observe each breath as it comes and goes.', pauseSeconds: 10 },
      { text: 'Breathe in for four counts. One... two... three... four.', pauseSeconds: 6 },
      { text: 'Hold gently for four counts. One... two... three... four.', pauseSeconds: 6 },
      { text: 'Exhale slowly for six counts. One... two... three... four... five... six.', pauseSeconds: 8 },
      { text: 'Continue this pattern. In for four. Hold for four. Out for six.', pauseSeconds: 15 },
      { text: 'Let each exhale carry away any stress or worry. You are safe. You are present.', pauseSeconds: 15 },
      { text: 'Continue breathing at your own pace. If your mind wanders, gently bring it back to the breath.', pauseSeconds: 20 },
      { text: 'Feel the stillness within you. Each breath brings clarity and calm.', pauseSeconds: 20 },
      { text: 'Take three more deep breaths at your own pace.', pauseSeconds: 15 },
      { text: 'Now slowly bring your awareness back to the room. Wiggle your fingers and toes.', pauseSeconds: 8 },
      { text: 'When you are ready, gently open your eyes. Carry this calm with you into your day.', pauseSeconds: 5 },
    ],
  },
  {
    id: 'body-scan',
    title: 'Body Scan Relaxation',
    description: 'Progressive relaxation from head to toe for deep release',
    durationMinutes: 10,
    steps: [
      { text: 'Lie down or sit comfortably. Close your eyes and take three deep breaths.', pauseSeconds: 10 },
      { text: 'Bring your attention to the top of your head. Notice any sensation there. Let it soften.', pauseSeconds: 10 },
      { text: 'Move your awareness to your forehead and temples. Release any tightness you find.', pauseSeconds: 10 },
      { text: 'Relax the muscles around your eyes. Let your eyelids feel heavy and comfortable.', pauseSeconds: 8 },
      { text: 'Soften your jaw. Let your teeth part slightly. Relax your tongue.', pauseSeconds: 8 },
      { text: 'Now bring attention to your neck. This area often holds stress. Gently release any tension.', pauseSeconds: 12 },
      { text: 'Move down to your shoulders. Let them drop away from your ears. Feel them melt downward.', pauseSeconds: 12 },
      { text: 'Scan down through your arms. Your upper arms, elbows, forearms, wrists, and hands. Let them feel heavy and warm.', pauseSeconds: 15 },
      { text: 'Bring your awareness to your chest. Feel it rise and fall with each breath. Let your heart area soften.', pauseSeconds: 12 },
      { text: 'Move to your upper back. Release any knots or tightness. Imagine warm light dissolving the tension.', pauseSeconds: 12 },
      { text: 'Scan down through your lower back and abdomen. Let your belly be soft. Breathe naturally.', pauseSeconds: 12 },
      { text: 'Move your attention to your hips and pelvis. Let them feel grounded and supported.', pauseSeconds: 10 },
      { text: 'Scan down through your thighs, knees, and calves. Release any holding or tension.', pauseSeconds: 12 },
      { text: 'Bring awareness to your ankles, feet, and toes. Feel them relax completely.', pauseSeconds: 10 },
      { text: 'Now feel your entire body as one relaxed whole. From head to toe, you are at peace.', pauseSeconds: 15 },
      { text: 'Rest here in this state of total relaxation. You deserve this moment of stillness.', pauseSeconds: 20 },
      { text: 'Take three gentle deep breaths. Begin to bring small movements back to your body.', pauseSeconds: 12 },
      { text: 'Wiggle your fingers and toes. Stretch gently. When ready, open your eyes slowly.', pauseSeconds: 8 },
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude Meditation',
    description: 'Cultivate appreciation and positive energy',
    durationMinutes: 5,
    steps: [
      { text: 'Sit comfortably and close your eyes. Take a few deep breaths to settle in.', pauseSeconds: 8 },
      { text: 'Place your hand over your heart. Feel its steady beat. This simple rhythm keeps you alive.', pauseSeconds: 10 },
      { text: 'Think of one person who makes your life better. Picture their face. Feel the warmth of gratitude for them.', pauseSeconds: 15 },
      { text: 'Silently say thank you to this person. Thank you for being in my life.', pauseSeconds: 10 },
      { text: 'Now think of one thing about your body you are grateful for. Your legs that carry you. Your hands that create. Your eyes that see beauty.', pauseSeconds: 15 },
      { text: 'Think of a simple pleasure you enjoyed recently. A warm meal. A good conversation. Sunlight on your face.', pauseSeconds: 12 },
      { text: 'Feel the gratitude expand in your chest like a warm glow. Let it fill your whole body.', pauseSeconds: 12 },
      { text: 'Now think of a challenge you have faced. Find one thing it taught you. Even difficulties bring growth.', pauseSeconds: 15 },
      { text: 'Take a deep breath and silently say: I am grateful for this moment. I am grateful for my life.', pauseSeconds: 12 },
      { text: 'Carry this feeling of gratitude with you. When ready, gently open your eyes and smile.', pauseSeconds: 5 },
    ],
  },
  {
    id: 'headache-relief',
    title: 'Headache Relief & Calm',
    description: 'Gentle breathing and tension release for stress and headaches',
    durationMinutes: 7,
    steps: [
      { text: 'Sit comfortably. Keep your back relaxed.', pauseSeconds: 5 },
      { text: 'Gently close your eyes.', pauseSeconds: 4 },
      { text: 'Take a slow deep breath in.', pauseSeconds: 3 },
      { text: 'And slowly breathe out.', pauseSeconds: 4 },
      { text: 'Again. Breathe in.', pauseSeconds: 3 },
      { text: 'And breathe out.', pauseSeconds: 4 },
      { text: 'Now let your breathing return to normal.', pauseSeconds: 5 },
      { text: 'Just observe your breath. Feel the air entering your nose. And leaving your body.', pauseSeconds: 8 },
      { text: 'If your mind starts thinking, that is okay. Gently bring your attention back to your breath.', pauseSeconds: 8 },
      { text: 'No force. No frustration.', pauseSeconds: 6 },
      { text: 'Now bring your attention to your forehead. Let it relax.', pauseSeconds: 6 },
      { text: 'Relax your eyes. Relax your jaw.', pauseSeconds: 6 },
      { text: 'Let your shoulders drop. Release all tension.', pauseSeconds: 8 },
      { text: 'If you feel any headache or pressure, just observe it. Do not fight it.', pauseSeconds: 8 },
      { text: 'Come back to your breathing. Inhale. Exhale.', pauseSeconds: 12 },
      { text: 'Nothing to do. Nothing to fix. Just breathing.', pauseSeconds: 22 },
      { text: 'Now slowly bring awareness back. Move your fingers. Move your shoulders.', pauseSeconds: 8 },
      { text: 'When you are ready, gently open your eyes. Take your time.', pauseSeconds: 5 },
    ],
  },
];
