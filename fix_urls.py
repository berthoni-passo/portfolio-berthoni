import os
import re

def fix_api_urls(directory):
    pattern1 = re.compile(r'\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| ""\}/\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| \'\'\}/api//')
    pattern2 = re.compile(r'/\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| \'\'\}/api//')
    pattern3 = r'https://fonts.google${process.env.NEXT_PUBLIC_API_URL || \'\'}/api/s.com'

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                new_content = pattern1.sub('${process.env.NEXT_PUBLIC_API_URL || ""}/api/', content)
                new_content = pattern2.sub('${process.env.NEXT_PUBLIC_API_URL || ""}/api/', new_content)
                new_content = new_content.replace(pattern3, 'https://fonts.googleapis.com')

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed: {filepath}")

if __name__ == "__main__":
    fix_api_urls("c:/Users/Asus/Documents/projet/portfolio-berthoni/src")
