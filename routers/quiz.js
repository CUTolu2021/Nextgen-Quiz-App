const router = require('express').Router();
const multer = require('multer');
const { createQuiz,updateQuiz, uploadCSV, updateQuestionImage,uploadQuestions, getQuizzes, getQuestionByQuizId, addQuestions, deleteQuizById, getQuizById, addQuestionsByID} = require('../controllers/quiz');
const { restrictTo } = require('../middleware/auth');
const { startQuiz, endQuiz, submitAnswer } = require('../controllers/quizAttempts');

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Specify the upload directory
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Append timestamp to filename
    },
  });
  
const upload = multer({ storage: storage });

router.post('/',restrictTo('Creator'),createQuiz);
router.delete('/:quizId',restrictTo('Creator'),deleteQuizById);
router.post('/add-questions',restrictTo('Creator'),addQuestions);
router.post('/:quizId/add-questions',restrictTo('Creator'),addQuestionsByID);

router.get('/', getQuizzes)
router.post('/upload-csv',restrictTo('Creator'), upload.single('file'), uploadCSV);
router.put('/:quizId/image/:questionId',restrictTo('Creator'),upload.single('image'), updateQuestionImage);
router.patch('/:quizId/upload-questions',restrictTo('Creator'), upload.single('file'), uploadQuestions);
router.get('/:quizId', getQuizById);
router.get('/:quizId/questions', getQuestionByQuizId);
router.patch('/:quizId',restrictTo('Creator'),updateQuiz);

router.get('/:quizId/start_quiz', startQuiz);
router.post('/:quizId/end_quiz', endQuiz);
router.post('/:quizId/submit_answer', submitAnswer);


module.exports = router;