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
	}
}, {
	// by default virtual fields do not go either into object or JSON unless we explicitly ask it to
	toJSON: { virtuals: true },
	toObject: { virtuals: true },
});

// Define our indexes
storeSchema.index({
	name: 'text',
	description: 'text',
});

storeSchema.index({
	location: '2dsphere',
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

function autopopulate(next) {
  this.populate('reviews');

  next();
}

/**
 * Any time find or findOne (including virtual populate foreign field) query is hit,
 * autopopulate function will execute automatically
 */
 storeSchema.pre('find', autopopulate);
 storeSchema.pre('findOne', autopopulate);

// Do not use arrow function, because we'll be using this
storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind: '$tags' },
		{ $group: { _id: '$tags', count: { $sum: 1 } } },
		{ $sort: { count: -1 } }, // descending order
	]);
};

/**
 * (Do not use arrow function, because we'll be using this)
 * (We can't actually use our virtual populate (virtual populate of reviews) here, because
 * virtual populate a mongoose specific thing and aggregate is not mongoose specific)
 */
storeSchema.statics.getTopStores = function() {
	return this.aggregate([
		// lookup stores and populate their reviews
		{
			$lookup: {
				from: 'reviews', // mongodb model name
				localField: '_id',
				foreignField: 'store',
				as: 'reviews',
			},
		},
		// filter for only items that have 2 or more reviews
		// (match only if element exists in reviews array at index 1)
		{
			$match: {
				'reviews.1': {
					$exists: true,
				},
			},
		},
		// add the average reviews field
		{
			$project: {
				photo: '$$ROOT.photo', // root level field 'photo'
				name: '$$ROOT.name', // root level field 'name'
				slug: '$$ROOT.slug', // root level field 'slug'
				reviews: '$$ROOT.reviews', // root level field 'reviews'
				averageRating: {
					$avg: '$reviews.rating', // field 'rating' inside 'reviews' object (field)
				},
			},
		},
		// sort it by our new field, highest reviews first
		{
			$sort: {
				averageRating: -1, // descending order (i.e., -1)
			},
		},
		// limit to at most 10
		{
			$limit: 10,
		},
	]);
};

/**
 * Virtual Populate
 * field (localField) on our model needs to match-up with field (foreignField) on foreign model
 *
 * find reviews where the stores _id === reviews store property
 *
 * by default virtual fields do not go either into object or JSON unless we explicitly ask it to
 */
storeSchema.virtual('reviews', {
	ref: 'Review', // what model to link?
	localField: '_id', // which field on the store?
	foreignField: 'store', // which field on the review?
});

module.exports = mongoose.model('Store', storeSchema);