import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [recording, setRecording] = useState(false);
  const [videoURL, setVideoURL] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch uploaded recordings from backend
  const fetchRecordings = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/recordings`);
      setRecordings(res.data);
    } catch (err) {
      console.error("Error fetching recordings:", err);
    }
  };

  useEffect(() => {
    fetchRecordings();
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      // Get screen stream
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      // Get microphone stream
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // Combine tracks
      const combinedTracks = [
        ...screenStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ];
      const combinedStream = new MediaStream(combinedTracks);

      mediaRecorderRef.current = new MediaRecorder(combinedStream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoURL(url);

        // Stop all tracks
        combinedStream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);

      // Timer
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev >= 180) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Failed to start recording. Make sure you allowed microphone access.");
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
    clearInterval(timerRef.current);
  };

  // Download recording
  const downloadRecording = () => {
    if (!videoURL) return;
    const a = document.createElement("a");
    a.href = videoURL;
    a.download = "recording.webm";
    a.click();
  };

  // Upload recording to backend
  const uploadRecording = async () => {
    if (!videoURL) return;
    try {
      const response = await fetch(videoURL);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("video", blob, "recording.webm");

      await axios.post(`${API_URL}/api/recordings`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Uploaded successfully!");
      fetchRecordings();
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed, check backend logs.");
    }
  };

  return (
    <div className="app-container">
      <h1 className="title">🎥 Screen Recorder</h1>

      {/* Controls */}
      <div className="controls">
        {!recording ? (
          <button onClick={startRecording} className="button start-button">
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} className="button stop-button">
            Stop Recording
          </button>
        )}
        <span className="timer">⏱ {timer}s</span>
      </div>

      {/* Preview */}
      {videoURL && (
        <div className="preview">
          <video src={videoURL} controls className="video-player" />
          <div className="preview-buttons">
            <button onClick={downloadRecording} className="button download-button">
              Download
            </button>
            <button onClick={uploadRecording} className="button upload-button">
              Upload
            </button>
          </div>
        </div>
      )}

      {/* Uploaded Recordings */}
      <h2 className="subtitle">📂 Uploaded Recordings</h2>
      <ul className="recordings-list">
        {recordings.map((rec) => (
          <li key={rec.id} className="recording-item">
            <span>{rec.filename}</span>
            <a
              href={`${API_URL}/${rec.filepath}`}
              target="_blank"
              rel="noreferrer"
              className="recording-link"
            >
              View
            </a>
          </li>
        ))}
        {recordings.length === 0 && (
          <p className="no-recordings">No recordings uploaded yet.</p>
        )}
      </ul>
    </div>
  );
}

export default App;
