# Q-Gen: Questionnaire & Tab Plan Generator

**A web-based visual editor to accelerate the creation of market research survey documents.**

![Status](https://img.shields.io/badge/status-proof--of--concept-orange)
![License](https://img.shields.io/badge/license-CC%20BY--NC--SA%204.0-lightgrey)

Q-Gen is an internal tool developed for [Cue Insights](https://www.cueinsights.com/) to automate the tedious process of authoring, validating, and exporting survey questionnaires and data tabulation plans from a structured JSON definition. While designed for an in-house workflow, the code is open-source for non-commercial use.

Dashboard: Light Mode <img width="1919" height="902" alt="image" src="https://github.com/user-attachments/assets/e2d75dd7-4fc4-48c5-b54d-ec42dffba5a9" />

Dashboard: Dark Mode <img width="1919" height="901" alt="image" src="https://github.com/user-attachments/assets/c0d52450-cf17-4015-a209-906164fd9afe" />

Editor: <img width="1919" height="906" alt="image" src="https://github.com/user-attachments/assets/d3f1b378-0795-4e91-919e-b00c138b598d" />


---

### ## 🎯 Core Purpose

In market research, the first step of any study is authoring a precise questionnaire. This tool provides a dedicated interface to build the survey structure, logic, and question types before it's fielded to the public. It enforces a consistent data structure (`qgen_schema.json`) and provides backend scripts to generate client-ready documents.

### ## ✨ Key Features

-   **Live Visual Editor**: A web UI to build surveys from scratch or load and edit existing project `.json` files.
-   **Schema-Driven Validation**: Ensures that all project data conforms to a strict, predictable structure, preventing errors downstream.
-   **Multiple Exporters**: Includes backend Python scripts to generate:
    -   `.docx` Word questionnaires for review.
    -   `.xlsx` Excel tabulation plans for data analysis teams.
-   **Market Research Logic**: Natively handles concepts like screeners (`S1`, `S2`), Likert scales, grid questions, and banner definitions.

### ## ⚠️ Project Status: Proof of Concept

This project is currently a **work-in-progress**. The UI is the main focus of development, with the backend scripts being built out next. It should be considered a pre-beta tool.

### ## 🚀 Getting Started (Running the UI)

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/wilcosgrove123/qgen-tab-planner.git](https://github.com/wcosgrove123/qgen-tab-planner.git)
    cd qgen-tab-planner.git
    ```

2.  **Set up a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Run the Flask server:**
    ```bash
    python app.py
    ```

5.  Open your browser and navigate to `http://127.0.0.1:5000` (or the address shown in your terminal).

### ## 🛠️ Backend Scripts

You can also generate documents directly from the command line (note: these are still under development).

-   **Generate a Questionnaire:**
    ```bash
    python backend/generate_questionnaire.py --project examples/sample_project.json --out "My_Questionnaire.docx"
    ```
-   **Generate a Tab Plan:**
    ```bash
    python backend/generate_tab_plan.py --project examples/sample_project.json --out "My_Tab_Plan.xlsx"
    ```

### ## 💻 Tech Stack

-   **Backend**: Python, Flask
-   **Data Processing**: pandas
-   **Document Generation**: python-docx, xlsxwriter
-   **Frontend**: Vanilla HTML, CSS, and JavaScript (no frameworks)
-   **Validation**: jsonschema

### ## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**. You are free to share and adapt the material, but you may not use it for commercial purposes. See the `LICENSE` file for more details.
