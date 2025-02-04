const router = require('express').Router();
const multer = require('multer');
const { createQuiz, uploadCSV, updateQuestionImage,uploadQuestions, getQuizzes, getQuestionByQuizId, addQuestions, deleteQuizById, getQuizById} = require('../controllers/quiz');
const { restrictTo } = require('../middleware/auth');

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
router.get('/', getQuizzes)
router.post('/upload-csv',restrictTo('Creator'), upload.single('file'), uploadCSV);
router.put('/:quizId/image/:questionId',restrictTo('Creator'),upload.single('image'), updateQuestionImage);
router.patch('/:quizId/upload-questions',restrictTo('Creator'), upload.single('file'), uploadQuestions);
router.get('/questions/:quizId', getQuestionByQuizId);

// GET single quiz by ID
router.get('quizzes/:id', getQuizById);


module.exports = router;