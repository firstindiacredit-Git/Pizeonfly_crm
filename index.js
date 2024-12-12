const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
// const multer = require('./utils/multerConfig')
const employeeController = require("./controller/employeeAuth");
const employeeDashboards = require("./controller/employeeDashboards");
const projectRoutes = require("./routes/projectRoutes");
const adminUserRoutes = require("./userRoute/adminUserRoutes");
const taskRoutes = require("./routes/taskRoutes");
const projectMessage = require("./controller/projectMessage");
const taskMessage = require("./controller/taskMessage");
const clientRoutes = require("./controller/clientAuth");
const holidayController = require("./controller/holidayAuth");
const invoiceRoutes = require("./routes/invoiceRoutes");
const urlController = require("./controller/urlShortner");
const qrController = require("./controller/qrRoutes");
const adminDashboard = require("./userController/adminDashboard");
const chatAuth = require("./chatController/chatAuth");
const http = require('http');
const { Server } = require("socket.io");
const { UserStatus } = require("./chatModel/chatModel");


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
    methods: ["GET", "POST"],
    pingTimeout: 60000, // Add ping timeout
    reconnection: true, // Enable reconnection
    reconnectionAttempts: 5 // Set max reconnection attempts
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

  // Handle joining a personal chat room
  socket.on('join_chat', (userId) => {
    socket.join(userId);
    // console.log(`User ${userId} joined their chat room`);
  });

  // Handle private message with acknowledgment
  socket.on('private_message', (data) => {
    const { receiverId, message } = data;
    io.to(receiverId).emit('receive_message', message);
    // Send acknowledgment back to sender
    socket.emit('message_sent', message);
  });

  // Handle typing status
  socket.on('typing', (data) => {
    const { receiverId } = data;
    socket.to(receiverId).emit('user_typing', data);
  });

  socket.on('user_connected', async (userData) => {
    try {
      const socketId = socket.id;
      await UserStatus.findOneAndUpdate(
        { userId: userData.userId },
        {
          userId: userData.userId,
          userType: userData.userType,
          isOnline: true,
          lastSeen: new Date(),
          socketId: socketId
        },
        { upsert: true, new: true }
      );

      // Broadcast the status change to all connected clients
      io.emit('user_status_changed', {
        userId: userData.userId,
        isOnline: true,
        lastSeen: new Date()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      const user = await UserStatus.findOne({ socketId: socket.id });
      if (user) {
        user.isOnline = false;
        user.lastSeen = new Date();
        await user.save();

        // Broadcast the status change
        io.emit('user_status_changed', {
          userId: user.userId,
          isOnline: false,
          lastSeen: user.lastSeen
        });
      }
    } catch (error) {
      console.error('Error updating user status on disconnect:', error);
    }
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
app.use("/api", employeeDashboards);
app.use("/api", projectRoutes);
app.use("/api", projectMessage);
app.use("/api", taskMessage);
app.use("/api", taskRoutes);
app.use("/api", adminUserRoutes);
app.use("/api", holidayController);
app.use("/api", invoiceRoutes);
app.use("/api", qrController);
app.use("/api", adminDashboard);
app.use("/", urlController);
app.use("/api", chatAuth);

app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//Port setup
const port = process.env.PORT || 4000;
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
