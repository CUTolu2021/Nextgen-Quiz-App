const router = require('express').Router();
const multer = require('multer');
const { createQuiz,updateQuiz, uploadCSV, updateQuestionImage,uploadQuestions, getQuizzes, getQuestionByQuizId, addQuestions, deleteQuizById, getQuizById, addQuestionsByID, getQuizzesByUserId, updateQuestions} = require('../controllers/quiz');
const { restrictTo } = require('../middleware/auth');
const { startQuiz, endQuiz, submitAnswer, getQuizResults } = require('../controllers/quizAttempts');

// Multer setup
const storage = multer.memoryStorage({
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
router.post('/:quizId/add-questions',restrictTo('Creator'),addQuestionsByID);
router.put('/:quizId', restrictTo('Creator'),updateQuiz)

router.get('/', getQuizzes)
router.put('/:quizId/questions',restrictTo('Creator'),updateQuestions);
router.put('/:quizId/image/:questionId',restrictTo('Creator'),upload.single('image'), updateQuestionImage);
router.patch('/:quizId/upload-questions',restrictTo('Creator'), upload.single('file'), uploadQuestions);
router.get('/:quizId', getQuizById);
router.get('/:quizId/questions', getQuestionByQuizId);

router.get('/:quizId/start_quiz', startQuiz);
router.post('/:quizId/end_quiz', endQuiz);
router.post('/:quizId/submit_answer', submitAnswer);
router.get('/:quizId/results', getQuizResults);



module.exports = router;