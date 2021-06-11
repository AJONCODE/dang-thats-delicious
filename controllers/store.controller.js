const mongoose = require('mongoose');
// Because we have already imported the Store model once in our start.js file. We can simply
// reference it of the mongoose. Because mongoose use the concept of the Singleton, which
// allows us to only import our models once and reference it anywhere in our application.
const Store = mongoose.model('Store');

exports.homePage = (req, res) => {
	res.render('hello', {
		title: 'I Love Food! ',
		name: 'AJ',
		dog: req.query.dog || 'MAX',
	});
};

exports.addStore = (req, res) => {
  res.render('editStore', {
		title: 'Add Store',
	});
};

exports.createStore = async (req, res) => {
	const store = new Store(req.body);
	await store.save();

	res.redirect('/');
};