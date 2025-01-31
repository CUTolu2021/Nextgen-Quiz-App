const route = require('express').Router();
const { signup, login, forgotPassword, resetPassword, getProfile, verifyEmail, verifyOTP } = require('../controllers/auth');
const { verifyJWTAuthToken } = require('../middleware/auth');
const passport = require('passport');

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication operations
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     tags: [Auth]
 *     summary: Create a new user
 *     requestBody:
 *       description: User details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Creator, Participant]
 *                 default: Participant
 *             example:
 *               username: "johndoe"
 *               email: "GzBt6@example.com"
 *               password: "password123"
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "message": "User successfully created",
 *                 "token": "your-auth-token",
 *                 "user": {
 *                   "username": "JohnDoe",
 *                   "email": "GzBt6@example.com",
 *                   "role": "Participant"
 *                 }
 *               }
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.post('/signup', signup);

/**
 * @swagger
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               username: "johndoe"
 *               password: "password123"
 *     responses:
 *       200:
 *         description: Auth successful
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "message": "Authentication successful",
 *                 "token": "your-auth-token"
 *               }
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Internal server error
 */
route.post('/login', login);

/**
 * @swagger
 * /forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             example:
 *               email: "gB2oD@example.com"
 *     responses:
 *       200:
 *         description: Token sent to your email
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
route.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset user password
 *     requestBody:
 *       description: Password reset details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               token: "your-reset-token"
 *               password: "new-password"
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
route.post('/reset-password', resetPassword);

/**
 * @swagger
 * /me:
 *   get:
 *     tags: [Auth]
 *     summary: Get the profile of the logged-in user
 *     security:
 *       - bearerAuth: []  # Assuming you have set up bearer authentication
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             example:
 *               {
 *                 "user": {
 *                   "username": "JohnDoe",
 *                   "email": "gB2oD@example.com",
 *                   "role": "Creator"
 *                 }
 *               }
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
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