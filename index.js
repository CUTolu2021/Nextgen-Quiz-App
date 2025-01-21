const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routers/auth");
const userRouter = require("./routers/user");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const dotenv = require("dotenv");
const morgan = require("morgan");
const session = require('express-session');
const passport_setup = require('./passport');
const passport = require('passport');

dotenv.config();

const app = express();

// Swagger Setup
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "Authentication for Quiz API",
            description: "Authentication API Information",
            contact: {
                name: "Amazing Developer",
            },
        },
            servers:[
                {url:'http://localhost:8000/api'}, //you can change you server url
            ],
        },
    apis: ["./routers/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Passport Middleware for google auth
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

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
    res.send("Welcome, to access the swagger docmentation go to /api-docs. I you are running this locally, you can access the swagger documentation at http://localhost:8000/api-docs");
});
app.use("/auth", authRouter);
app.use("/user", userRouter);

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
// get route to fetch all quizzes
const express = require("express");
const { getQuizzes, createQuiz } = require("./controllers/quiz");

const router = express.Router();

router.get("/", getQuizzes);
router.post("/", createQuiz);

module.exports = router;