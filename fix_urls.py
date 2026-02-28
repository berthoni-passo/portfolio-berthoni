import os
import re

src_dir = r"C:\Users\Asus\Documents\projet\portfolio-berthoni\src"
pattern_str = r'"\${process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*"http://localhost:8000"}(/api/[^"]*)"'
replacement_str = r'"\1"'

pattern_backtick = r'`\${process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*"http://localhost:8000"}(/api/[^`]*)`'
replacement_backtick = r'`\1`'

for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            new_content = re.sub(pattern_backtick, replacement_backtick, content)
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as file:
                    file.write(new_content)
                print(f"Updated {path}")
