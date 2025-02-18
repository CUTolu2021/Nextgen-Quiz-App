const route = require('express').Router();
const User = require('../models/user');
const { getUserById, getAllUsers, updateUserById, deleteUserById, getUserStats } = require('../controllers/user');
const { verifyJWTAuthToken, restrictToUser } = require('../middleware/auth');


route.get('/', getAllUsers);
route.get('/:id', verifyJWTAuthToken, getUserById);
route.get('/:userId/stats', verifyJWTAuthToken, getUserStats);
route.patch('/', verifyJWTAuthToken, updateUserById);
route.delete('/:id', verifyJWTAuthToken, restrictToUser, deleteUserById);

module.exports = route; 