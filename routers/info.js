const express = require('express');
const router = express.Router();
const { getLeaderboardByQuizId, getQuizAttemptByUserId, getQuizAttemptByQuizId, getLeaderboard, getQuizResults, getLeaderboardByUserId, deleteUnregisteredUsersQuizAttempts } = require('../controllers/quizAttempts');




router.get('/:quizId/leaderboard', getLeaderboardByQuizId);
router.get('/quizattempts', getQuizAttemptByUserId);
router.get('/:quizId/quizattempts', getQuizAttemptByQuizId);
router.get('/:quizId/results', getQuizResults);
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/:userId', getLeaderboardByUserId);
router.delete('/delete-unregistered-users-quiz-attempts', deleteUnregisteredUsersQuizAttempts);

module.exports = router;