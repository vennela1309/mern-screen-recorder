# MERN Screen Recorder

A web-based screen recorder application built with the MERN stack (React + Node.js + Express + SQLite). Users can record their browser screen with microphone audio, preview, download, and upload recordings. The backend stores recordings’ metadata in an SQLite database.

---

## Features

### Frontend (React + Tailwind CSS)
- Record browser screen with microphone audio.
- Start / Stop recording controls.
- Live timer (maximum 3 minutes).
- Video preview after recording.
- Download recording as `.webm`.
- Upload recording to backend.
- List and view previously uploaded recordings.

### Backend (Node.js + Express + SQLite)
- Upload recordings using `multer`.
- Store recording metadata in SQLite (`database.db`).
- Stream recordings for playback.
- Robust error handling and logging.

---

## Project Structure

/mern-screen-recorder
|-- /frontend
| |-- src
| |-- index.css
| |-- package.json
|
|-- /backend
| |-- uploads/ # Stored recordings
| |-- database.db # SQLite database
| |-- server.js # Express server
| |-- package.json
|
|-- .gitignore
|-- README.md

yaml
Copy code

---

## Local Setup

### Prerequisites
- Node.js and npm installed.
- Modern browser that supports `MediaRecorder`.

### Backend Setup

```bash
cd backend
npm install
node server.js
Backend runs at: http://localhost:5000

Frontend Setup
bash
Copy code
cd frontend
npm install
npm run dev
Frontend runs at: http://localhost:5173 (Vite default)

API Endpoints
Method	Endpoint	Description
POST	/api/recordings	Upload a recording (multipart/form-data)
GET	/api/recordings	List all uploaded recordings
GET	/api/recordings/:id	Stream a specific recording

Deployment
Frontend (Vercel / Netlify)
Push frontend code to GitHub.

Connect repository to Vercel/Netlify.

Set Build Command: npm run build
Publish Directory: build

Set environment variable REACT_APP_API_URL to your backend URL.

Backend (Render / Heroku)
Push backend code to GitHub.

Connect repository to Render/Heroku.

Set Start Command: node server.js

For production, store uploaded videos in cloud storage (S3 / GCS) instead of local uploads/.

Notes
uploads/ and database.db are ignored in GitHub (.gitignore) to prevent large files from being uploaded.

Make sure to allow microphone permissions in your browser for proper audio recording.

Maximum recording duration is 3 minutes.

License
This project is open-source and free to use.

yaml
Copy code

---

This README:  
- Clearly explains **project features, setup, and API**.  
- Includes instructions for **local dev** and **deployment**.  
- Professional and GitHub-ready for your repository.  

---

If you want, I can also **write a shorter “GitHub-friendly version”** with badges, demo link placeholder, and quick start instructions — perfect for showing off your project in your portfolio.  

Do you want me to do that too?