const {Schema, model} = require('mongoose');

const leaderboardsSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true}, 
    score: {type: Number, required: true},
    //quizId: {type: Schema.Types.ObjectId, ref: 'Quiz', required: true},
    rank: {type: Number, default:0, },
    createdAt: {type: Date, default: Date.now},
});

module.exports = model('Leaderboard', leaderboardsSchema);