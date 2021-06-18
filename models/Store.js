const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
		required: 'Please enter a store name',
	},
	slug: String,
	description: {
		type: String,
		trim: true,
	},
	photo: String,
	tags: [String],
	created: {
		type: Date,
		default: Date.now,
	},
	location: {
		type: {
			type: String,
			default: 'Point',
		},
		coordinates: [
			{
				type: Number,
				required: 'You must supply coordinates!',
			},
		],
		address: {
			type: String,
			required: 'You must supply an address!',
		},
	},
	author: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: 'You must supply an author!',
	},
});

// Define our indexes
storeSchema.index({
	name: 'text',
	description: 'text',
});

// Do not use arrow function, because we'll be using this
storeSchema.pre('save', async function(next) {
	if (!this.isModified('name')) {
		next(); // skip it
		return; // stop this function from running
	}

	this.slug = slug(this.name);

	// If slug already exists, then add order after it, i.e., bar, bar-2, and so on
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
	const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
	if (storesWithSlug.length) {
		this.slug = `${this.slug}-${storesWithSlug.length + 1}`
	}

	next();
});

// Do not use arrow function, because we'll be using this
storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind: '$tags' },
		{ $group: { _id: '$tags', count: { $sum: 1 } } },
		{ $sort: { count: -1 } }, // descending order
	]);
}

module.exports = mongoose.model('Store', storeSchema);