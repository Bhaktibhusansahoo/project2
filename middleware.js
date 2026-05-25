const Listing = require("./models/listing");

// ================= LOGIN CHECK =================
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }
  next();
};

// ================= OWNER CHECK =================
module.exports.isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);

    // ❌ Listing not found
    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    // ❌ No owner OR not matching user
    if (
      !listing.owner ||
      listing.owner.toString() !== req.user._id.toString()
    ) {
      req.flash("error", "You are not allowed to do that");
      return res.redirect(`/listings/${id}`);
    }

    next();

  } catch (err) {
    console.log(err);
    req.flash("error", "Something went wrong");
    return res.redirect("/listings");
  }
};