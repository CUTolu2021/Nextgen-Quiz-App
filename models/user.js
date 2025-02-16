const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    username: {
        type: String,
        unique: [true, 'Username already taken'],
        required: [true, 'Username is required'],
        trim: true, 
        minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
        type: String,
        unique: [true, 'Email already taken'],
        required: [true, 'Email is required'],
        lowercase: true, 
        trim: true, 
        validate: {
            validator: (v) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v),
            message: 'Invalid email format',
        },
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters long'], // Increased minimum length for better security
        required: true,
    },
    role: {
        type: String,
        enum: ['Creator', 'Participant'],
        default: 'Participant',
    },
    active_status: {
        type: Boolean,
        default: true,
    },
    emailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        default: null,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

module.exports = model('User', userSchema)