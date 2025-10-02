"""
Startup script for SPSS Data Visualization Dashboard
"""

import sys
import subprocess
from pathlib import Path

def install_requirements():
    """Install required packages"""
    requirements_file = Path(__file__).parent / "requirements.txt"

    if requirements_file.exists():
        print("Installing requirements...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
        print("Requirements installed successfully!")
    else:
        print("requirements.txt not found")

def run_app():
    """Run the Shiny application"""
    print("Starting SPSS Data Visualization Dashboard...")
    print("Open your browser to: http://localhost:7394")
    print("Upload your SPSS CSV files to get started!")

    # Import and run the app
    from main import app
    app.run(host="0.0.0.0", port=7394)

if __name__ == "__main__":
    try:
        install_requirements()
        run_app()
    except KeyboardInterrupt:
        print("\nApplication stopped by user")
    except Exception as e:
        print(f"Error: {e}")
        print("Make sure you have Python 3.8+ installed")