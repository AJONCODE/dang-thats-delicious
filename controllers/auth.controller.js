const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in!',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out!');

  res.redirect('/');
};

exports.isLoggedIn = (req, res, next) => {
  // check if the user is authenticated (via passport built-in method isAuthenticated)
  if (req.isAuthenticated()) {
    next(); // carry on! They are logged in!
    return;
  }

  req.flash('error', 'Oops you must be logged in to do that!');
  res.redirect('/login');
};

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    req.flash('error', 'No account with that email exists.');
    return res.redirect('/login');
  }

  // Set reset tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + (60 * 60 * 1000); // 1 hour from now

  await user.save();

  // TODO: Send them e-mail with the token instead of resetURL
  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `You have been emailed a password reset link. ${resetURL}`);

  // Redirect to login page
  res.redirect('/login');
};

exports.resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/login');
  }

  // If user exists
  res.render('resetPassword', {
    title: 'Reset Your Password',
  })
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    next(); // keep it going!
    return;
  }

  req.flash('error', 'Passwords do not match!');
  res.redirect('back');
};

exports.updatePassword = async(req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/login');
  }

  // user.setPassword is available via passport-local-mongoose plugin in User
  // Since the method is within an object, we need to pass the object as second argument
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();

  // req.login is available via passport-local-mongoose plugin in User
  await req.login(updatedUser);

  req.flash('success', 'Your Password has been reset! You are now logged in!');

  res.redirect('/');
};