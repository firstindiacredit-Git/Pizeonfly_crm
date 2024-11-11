const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
// const multer = require('./utils/multerConfig')
const employeeController = require("./controller/employeeAuth");
const projectRoutes = require("./routes/projectRoutes");
const adminUserRoutes = require("./userRoute/adminUserRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectMessage = require("./controller/projectMessage");
const taskMessage = require("./controller/taskMessage");
const clientRoutes = require("./controller/clientAuth");
const holidayController = require("./controller/holidayAuth");
const urlController = require("./controller/urlShortner");
const qrController = require("./controller/qrRoutes");
const http = require('http');
const { Server } = require("socket.io");

const cors = require("cors");
const path = require("path");

dotenv.config();

//Middleware setup
// const allowedOrigins = ['https://crm.pizeonfly.com', 'http://localhost:5173'];
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: 'GET,POST,PUT,DELETE,PATCH', 
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };
app.use(cors());
app.use(express.json({ limit: '10mb' })); // For JSON payloads
app.use(express.urlencoded({ limit: '10mb', extended: true })); // For URL-encoded payloads
app.use(express.static("./uploads"));

app.use(express.static(path.join(__dirname, 'dist')));

// MongoDB setup
const url = process.env.MONGODB_URI;
mongoose.connect(url);

const connection = mongoose.connection;
connection.on('error', console.error.bind(console, 'MongoDB connection error:'));
connection.once('open', () => {
  console.log('MongoDB database connected');
});

// Create HTTP server
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  // console.log('A user connected');

  // Handle joining a project room
  socket.on('join project', (projectId) => {
    socket.join(projectId);
  });

  // Handle joining a task room
  socket.on('join task', (taskId) => {
    socket.join(taskId);
  });

  // Handle new project message
  socket.on('new message', (data) => {
    io.to(data.projectId).emit('new message', data);
  });

  // Handle new task message
  socket.on('new task message', (data) => {
    io.to(data.taskId).emit('new task message', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // console.log('User disconnected');
  });
});

// Make io accessible to our router
app.set('io', io);

app.get("/hello", (req, res) => {
  res.send("Hello World");
});

//Route setup
app.use("/api", clientRoutes);
app.use("/api", employeeController);
app.use("/api", projectRoutes);
app.use("/api", projectMessage);
app.use("/api", taskMessage);
app.use("/api", taskRoutes);
app.use("/api", adminUserRoutes);
app.use("/api", holidayController);
app.use("/api", qrController);
app.use("/", urlController);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//Port setup
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

