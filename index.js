const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./routers/auth");
const userRouter = require("./routers/user");
const quizRouter = require("./routers/quiz");
const infoRouter = require("./routers/info");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const dotenv = require("dotenv");
const morgan = require("morgan");
const { verifyJWTAuthToken, restrictTo } = require('./middleware/auth');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors({
        origin: ["https://nextgen-quiz-app.vercel.app", "http://127.0.0.1:5500"],
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
// Serve the signin.html file when the root route is requested
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/frontend/signin.html');
});

app.get("/authentication.js", (req, res) => {
    res.sendFile(__dirname + '/frontend/authentication.js');
})

app.get("/signin", (req, res) => {
    res.sendFile(__dirname + '/frontend/signin.html');
});

// Serve other HTML files when other routes are requested
app.get("/signup", (req, res) => {
    res.sendFile(__dirname + '/frontend/signup.html');
});

app.get("/creator-dashboard", (req, res) => {
    res.sendFile(__dirname + '/frontend/dashboard.html');
});

app.get("/participant-dashboard", (req, res) => {
    res.sendFile(__dirname + '/frontend/participantdashboard.html');
});

app.get("/forgotpassword", (req, res) => {
    res.sendFile(__dirname + '/frontend/forgotpassword.html');
});

app.get("/codeVerification", (req, res) => {
    res.sendFile(__dirname + '/frontend/codeVerification.html');
})

app.get("/coming-soon-signin", (req, res) => {
    res.sendFile(__dirname + '/frontend/coming-soon-signin.html');
})

app.get("/coming-soon", (req, res) => {
    res.sendFile(__dirname + '/frontend/coming-soon.html');
})

app.get("/verify-email", (req, res) => {
    res.sendFile(__dirname + '/frontend/verify-email.html');
})

app.get("/chooseYourRole", (req, res) => {
    res.sendFile(__dirname + '/frontend/chooseYourRole.html');
})

app.get("/newpasswordinput", (req, res) => {
    res.sendFile(__dirname + '/frontend/newpasswordinput.html');
})

app.get("/password-confirmation", (req, res) => {
    res.sendFile(__dirname + '/frontend/passwordResetConfirm.html');
})

app.get("/preview", (req, res) => {
    res.sendFile(__dirname + '/frontend/preview.html');
})

app.get("/startquiz", (req, res) => {
    res.sendFile(__dirname + '/frontend/startquiz.html');
})

app.get("/creator-profile", (req, res) => {
    res.sendFile(__dirname + '/frontend/creatorprofilepage.html');
})

app.get("/participant-profile", (req, res) => {
    res.sendFile(__dirname + '/frontend/participantprofilepage.html');
})

app.get("/create-quiz", (req, res) => {
    res.sendFile(__dirname + '/frontend/createquiz.html');
})

app.get("/saved-drafts", (req, res) => {
    res.sendFile(__dirname + '/frontend/savedraft.html');
})

app.get("/settings", (req, res) => {
    res.sendFile(__dirname + '/frontend/settings.html');
})

app.get("/invite-users", (req, res) => {
    res.sendFile(__dirname + '/frontend/inviteusers.html');
})

app.get("/quiz-published", (req, res) => {
    res.sendFile(__dirname + '/frontend/quizpublished.html');
})

app.get("/quiz-info", (req, res) => {
    res.sendFile(__dirname + '/frontend/quizinfo.html');
})

app.get("/all-quizzes", (req, res) => {
    res.sendFile(__dirname + '/frontend/allquizzes.html');
})

app.get("/upload-quiz", (req, res) => {
    res.sendFile(__dirname + '/frontend/uploadcsvfile.html');
})

app.get("/quiz-leaderboard", (req, res) => {
    res.sendFile(__dirname + '/frontend/quizleaderboard.html');
})

app.get("/quizleaderboard", (req, res) => {
    res.sendFile(__dirname + '/frontend/quizleaderboard1.html');
})



app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/quizzes", verifyJWTAuthToken, quizRouter);
app.use("/info", verifyJWTAuthToken, infoRouter);

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
