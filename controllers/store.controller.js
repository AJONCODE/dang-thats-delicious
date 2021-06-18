const mongoose = require('mongoose');
// Because we have already imported the Store model in start.js file. We can simply
// reference it of the mongoose. Because mongoose use the concept of the Singleton, which
// allows us to only import our models once and reference it anywhere in our application.
const Store = mongoose.model('Store');
const multer = require('multer');
const jimp = require('jimp');
const uuid = require('uuid');

const multerOptions = {
	// read the image into storage (as we'll be resizing the image and storing that in DB)
	storage: multer.memoryStorage(),
	fileFilter(req, file, next) {
		// checking file type with extension can lead to virus file upload, that's why we check image via mimetype
		const isPhoto = file.mimetype.startsWith('image/');
		if (isPhoto) {
			next(null, true);
		} else {
			next({ message: 'That filetype isn\'t allowed!'}, false);
		}
	}
};

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
	// check if there is no new file to resize
	if (!req.file) {
		next(); // skip to the next middleware
		return;
	}

	const extension = req.file.mimetype.split('/')[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	// now we resize
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);

	// once we have written the photo in filesystem, keep going!
	next();
};

exports.addStore = (req, res) => {
  res.render('editStore', {
		title: 'Add Store',
	});
};

exports.createStore = async (req, res) => {
	let store = new Store(req.body);
	store.author = req.user._id;
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

const confirmOwner = (store, user) => {
	if (!store.author.equals(user._id)) {
		throw Error('You must own a store in order to edit it!');
	}
};

exports.editStore = async (req, res) => {
	const store = await Store.findOne({ _id: req.params.id });

	confirmOwner(store, req.user);

	res.render('editStore', {
		title: `Edit ${store.name}`,
		store,
	});
};

exports.updateStore = async (req, res) => {
	// set the location data to be a point
	req.body.location.type = 'Point';

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

exports.getStoreBySlug = async (req, res, next) => {
	const store = await Store.findOne({ slug: req.params.slug }).populate('author');
	console.info('store', store);

	if(!store) return next(); // Now app.use(errorHandlers.notFound) in app.js will kick in

	res.render('store', {
		title: store.name,
		store,
	});
};

exports.getStoresByTag = async (req, res) => {
	const { tag } = req.params;
	const tagQuery = tag || { $exists: true }

	const tagsPromise = Store.getTagsList();
	const storesPromise = Store.find({ tags: tagQuery });

	const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

	res.render(
		'tags',
		{
			title: 'Tags',
			tags,
			tag,
			stores,
		}
	);
};

exports.searchStores = async (req, res) => {
	/**
	 * $text: performs a text search on the content of the fields indexed with a text index
	 * $meta: projection operator returns for each matching document the metadata
	 * textScore: returns the score associated with the corresponding $text query for each matching document
	 */

	const stores = await Store
	// find stores that match
	.find({
		$text: {
			$search: req.query.q,
		}
	}, {
		score: {
			$meta: 'textScore',
		}
	})
	// sort them
	.sort({
		score: {
			$meta: 'textScore', // desc sorting order
		}
	})
	// limit to only 5 results
	.limit(5);

	res.json(stores);
};