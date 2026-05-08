import os
import re

issues = []

def check_file(path, content):
    # Check for createContext(null)
    if 'createContext(null)' in content:
        issues.append(f"❌ {path}: createContext(null) will crash if used outside provider")
    
    # Check for destructuring without fallback
    if 'const { user } = useAuth()' in content and '|| {}' not in content:
        issues.append(f"⚠️  {path}: Destructuring useAuth() without fallback")
    
    # Check for rendering objects directly
    matches = re.findall(r'\{(\w+)\}', content)
    for m in matches:
        if m in ['user', 'profile', 'data', 'res', 'response']:
            issues.append(f"⚠️  {path}: Might be rendering object '{m}' directly in JSX")
    
    # Check for useAuth outside provider possibility
    if 'useAuth()' in content and 'AuthProvider' not in content:
        issues.append(f"⚠️  {path}: Uses useAuth() — ensure wrapped in AuthProvider")

# Scan all JS files
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    check_file(path, f.read())
            except:
                pass

if issues:
    print("\n".join(issues))
else:
    print("✅ No obvious issues found")