const route = require('express').Router();
const User = require('../models/user');
const { getUserById, getAllUsers, updateUserById, deleteUserById } = require('../controllers/user');
const { verifyJWTAuthToken, restrictToUser } = require('../middleware/auth');


//route.get('/', verifyJWTAuthToken, getAllUsers);
route.get('/:id', verifyJWTAuthToken, getUserById);
route.patch('/:id', verifyJWTAuthToken, restrictToUser, updateUserById);
route.delete('/:id', verifyJWTAuthToken, restrictToUser, deleteUserById);

module.exports = route;