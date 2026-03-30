const fs = require('fs');
const path = require('path');

const baseDir = 'E:\\github\\FocusFlow\\frontend\\src';

const directories = [
  'types',
  'store',
  'services/api',
  'hooks',
  'components/common',
  'components/timeline',
  'components/widgets',
  'components/modals',
  'components/timer',
  'pages/auth',
  'pages/home',
  'pages/activity',
  'pages/analytics',
  'pages/schedule',
  'pages/settings',
  'styles'
];

// Create all directories
directories.forEach(dir => {
  const fullPath = path.join(baseDir, dir);
  fs.mkdirSync(fullPath, { recursive: true });
  console.log(`✓ Created: ${dir}`);
});

// Create package.json
const packageJson = {
  "name": "focusflow-frontend",
  "version": "1.0.0",
  "description": "FocusFlow - Pomodoro Timer with Timeline Visualization",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.20.0",
    "lucide-react": "^0.292.0",
    "recharts": "^2.10.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
};

const packageJsonPath = path.join('E:\\github\\FocusFlow\\frontend', 'package.json');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log(`\n✓ Created: frontend/package.json`);

console.log('\n✅ All directories and package.json created successfully!');
