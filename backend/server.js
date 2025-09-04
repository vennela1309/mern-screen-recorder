const express = require("express");
const multer = require("multer");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Setup database
const db = new sqlite3.Database("database.db");
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT,
      filepath TEXT,
      filesize INTEGER,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Upload route
app.post("/api/recordings", upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const filename = req.file.originalname;
  const filepath = "uploads/" + req.file.filename; // store relative path
  const filesize = req.file.size;

  db.run(
    `INSERT INTO recordings (filename, filepath, filesize) VALUES (?, ?, ?)`,
    [req.file.filename, filepath, filesize],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: "Recording uploaded successfully",
        recording: { id: this.lastID, filename, filepath, filesize },
      });
    }
  );
});

// List recordings
app.get("/api/recordings", (req, res) => {
  db.all(`SELECT * FROM recordings ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Stream recording
app.get("/api/recordings/:id", (req, res) => {
  const id = req.params.id;
  db.get(`SELECT * FROM recordings WHERE id = ?`, [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Recording not found" });
    res.sendFile(path.join(__dirname, row.filepath));
  });
});

app.listen(PORT, () =>
  console.log(` Backend running at http://localhost:${PORT}`)
);
