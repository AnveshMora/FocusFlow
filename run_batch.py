#!/usr/bin/env python3
import subprocess
import sys
import os

# Run the batch script
batch_file = r'E:\github\FocusFlow\setup-frontend.bat'

if os.path.exists(batch_file):
    try:
        result = subprocess.run(['cmd.exe', '/c', batch_file], capture_output=True, text=True, timeout=30)
        print(result.stdout)
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
        sys.exit(result.returncode)
    except subprocess.TimeoutExpired:
        print("Batch script timed out")
        sys.exit(1)
    except Exception as e:
        print(f"Error running batch script: {e}")
        sys.exit(1)
else:
    print(f"Batch file not found: {batch_file}")
    sys.exit(1)
