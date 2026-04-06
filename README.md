# AI Tutor Web Application

A complete, runnable, production-ready AI Tutor Web Application for school students (Grades 1–8). Features an animated chatting character, voice transcription, and text-to-speech AI responses.

## Prerequisites
- Node.js (v18+ recommended)
- MongoDB instance (Local or Atlas)
- OpenAI API Key

## Setup Instructions

1. **Clone or Extract the Project**
   Ensure you are in the root directory (where this README is located).

2. **Setup Environment Variables**
   Open the `.env.example` file and copy its contents to a new file named `.env` in the `server/` directory:
   ```bash
   cd server
   cp ../.env.example .env
   # Edit .env with your OPENAI_API_KEY and MONGO_URI
   ```
   **Important:** You must add your actual `OPENAI_API_KEY` inside `server/.env` for the AI to function.

3. **Install Dependencies**
   Run the following commands to install dependencies for both the backend and frontend:
   
   *For Backend:*
   ```bash
   cd server
   npm install
   ```
   
   *For Frontend:*
   ```bash
   cd ../client
   npm install
   ```

4. **Run the Backend System**
   Open a terminal and start the Express server:
   ```bash
   cd server
   node index.js
   ```
   The backend will start running on port 5000.

5. **Run the Frontend App**
   Open a second terminal and start the Next.js development server:
   ```bash
   cd client
   npm run dev
   ```
   The frontend will start running on port 3000.

6. **Usage**
   - Open your browser and navigate to `http://localhost:3000`
   - Select the Student's Board and Grade via the context selectors.
   - Use the text input or the Mic button to talk directly to the AI Tutor.
   - The AI Tutor (Animated blob) will respond smartly using audio and an on-screen animated representation.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, Lottie-react
- **Backend**: Node.js, Express, Mongoose, OpenAI API
- **Voice**: Web Speech API (speech-to-text), Browser Speech Synthesis (text-to-speech)
- **Database**: MongoDB Mongoose Models
