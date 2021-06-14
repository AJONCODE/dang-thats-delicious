const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());

/**
 * passport attaches the profile information to req.user via serializeUser and deserializeUser
 *
 * serializeUser: passport takes that user id and stores it internally on req.session.passport
 * which is passport’s internal mechanism to keep track of things.
 * deserializeUser: makes a request to our DB to find the full profile information for the user
 * via id (that serializeUser stored). This is where the user profile is attached to the request
 * handler at req.user.
 */
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());