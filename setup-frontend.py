import os
import json

base_dir = r'E:\github\FocusFlow\frontend\src'

directories = [
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
]

# Create all directories
for dir_path in directories:
    full_path = os.path.join(base_dir, dir_path)
    os.makedirs(full_path, exist_ok=True)
    print(f'Created: {full_path}')

# Create package.json
package_json = {
    'name': 'focusflow-frontend',
    'version': '1.0.0',
    'description': 'FocusFlow - Pomodoro Timer with Timeline Visualization',
    'type': 'module',
    'scripts': {
        'dev': 'vite',
        'build': 'tsc && vite build',
        'preview': 'vite preview',
        'lint': 'tsc --noEmit'
    },
    'dependencies': {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'zustand': '^4.4.0',
        'axios': '^1.6.0',
        'react-router-dom': '^6.20.0',
        'lucide-react': '^0.292.0',
        'recharts': '^2.10.0'
    },
    'devDependencies': {
        'typescript': '^5.3.0',
        'vite': '^5.0.0',
        '@vitejs/plugin-react': '^4.2.0',
        'tailwindcss': '^3.3.0',
        'postcss': '^8.4.0',
        'autoprefixer': '^10.4.0'
    }
}

package_json_path = r'E:\github\FocusFlow\frontend\package.json'
with open(package_json_path, 'w') as f:
    json.dump(package_json, f, indent=2)
print(f'\nCreated: {package_json_path}')
print('\nVerifying directory structure...')
for root, dirs, files in os.walk(base_dir):
    level = root.replace(base_dir, '').count(os.sep)
    indent = ' ' * 2 * level
    print(f'{indent}{os.path.basename(root)}/')
    subindent = ' ' * 2 * (level + 1)
    for file in files:
        print(f'{subindent}{file}')
