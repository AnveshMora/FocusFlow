import os

base = r'E:\github\FocusFlow\frontend\src'
dirs = [
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

for d in dirs:
    path = os.path.join(base, d)
    os.makedirs(path, exist_ok=True)
    print(f'Created: {path}')

print('\nAll directories created successfully!')
print('\nDirectory structure:')
for root, subdirs, files in os.walk(base):
    level = root.replace(base, '').count(os.sep)
    indent = ' ' * 2 * level
    print(f'{indent}{os.path.basename(root)}/')
    subindent = ' ' * 2 * (level + 1)
