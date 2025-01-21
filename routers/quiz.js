const router = require('express').Router();
const multer = require('multer');
const { createQuiz, uploadCSV, updateQuestionImage} = require('../controllers/quiz');
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
router.post('/upload-csv',restrictTo('Creator'), upload.single('file'), uploadCSV);
router.put('/:quizId/image/:questionId',restrictTo('Creator'),upload.single('image'), updateQuestionImage);

module.exports = router;