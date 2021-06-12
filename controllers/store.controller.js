const mongoose = require('mongoose');
// Because we have already imported the Store model once in our start.js file. We can simply
// reference it of the mongoose. Because mongoose use the concept of the Singleton, which
// allows us to only import our models once and reference it anywhere in our application.
const Store = mongoose.model('Store');

// exports.homePage = (req, res) => {
// 	res.render('hello', {
// 		title: 'I Love Food! ',
// 		name: 'AJ',
// 		dog: req.query.dog || 'MAX',
// 	});
// };

exports.addStore = (req, res) => {
  res.render('editStore', {
		title: 'Add Store',
	});
};

exports.createStore = async (req, res) => {
	let store = new Store(req.body);
	store = await store.save();

	// We flash it and then we render it out, i.e., these flashes only get sent on the next
	// request, unless we explicitly passed them. Flashes only work if we use sessions, because
	// the whole idea of sessions is that we can save data (that's why we can pass data from one
	// request to another)
	req.flash('success', `Successfully created <strong>${store.name}</strong>. Care to leave a review?`)

	res.redirect(`/store/${store.slug}`);
};

exports.getStores = async (req, res) => {
	const stores = await Store.find();

	res.render('stores', {
		title: 'Stores',
		stores,
	})
};

exports.editStore = async (req, res) => {
	const store = await Store.findOne({ _id: req.params.id });

	// TODO: Confirm they are the owner of the store

	res.render('editStore', {
		title: `Edit ${store.name}`,
		store,
	});
};

exports.updateStore = async (req, res) => {
	let store = await Store.findOneAndUpdate(
		{ _id: req.params.id },
		req.body,
		{
			new: true,
			runValidators: true,
		},
	).exec();

	req.flash(
		'success',
		`Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store -></a>`
	);

	res.redirect(`/stores/${store._id}/edit`);
};