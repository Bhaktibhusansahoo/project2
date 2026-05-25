const express = require("express");
const router = express.Router({ mergeParams: true });

const reviews = require("../controllers/reviews");
const { isLoggedIn } = require("../middleware");

// CREATE
router.post("/", isLoggedIn, reviews.createReview);

// DELETE
router.delete("/:reviewId", isLoggedIn, reviews.deleteReview);

module.exports = router;