# QGen: Tab & Questionnaire Generator

QGen is a web-based tool designed to streamline the market research workflow by automatically generating survey questionnaires and tabulation plans from a simple, structured input file.

QGen User Interface Screenshot:<img width="1919" height="878" alt="image" src="https://github.com/user-attachments/assets/7b283078-6412-479a-b6ce-0862203e6346" />


## 🌟 Key Features

-   **Automated Questionnaire Generation**: Creates a formatted Microsoft Word questionnaire from a tab plan.
-   **Tab Plan Creation**: Generates a detailed tabulation and banner plan in Excel format.
-   **Web-Based UI**: An easy-to-use interface for uploading inputs and downloading the generated files.
-   **Python Backend**: Built with a robust Flask backend to handle the logic.
-   **Packaged Executable**: Packaged as a simple `.exe` file for easy distribution and use on Windows.

## ⚙️ How It Works

The application takes a structured CSV file as a **Tab Plan**. This file defines the questions, their types (e.g., single-choice, multi-choice), and their corresponding options.

1.  **Upload**: The user uploads their Tab Plan CSV via the web interface.
2.  **Process**: The backend, powered by Flask, parses the input file.
3.  **Generate**: It then generates two key documents:
    -   A **Questionnaire** (`.docx` file) ready for fieldwork.
    -   An expanded **Tab Plan** (`.xlsx` file) with detailed banners for data analysis.
4.  **Download**: The user can download the generated files directly from the browser.

QGen Workflow Diagram:<img width="1917" height="897" alt="image" src="https://github.com/user-attachments/assets/94ce0d9c-9cd3-4356-b4e8-b9768ea57829" />


## 🚀 Getting Started

You can run this project in two ways: by using the pre-built executable or by running the source code in a local development environment.

### Option 1: Using the Executable

1.  Navigate to the `dist/` folder.
2.  Run `QGen.exe`.
3.  A terminal window will appear, and the server will start.
4.  Open your web browser and go to `http://127.0.0.1:5000`.

### Option 2: Running from Source

**Prerequisites:**
-   Python 3.8+
-   Pip (Python package installer)

**Installation:**

1.  **Clone the repository (or download the source):**
    ```sh
    git clone <your-repository-url>
    cd tab-banner-plan
    ```

2.  **Create and activate a virtual environment:**
    ```sh
    # For Windows
    python -m venv venv
    .\venv\Scripts\activate

    # For macOS/Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Install the required dependencies:**
    ```sh
    pip install -r requirements.txt
    ```

**Running the Application:**

1.  Execute the `app.py` script:
    ```sh
    python app.py
    ```
2.  Open your web browser and navigate to `http://127.0.0.1:5000`.

## 📁 Project Structure

tab-banner-plan/
├── app.py                  # Main Flask application
├── requirements.txt        # Project dependencies
├── backend/                # Core logic for generation
│   ├── generate_questionnaire.py
│   └── generate_tab_plan.py
├── ui/                     # Frontend files
│   └── index.html
├── examples/               # Sample input and output files
├── build/                  # PyInstaller build artifacts
├── dist/                   # Distribution executable (QGen.exe)
└── README.md               # This file


## 📄 License

This project is licensed under the terms of the license specified in the `LICENSE` file.
