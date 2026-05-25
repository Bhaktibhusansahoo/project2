const Listing = require("../models/listing");
const Review = require("../models/review");

// CREATE REVIEW
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  const review = new Review(req.body.review);
  review.author = req.user._id;

  await review.save();

  listing.reviews.push(review._id);
  await listing.save();

  req.flash("success", "Review added!");
  res.redirect(`/listings/${req.params.id}`);
};

// DELETE REVIEW
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "Not allowed");
    return res.redirect(`/listings/${id}`);
  }

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId }
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted!");
  res.redirect(`/listings/${id}`);
};