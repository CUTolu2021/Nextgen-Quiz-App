const {Schema, model} = require('mongoose');

const leaderboardsSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: 'User', required: true}, 
    score: {type: Number, required: true},
    quizId: {type: Schema.Types.ObjectId, ref: 'Quiz', required: true},
    rank: {type: Number, required: true, min: 1, max: 100, unique: true},
},{
    timestamps: true
});

module.exports = model('Leaderboard', leaderboardsSchema);