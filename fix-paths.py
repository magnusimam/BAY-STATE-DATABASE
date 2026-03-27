"""Fix Windows paths in OpenNext build output for Cloudflare deployment."""
import os
import re

BUILD_DIR = '.open-next'
WIN_PATH = r'C:\Users\user\BAY STATE INTELLIGENCE\BAY-STATE-DATABASE'
REPLACE_WITH = '/app'

fixed_count = 0

for root, dirs, files in os.walk(BUILD_DIR):
    # Skip node_modules and assets (client-side JS is fine)
    if 'node_modules' in root or os.path.join(BUILD_DIR, 'assets') in root:
        continue
    for fname in files:
        if not fname.endswith(('.mjs', '.js', '.json', '.sql', '.cjs')):
            continue
        fpath = os.path.join(root, fname)
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            continue

        original = content

        # Replace all variations of the Windows path
        # Double-escaped (JSON strings): C:\\\\Users\\\\...
        content = content.replace(WIN_PATH.replace('\\', '\\\\'), REPLACE_WITH)
        # Single backslash: C:\Users\...
        content = content.replace(WIN_PATH, REPLACE_WITH)
        # Forward slash version: C:/Users/...
        content = content.replace(WIN_PATH.replace('\\', '/'), REPLACE_WITH)

        # Fix backslash path separators in SQL files
        if fname.endswith('.sql'):
            content = content.replace('\\\\', '/')

        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            fixed_count += 1
            print(f'Fixed: {fpath}')

print(f'\nTotal files fixed: {fixed_count}')
