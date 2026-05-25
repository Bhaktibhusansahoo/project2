const Listing = require("../models/listing");
const axios = require("axios");

// ================= INDEX =================
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// ================= NEW =================
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// ================= SHOW =================
module.exports.showListing = async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: { path: "author" },
    });

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// ================= CREATE =================
module.exports.createListing = async (req, res) => {
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // IMAGE
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // DEFAULT COORDINATES (SAFE FALLBACK)
    let coordinates = [77.5946, 12.9716];

    const location = `${newListing.location}, ${newListing.country}`;

    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: location,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "WanderLust-App",
          },
          timeout: 5000,
        }
      );

      if (response.data && response.data.length > 0) {
        coordinates = [
          parseFloat(response.data[0].lon),
          parseFloat(response.data[0].lat),
        ];
      }
    } catch (err) {
      console.log("⚠️ GEOCODING SKIPPED:", err.message);
    }

    newListing.geometry = {
      type: "Point",
      coordinates,
    };

    await newListing.save();

    req.flash("success", "Listing Added");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    console.log("CREATE ERROR:", err.message);
    req.flash("error", "Create failed");
    res.redirect("/listings");
  }
};

// ================= EDIT =================
module.exports.renderEditForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  res.render("listings/edit", { listing });
};

// ================= UPDATE =================
module.exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      req.flash("error", "Listing not found");
      return res.redirect("/listings");
    }

    Object.assign(listing, req.body.listing);

    // IMAGE
    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    // SAFE GEO UPDATE
    const location = `${listing.location}, ${listing.country}`;

    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: {
            q: location,
            format: "json",
            limit: 1,
          },
          headers: {
            "User-Agent": "WanderLust-App",
          },
          timeout: 5000,
        }
      );

      if (response.data && response.data.length > 0) {
        listing.geometry = {
          type: "Point",
          coordinates: [
            parseFloat(response.data[0].lon),
            parseFloat(response.data[0].lat),
          ],
        };
      }
    } catch (err) {
      console.log("⚠️ UPDATE GEO SKIPPED:", err.message);
    }

    await listing.save();

    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${req.params.id}`);
  } catch (err) {
    console.log("UPDATE ERROR:", err.message);
    req.flash("error", "Update failed");
    res.redirect("/listings");
  }
};

// ================= DELETE =================
module.exports.destroyListing = async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    req.flash("success", "Listing deleted");
  } catch (err) {
    console.log("DELETE ERROR:", err.message);
    req.flash("error", "Delete failed");
  }
  res.redirect("/listings");
};