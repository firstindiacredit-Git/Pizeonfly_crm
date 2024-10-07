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

const cors = require("cors");
const path = require("path");

dotenv.config();

//Middleware setup
const allowedOrigins = ['https://crm.pizeonfly.com', 'http://localhost:5173'];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,POST,PUT,DELETE,PATCH', 
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static("./uploads"));

app.use(express.static(path.join(__dirname, 'dist')));

// MongoDB setup
const url = process.env.MONGODB_URI;
// console.log(url);
mongoose.connect(url);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const connection = mongoose.connection;

connection.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);
connection.once("open", () => {
  console.log("MongoDB database connected");
});

//Route setup
app.use("/api", clientRoutes);
app.use("/api", employeeController);
app.use("/api", projectRoutes);
app.use("/api", projectMessage);
app.use("/api", taskMessage);
app.use("/api", taskRoutes);
app.use("/api", adminUserRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

//Port setup
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
