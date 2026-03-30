#!/usr/bin/env python3
"""Create FocusFlow Frontend Directory Structure"""

import os
import sys

base_path = r'E:\github\FocusFlow\frontend\src'

# Define all directories to create
directories = [
    'types',
    'store',
    'services\\api',
    'hooks',
    'components\\common',
    'components\\timeline',
    'components\\widgets',
    'components\\modals',
    'components\\timer',
    'pages\\auth',
    'pages\\home',
    'pages\\activity',
    'pages\\analytics',
    'pages\\schedule',
    'pages\\settings',
    'styles'
]

print("Creating FocusFlow Frontend Directory Structure...")
print(f"Base path: {base_path}\n")

# Create each directory
created_count = 0
for dir_name in directories:
    full_path = os.path.join(base_path, dir_name)
    try:
        os.makedirs(full_path, exist_ok=True)
        print(f"✓ Created: {full_path}")
        created_count += 1
    except Exception as e:
        print(f"✗ Error creating {full_path}: {e}")

print(f"\n✓ Successfully created {created_count} directories!\n")

# Verify the structure by listing all directories
print("Verifying directory structure:")
print("-" * 80)

if os.path.exists(base_path):
    for root, dirs, files in os.walk(base_path):
        level = root.replace(base_path, '').count(os.sep)
        indent = '  ' * level
        print(f'{indent}📁 {os.path.basename(root)}/')
        subindent = '  ' * (level + 1)
        for d in sorted(dirs):
            print(f'{subindent}📂 {d}/')
else:
    print(f"Error: Base path does not exist: {base_path}")
    sys.exit(1)

print("\n" + "=" * 80)
print("✓ Directory structure creation verified successfully!")
print("=" * 80)
