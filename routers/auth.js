const route = require('express').Router();
const { signup, login, forgotPassword, resetPassword, getProfile, verifyEmail, verifyOTP } = require('../controllers/auth');
const { verifyJWTAuthToken } = require('../middleware/auth');
const passport = require('passport');
const { allowUnregisteredUsersToTakeQuiz } = require('../controllers/quizAttempts');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication operations
 */

route.post('/signup', signup);

 
route.post('/login', login);

route.post('/forgot-password', forgotPassword);

route.post('/reset-password', resetPassword);
route.get('/allow-unregistered-users-to-take-quiz', allowUnregisteredUsersToTakeQuiz);


route.get('/me', verifyJWTAuthToken, getProfile);

route.get('/verify', verifyEmail);
route.post('/verifyOTP', verifyOTP)

// //Google Auth
// route.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// route.get('/google/redirect', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
//     res.redirect('/');
// });
// route.get('/profile', (req, res) => {
//     res.send(`Hello ${req.user.displayName}`);
//   });

module.exports = route;