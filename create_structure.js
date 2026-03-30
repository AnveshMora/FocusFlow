const fs = require('fs');
const path = require('path');

const basePath = 'E:\\github\\FocusFlow\\frontend\\src';

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

console.log('Creating FocusFlow Frontend Directory Structure...\n');

let createdCount = 0;
directories.forEach(dir => {
  const fullPath = path.join(basePath, dir);
  try {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✓ Created: ${fullPath}`);
    createdCount++;
  } catch (err) {
    console.error(`✗ Error creating ${fullPath}: ${err.message}`);
  }
});

console.log(`\n✓ Successfully created ${createdCount} directories!\n`);

// Verify structure
console.log('Verifying directory structure:');
console.log('─'.repeat(80));

function walkDir(dir, indent = '') {
  try {
    const files = fs.readdirSync(dir);
    const dirs = files.filter(f => {
      const stat = fs.statSync(path.join(dir, f));
      return stat.isDirectory();
    }).sort();
    
    dirs.forEach((d, idx) => {
      const isLast = idx === dirs.length - 1;
      const prefix = isLast ? '└── ' : '├── ';
      console.log(`${indent}${prefix}📂 ${d}/`);
      const nextIndent = indent + (isLast ? '    ' : '│   ');
      walkDir(path.join(dir, d), nextIndent);
    });
  } catch (err) {
    console.error(`Error reading directory: ${err.message}`);
  }
}

console.log(`📁 ${basePath}/`);
walkDir(basePath);

console.log('\n' + '═'.repeat(80));
console.log('✓ Directory structure creation verified successfully!');
console.log('═'.repeat(80));
