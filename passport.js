const passport = require('passport');
const User = require('./models/user');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


//func to generate random password          
const generateRandomPassword = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters.charAt(randomIndex);
    }
    
    return password;
};

// Configure Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/redirect",
    scope: ['email', 'profile'],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Check if the user already exists
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (user) {
            console.log('User  found:', user);
            return done(null, user);
        }

        // Create a new user if not found
        user = new User({
            email: profile.emails[0].value,
            username: profile.displayName,
            // You can set a default password or handle it differently if needed
            password: generateRandomPassword(),
        });

        await user.save();
        console.log('New user created:', user);
        return done(null, user);
    } catch (err) {
        console.error('Error during Google authentication:', err);
        return done(err);
    }
}));

// Serialize user to store in session
passport.serializeUser ((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser (async (id, done) => {
    try {
        const user = await User.findById(id);
        if (user) {
            return done(null, user);
        }
        console.log('User not found during deserialization');
        return done(null, false);
    } catch (err) {
        console.error('Error during user deserialization:', err);
        return done(err);
    }
});