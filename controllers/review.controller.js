const mongoose = require('mongoose');

const Review = mongoose.model('Review');

exports.addReview = async (req, res) => {
  const author = req.user._id;
  const store = req.params.id;

  const newReview = new Review({
    ...req.body,
    author,
    store,
  });

  await newReview.save();

  req.flash('success', 'Review Saved!');
  res.redirect('back');
};