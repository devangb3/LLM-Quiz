# Interactive Study Quiz Generator

This application allows users to upload study materials and automatically generates interactive quizzes using the Deepseek API. Built with Python (FastAPI) backend and React frontend.

## Features

- Upload study materials in various formats (txt, doc, docx, pdf)
- Automatic quiz generation using AI
- Interactive quiz interface with multiple choice questions
- Immediate feedback and scoring
- Modern and responsive UI

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- Deepseek API key

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate  # Windows
   source venv/bin/activate  # Linux/Mac
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory and add your Deepseek API key:
   ```
   DEEPSEEK_API_KEY=your_api_key_here
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Upload your study material using the drag-and-drop interface
3. Click "Generate Quiz" to create a quiz based on your material
4. Answer the questions and get immediate feedback
5. View your final score and start a new quiz if desired

## Technologies Used

- Backend:
  - FastAPI
  - Python
  - Deepseek API

- Frontend:
  - React
  - TypeScript
  - Chakra UI
  - Vite

## Note

Make sure to keep your Deepseek API key secure and never commit it to version control. 