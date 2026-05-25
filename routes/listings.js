const express = require("express");
const router = express.Router();

const listingController = require("../controllers/listings");
const { isLoggedIn, isOwner } = require("../middleware");

const multer = require("multer");
const { storage } = require("../cloudConfig");

// SIMPLE UPLOAD (FAST + STABLE)
const upload = multer({ storage });

// ================= INDEX + CREATE =================
router
  .route("/")
  .get(listingController.index)
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    listingController.createListing
  );

// ================= NEW =================
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ================= SHOW / UPDATE / DELETE =================
router
  .route("/:id")
  .get(listingController.showListing)
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    listingController.updateListing
  )
  .delete(isLoggedIn, isOwner, listingController.destroyListing);

// ================= EDIT =================
router.get("/:id/edit", isLoggedIn, isOwner, listingController.renderEditForm);

module.exports = router;