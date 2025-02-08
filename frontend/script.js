const startBtn = document.getElementById("start-btn");
const finishBtn = document.getElementById("finish-btn");
const questionContainer = document.getElementById("question-container");
const progressCount = document.getElementById("progress-count");
const timerDisplay = document.getElementById("time");
const resultDisplay = document.getElementById("result");

let questions;
let timeLeft;


async function getQuestion() {
    try {
        const response = await fetch('http://localhost:8000/quizzes/679235daf0b4cef3b769c520/questions');
        const data = await response.json();
        console.log("question retrieved", data);
        questions = data.data;
    } catch (err) {
        console.error(err);
    }
}

async function getQuiz() {
    try {
        const response = await fetch('http://localhost:8000/quizzes/679235daf0b4cef3b769c520');
        const data = await response.json();
        console.log('quiz information', data.quiz.settings);
        timeLeft = data.quiz.settings.time_limit;
        timerDisplay.innerText = timeLeft;
    } catch (err) {
        console.error(err);
    }
}

// let questions = [
//     { question: "What is the capital of France?", options: ["Paris", "Berlin", "Madrid", "Rome"], answer: "Paris" },
//     { question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars" },
//     { question: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], answer: "Pacific" },
//     { question: "Who wrote 'Hamlet'?", options: ["Shakespeare", "Hemingway", "Austen", "Dickens"], answer: "Shakespeare" },
//     { question: "Which gas do plants use for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: "Carbon Dioxide" },
//     { question: "How many continents are there?", options: ["5", "6", "7", "8"], answer: "7" },
//     { question: "What is the boiling point of water?", options: ["90°C", "100°C", "110°C", "120°C"], answer: "100°C" },
//     { question: "Which country is known for the Great Wall?", options: ["India", "China", "Japan", "Russia"], answer: "China" }
// ];

async function init() {
    await getQuestion();
    await getQuiz();
    console.log("questions", questions);
    console.log("timeLeft", timeLeft);
    let currentQuestionIndex = 0;
let score = 0;
let timer;

// Set the total number of questions
const totalQuestions = document.getElementById("total-questions");
totalQuestions.innerHTML = questions.length;

// Start Quiz
startBtn.addEventListener("click", startQuiz);
finishBtn.addEventListener("click", finishQuiz);

async function startQuiz() {
    await fetch ('http://localhost:8000/quizzes/679235daf0b4cef3b769c520/start_quiz', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        console.log("Quiz started", data);
    })
    .catch(err => {
        console.error(err);
    });
    startBtn.style.display = "none";
    displayQuestion();
    startTimer();
}

// Display Questions
function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        finishQuiz();
        return;
    }

    let q = questions[currentQuestionIndex];
    console.log("q", q);
    questionContainer.innerHTML = `<h2>${q.question}</h2>`;
    
    q.options.forEach(option => {
        let button = document.createElement("button");
        button.innerText = option;
        button.classList.add("option-btn");
        button.addEventListener("click", () => selectAnswer(option, q.correctAnswers));
        questionContainer.appendChild(button);
    });

    // Update the progress indicator
    progressCount.innerText = `${currentQuestionIndex + 1}`;

    // Show the finish button only on the last question
    if (currentQuestionIndex === questions.length - 1) {
        finishBtn.style.display = "block";
    } else {
        finishBtn.style.display = "none";
    }
}

// Answer Selection
async function selectAnswer(selected, correct) {
    await fetch('http://localhost:8000/quizzes/679235daf0b4cef3b769c520/submit_answer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            questionId: questions[currentQuestionIndex]._id,
            selectedAnswer: selected,
            correctAnswer: correct
        })
    })
    if (selected === correct) {
        score++;
    }
    currentQuestionIndex++;
    displayQuestion();
}

// Timer
function startTimer() {
    timer = setInterval(() => {
        timeLeft -= 1/60;
        const minutes = Math.floor(timeLeft);
        const seconds = Math.floor((timeLeft - minutes) * 60);
        timerDisplay.innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            finishQuiz();
        }
    }, 1000);
}

// Finish Quiz
async function finishQuiz() {
    clearInterval(timer);
    questionContainer.innerHTML = "";
    resultDisplay.classList.remove("hidden");
    resultDisplay.innerHTML = `<h2>Quiz Finished!</h2><p>Your Score: ${score} / ${questions.length}</p>`;
    finishBtn.style.display = "none"; // Hide finish button after quiz ends
    await fetch ('http://localhost:8000/quizzes/679235daf0b4cef3b769c520/end_quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            score,
            endTime: new Date().toISOString(),
            timeUsed: timeLeft
        })
    })
}



}

init();

