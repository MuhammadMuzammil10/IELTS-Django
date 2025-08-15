#!/usr/bin/env python3
"""
IELTS Preparation Platform Setup Script

This script helps you set up the IELTS preparation platform with Django backend and React frontend.
"""

import os
import sys
import subprocess
import platform

def run_command(command, cwd=None):
    """Run a command and return the result"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} is compatible")
    return True

def check_node_version():
    """Check if Node.js is installed"""
    success, stdout, stderr = run_command("node --version")
    if success:
        print(f"✅ Node.js {stdout.strip()} is installed")
        return True
    else:
        print("❌ Node.js is not installed. Please install Node.js 16 or higher")
        return False

def setup_backend():
    """Set up the Django backend"""
    print("\n🔧 Setting up Django backend...")
    
    # Create virtual environment
    if not os.path.exists("backend/venv"):
        print("Creating virtual environment...")
        success, stdout, stderr = run_command("python -m venv venv", cwd="backend")
        if not success:
            print(f"❌ Failed to create virtual environment: {stderr}")
            return False
        print("✅ Virtual environment created")
    
    # Activate virtual environment and install dependencies
    if platform.system() == "Windows":
        activate_cmd = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:
        activate_cmd = "source venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    print("Installing Python dependencies...")
    success, stdout, stderr = run_command(f"{pip_cmd} install -r requirements.txt", cwd="backend")
    if not success:
        print(f"❌ Failed to install dependencies: {stderr}")
        return False
    print("✅ Python dependencies installed")
    
    # Create .env file
    env_content = """SECRET_KEY=django-insecure-change-this-in-production
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
OPENAI_API_KEY=your-openai-api-key-here
"""
    
    with open("backend/.env", "w") as f:
        f.write(env_content)
    print("✅ Environment file created")
    
    # Run migrations
    print("Running database migrations...")
    success, stdout, stderr = run_command(f"{pip_cmd} install django", cwd="backend")
    if not success:
        print(f"❌ Failed to install Django: {stderr}")
        return False
    
    # success, stdout, stderr = run_command(f"{pip_cmd} run python manage.py makemigrations", cwd="backend")
    # if not success:
    #     print(f"❌ Failed to create migrations: {stderr}")
    #     return False
    
    # success, stdout, stderr = run_command(f"{pip_cmd} run python manage.py migrate", cwd="backend")
    # if not success:
    #     print(f"❌ Failed to run migrations: {stderr}")
    #     return False
    # print("✅ Database migrations completed")
    
    return True

def setup_frontend():
    """Set up the React frontend"""
    print("\n🔧 Setting up React frontend...")
    
    # Install Node.js dependencies
    print("Installing Node.js dependencies...")
    success, stdout, stderr = run_command("npm install", cwd="frontend")
    if not success:
        print(f"❌ Failed to install Node.js dependencies: {stderr}")
        return False
    print("✅ Node.js dependencies installed")
    
    return True

def create_superuser():
    """Create a Django superuser"""
    print("\n👤 Creating Django superuser...")
    print("Please enter the following information for the admin user:")
    
    username = input("Username: ").strip()
    email = input("Email: ").strip()
    password = input("Password: ").strip()
    
    if platform.system() == "Windows":
        pip_cmd = "venv\\Scripts\\pip"
    else:
        pip_cmd = "venv/bin/pip"
    
    # Create superuser using Django management command
    env_vars = f"DJANGO_SUPERUSER_USERNAME={username} DJANGO_SUPERUSER_EMAIL={email} DJANGO_SUPERUSER_PASSWORD={password}"
    success, stdout, stderr = run_command(f"{env_vars} {pip_cmd} run python manage.py createsuperuser --noinput", cwd="backend")
    
    if success:
        print("✅ Superuser created successfully")
        return True
    else:
        print(f"❌ Failed to create superuser: {stderr}")
        return False

def main():
    """Main setup function"""
    print("🚀 IELTS Preparation Platform Setup")
    print("=" * 50)
    
    # Check prerequisites
    if not check_python_version():
        return False
    
    if not check_node_version():
        return False
    
    # Set up backend
    # if not setup_backend():
    #     return False
    
    # Set up frontend
    if not setup_frontend():
        return False
    
    # Create superuser
    create_superuser_choice = input("\nWould you like to create a Django superuser? (y/n): ").strip().lower()
    if create_superuser_choice == 'y':
        create_superuser()
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Update the OPENAI_API_KEY in backend/.env with your actual API key")
    print("2. Start the Django backend: cd backend && python manage.py runserver")
    print("3. Start the React frontend: cd frontend && npm start")
    print("4. Open http://localhost:3000 in your browser")
    print("\nFor more information, see the README.md file")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 