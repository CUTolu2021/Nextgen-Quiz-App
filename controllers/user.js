const User = require('../models/user');
const { hashPassword } = require('./auth');

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find( {}, { password: 0 , __v: 0, createdAt: 0, updatedAt: 0 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get All users",
            error: error.message 
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id, { password: 0 , __v: 0, createdAt: 0, updatedAt: 0 });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            message: "Failed to get user",
            error: error.message 
        });
    }
};  

const updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, req.body, { new: true }, { password: 0 , __v: 0, createdAt: 0, updatedAt: 0 });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if(req.body.password){
            user.password = hashPassword(req.body.password);
            await user.save();
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ 
            message: "Failed to update user",
            error: error.message });
    }
};

const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        user.active_status = false;
        await user.save();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: "Failed to delete user",
            error: error.message });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
};

