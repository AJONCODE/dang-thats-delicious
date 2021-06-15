const mongoose = require('mongoose');
// Because we have already imported the User model in start.js file. We can simply
// reference it of the mongoose. Because mongoose use the concept of the Singleton, which
// allows us to only import our models once and reference it anywhere in our application.
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.registerForm = (req, res) => {
	res.render('register', {
		title: 'Register',
	});
};

exports.validateRegister = (req, res, next) => {
	req.sanitizeBody('name');
	req.checkBody('name', 'You must supply a name!').notEmpty();
	req.checkBody('email', 'That e-mail is not valid!').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_subaddress: false,
	});
	req.checkBody('password', 'Password cannot be blank!').notEmpty();
	req.checkBody('password-confirm', 'Confirmed Password cannot be blank!').notEmpty();
	req.checkBody('password-confirm', 'Oops! Your massword do not match!').equals(req.body.password);

	const errors = req.validationErrors();
	if (errors) {
		req.flash('error', errors.map(err => err.msg));
		res.render('register', {
			title: 'Register',
			body: req.body,
			flashes: req.flash(),
		});
		return; // stops the fn from running
	}

	next(); // there were no errors!
};

exports.register = async (req, res, next) => {
	const user = new User({
		email: req.body.email,
		name: req.body.name,
	});

	// Since the method is within an object, we need to pass the object as second argument
	// User.register is available via passport-local-mongoose plugin in User
	const register = promisify(User.register, User);
	await register(user, req.body.password);

	next(); // pass to authController.login
};

exports.loginForm = (req, res) => {
	res.render('login', {
		title: 'Login',
	});
};

exports.account = (req, res) => {
	res.render('account', {
		title: 'Edit Your Account',
	});
};

exports.updateAccount = async (req, res) => {
	const updates = {
		name: req.body.name,
		email: req.body.email,
	};

	const user = await User.findOneAndUpdate(
		{
			_id: req.user._id,
		},
		{
			$set: updates,
		},
		{
			new: true,
			runValidators: true,
			context: 'query',
		},
	);

	req.flash('success', 'Updated the profile!');
	res.redirect('/account');
};