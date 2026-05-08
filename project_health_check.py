#!/usr/bin/env python3
"""
LeadFlow AI - Project Health Check & Cleanup Tool
Run this BEFORE deploying to catch issues early.

Usage:
    python project_health_check.py
"""

import os
import sys
import json
from pathlib import Path
from collections import defaultdict

class ProjectHealthCheck:
    def __init__(self, project_root='.'):
        self.project_root = Path(project_root).resolve()
        self.issues = []
        self.warnings = []
        self.oks = []

        # Expected structure
        self.expected_structure = {
            'backend': {
                'required_files': ['package.json', 'src/server.js'],
                'required_folders': ['src/routes', 'src/models', 'src/middleware', 'src/utils', 'src/config'],
                'forbidden_files': ['node_modules', '.env']  # Should not be committed
            },
            'frontend': {
                'required_files': ['package.json', 'src/index.js', 'src/App.js', 'public/index.html'],
                'required_folders': ['src/pages', 'src/components', 'src/context'],
                'forbidden_files': ['node_modules', 'build', '.env']
            },
            'scraper': {
                'required_files': ['requirements.txt', 'google_maps_scraper.py', 'bulk_upload.py'],
                'required_folders': [],
                'forbidden_files': ['__pycache__', '.env', '*.pyc']
            },
            'docs': {
                'required_files': ['README.md', 'DEPLOYMENT_GUIDE.md'],
                'required_folders': [],
                'forbidden_files': []
            }
        }

    def log_ok(self, msg):
        self.oks.append(f"✅ {msg}")

    def log_warn(self, msg):
        self.warnings.append(f"⚠️  {msg}")

    def log_error(self, msg):
        self.issues.append(f"❌ {msg}")

    def check_structure(self):
        """Verify all required files and folders exist"""
        print("\n📂 CHECKING PROJECT STRUCTURE...")
        print("=" * 60)

        for folder_name, requirements in self.expected_structure.items():
            folder_path = self.project_root / folder_name

            if not folder_path.exists():
                self.log_error(f"Missing folder: {folder_name}/")
                continue

            self.log_ok(f"Folder exists: {folder_name}/")

            # Check required files
            for req_file in requirements['required_files']:
                file_path = folder_path / req_file
                if file_path.exists():
                    size = file_path.stat().st_size
                    self.log_ok(f"  📄 {folder_name}/{req_file} ({size} bytes)")
                else:
                    self.log_error(f"  Missing file: {folder_name}/{req_file}")

            # Check required folders
            for req_folder in requirements['required_folders']:
                folder_path_check = folder_path / req_folder
                if folder_path_check.exists():
                    file_count = len(list(folder_path_check.glob('*')))
                    self.log_ok(f"  📁 {folder_name}/{req_folder}/ ({file_count} files)")
                else:
                    self.log_error(f"  Missing folder: {folder_name}/{req_folder}/")

            # Check forbidden files (should NOT exist in git)
            for forbidden in requirements['forbidden_files']:
                if '*' in forbidden:
                    # Glob pattern
                    matches = list(folder_path.glob(forbidden))
                    if matches:
                        self.log_warn(f"  {folder_name}/ contains {len(matches)} {forbidden} file(s) - should be in .gitignore")
                else:
                    forbidden_path = folder_path / forbidden
                    if forbidden_path.exists():
                        self.log_warn(f"  {folder_name}/{forbidden} exists - should be in .gitignore")

    def find_duplicates(self):
        """Find duplicate files by content hash"""
        print("\n🔍 CHECKING FOR DUPLICATE FILES...")
        print("=" * 60)

        file_hashes = defaultdict(list)

        for folder_name in self.expected_structure.keys():
            folder_path = self.project_root / folder_name
            if not folder_path.exists():
                continue

            for file_path in folder_path.rglob('*'):
                if file_path.is_file() and file_path.stat().st_size < 10_000_000:  # Skip files > 10MB
                    try:
                        content = file_path.read_bytes()
                        import hashlib
                        file_hash = hashlib.md5(content).hexdigest()
                        relative_path = file_path.relative_to(self.project_root)
                        file_hashes[file_hash].append(str(relative_path))
                    except:
                        pass

        duplicates_found = False
        for file_hash, paths in file_hashes.items():
            if len(paths) > 1:
                duplicates_found = True
                self.log_warn(f"Duplicate content found in {len(paths)} files:")
                for p in paths:
                    print(f"     → {p}")

        if not duplicates_found:
            self.log_ok("No duplicate files found")

    def check_package_json(self):
        """Validate package.json files"""
        print("\n📦 CHECKING PACKAGE.JSON FILES...")
        print("=" * 60)

        # Backend package.json
        backend_pkg = self.project_root / 'backend' / 'package.json'
        if backend_pkg.exists():
            try:
                data = json.loads(backend_pkg.read_text())
                required_scripts = ['start']
                for script in required_scripts:
                    if script in data.get('scripts', {}):
                        self.log_ok(f"backend/package.json has '{script}' script")
                    else:
                        self.log_error(f"backend/package.json missing '{script}' script")

                required_deps = ['express', 'mongoose', 'bcryptjs', 'jsonwebtoken', 'cors']
                for dep in required_deps:
                    if dep in data.get('dependencies', {}):
                        self.log_ok(f"backend has dependency: {dep}")
                    else:
                        self.log_error(f"backend missing dependency: {dep}")
            except json.JSONDecodeError:
                self.log_error("backend/package.json is invalid JSON")

        # Frontend package.json
        frontend_pkg = self.project_root / 'frontend' / 'package.json'
        if frontend_pkg.exists():
            try:
                data = json.loads(frontend_pkg.read_text())
                if 'react' in data.get('dependencies', {}):
                    self.log_ok("frontend has React dependency")
                else:
                    self.log_error("frontend missing React dependency")
            except json.JSONDecodeError:
                self.log_error("frontend/package.json is invalid JSON")

    def check_env_files(self):
        """Check .env files are examples only (not real secrets)"""
        print("\n🔐 CHECKING ENVIRONMENT FILES...")
        print("=" * 60)

        env_files = list(self.project_root.rglob('.env'))
        env_examples = list(self.project_root.rglob('.env.example'))

        if env_files:
            self.log_warn(f"Found {len(env_files)} .env file(s) - make sure they are NOT committed to Git!")
            for f in env_files:
                print(f"     → {f.relative_to(self.project_root)}")
        else:
            self.log_ok("No .env files found (good for Git safety)")

        if env_examples:
            self.log_ok(f"Found {len(env_examples)} .env.example file(s)")
        else:
            self.log_warn("No .env.example files found - create them for documentation")

    def check_gitignore(self):
        """Check if .gitignore exists and covers important files"""
        print("\n🙈 CHECKING .GITIGNORE...")
        print("=" * 60)

        gitignore = self.project_root / '.gitignore'

        if not gitignore.exists():
            self.log_error("Missing .gitignore file - this is CRITICAL!")
            self.log_error("Without .gitignore, you'll push node_modules and .env to GitHub")
            return

        content = gitignore.read_text()
        required_patterns = [
            'node_modules',
            '.env',
            'build',
            '__pycache__',
            '*.pyc'
        ]

        for pattern in required_patterns:
            if pattern in content:
                self.log_ok(f".gitignore covers: {pattern}")
            else:
                self.log_warn(f".gitignore missing: {pattern}")

    def generate_gitignore(self):
        """Generate a proper .gitignore if missing"""
        gitignore_content = """# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
build/
dist/
*.tgz

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.venv/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/
"""

        gitignore_path = self.project_root / '.gitignore'
        if not gitignore_path.exists():
            gitignore_path.write_text(gitignore_content)
            self.log_ok("Created .gitignore file")
        else:
            self.log_ok(".gitignore already exists")

    def clean_project(self):
        """Remove common junk files"""
        print("\n🧹 CLEANING PROJECT...")
        print("=" * 60)

        removed = []

        # Remove __pycache__ folders
        for pycache in self.project_root.rglob('__pycache__'):
            if pycache.is_dir():
                import shutil
                shutil.rmtree(pycache)
                removed.append(str(pycache.relative_to(self.project_root)))

        # Remove .pyc files
        for pyc in self.project_root.rglob('*.pyc'):
            pyc.unlink()
            removed.append(str(pyc.relative_to(self.project_root)))

        if removed:
            self.log_ok(f"Removed {len(removed)} junk files/folders")
            for r in removed[:5]:
                print(f"     → Deleted: {r}")
            if len(removed) > 5:
                print(f"     → ... and {len(removed)-5} more")
        else:
            self.log_ok("No junk files found")

    def run_all_checks(self):
        """Run complete health check"""
        print("\n" + "=" * 60)
        print("🩺 LEADFLOW AI - PROJECT HEALTH CHECK")
        print("=" * 60)

        self.check_structure()
        self.find_duplicates()
        self.check_package_json()
        self.check_env_files()
        self.check_gitignore()
        self.clean_project()

        # Generate .gitignore if needed
        gitignore = self.project_root / '.gitignore'
        if not gitignore.exists():
            print("\n⚡ Auto-generating .gitignore...")
            self.generate_gitignore()

        # Print summary
        print("\n" + "=" * 60)
        print("📊 HEALTH CHECK SUMMARY")
        print("=" * 60)

        if self.oks:
            print(f"\n✅ PASSED ({len(self.oks)} checks):")
            for ok in self.oks:
                print(f"   {ok}")

        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warn in self.warnings:
                print(f"   {warn}")

        if self.issues:
            print(f"\n❌ ERRORS ({len(self.issues)}) - MUST FIX BEFORE DEPLOYMENT:")
            for issue in self.issues:
                print(f"   {issue}")
            print("\n🛑 DEPLOYMENT BLOCKED - Fix errors above first!")
            return False
        else:
            print("\n🎉 ALL CHECKS PASSED - Ready for deployment!")
            return True


if __name__ == '__main__':
    checker = ProjectHealthCheck()
    ready = checker.run_all_checks()

    if ready:
        print("\n📋 NEXT STEPS:")
        print("   1. git add .")
        print("   2. git commit -m 'Clean project - ready for deployment'")
        print("   3. git push origin main")
    else:
        print("\n🔧 Fix the errors above, then run this script again.")
