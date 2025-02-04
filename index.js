const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routers/auth");
const userRouter = require("./routers/user");
const quizRouter = require("./routers/quiz");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { verifyJWTAuthToken, restrictTo } = require('./middleware/auth');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors({
        origin: "http://127.0.0.1:5500",
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true
    }));

// Middleware
app.use(express.json());
app.use(morgan("dev")); // Logging middleware

// Connect to MongoDB
const connectWithRetry = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            minPoolSize: 10,
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB, retrying in 5 seconds...", err);
        setTimeout(connectWithRetry, 5000); // Retry after 5 seconds
    }
};

connectWithRetry();

// Routes
app.get("/", (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.send("Welcome, to access the swagger docmentation go to /api-docs. I you are running this locally, you can access the swagger documentation at http://localhost:8000/api-docs");
});
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/quizzes", verifyJWTAuthToken, quizRouter);


// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("An Error Occurred: ", err.message);
    res.status(err.status || 500).json({ message: err.message });
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handling Unhandled Rejections
process.on("unhandledRejection", (err) => {
    console.error("An Error Occurred: ", err.message);
    server.close(() => {
        process.exit(1);
    });
});