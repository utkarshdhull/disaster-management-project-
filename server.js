require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

// ✅ CORS — allow frontend origins
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// 🔥 Create server
const server = http.createServer(app);

// 🔥 Setup socket
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// 🔥 Make io available everywhere
app.set("io", io);

// 🔥 When user connects
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

// Routes
app.use("/api", require("./routes/request"));
app.use("/api/auth", require("./routes/auth"));

// ✅ Serve React frontend in production
const buildPath = path.join(__dirname, "disaster-frontend", "build");
app.use(express.static(buildPath));

// Catch-all: send React's index.html for any non-API route (Express 5 syntax)
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// ✅ MongoDB connection (env variable with local fallback)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/disasterDB";
mongoose.connect(MONGODB_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log("MongoDB Connection Error:", err.message));

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});