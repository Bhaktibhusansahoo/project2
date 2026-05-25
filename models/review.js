const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const reviewSchema = new Schema({

  comment: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,

    // default rating if user only writes comment
    default: 1
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

});

module.exports = mongoose.model(
  "Review",
  reviewSchema
);