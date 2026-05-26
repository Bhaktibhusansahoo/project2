const express = require("express");
const router = express.Router();

const listingController =
require("../controllers/listings");

const {
isLoggedIn,
isOwner
} =
require("../middleware");

const multer =
require("multer");

const {
storage
} =
require("../cloudConfig");

// ================= MULTER =================
const upload =
multer({

storage,

limits: {
fileSize:
10 * 1024 * 1024
}

});

// ================= SAFE ASYNC WRAPPER =================
function wrapAsync(fn) {

return function (
req,
res,
next
) {

Promise.resolve(
fn(
req,
res,
next
)

)

.catch(
next
);

};

}

// ================= INDEX + CREATE =================
router
.route("/")

.get(

wrapAsync(
listingController.index
)

)

.post(

isLoggedIn,

upload.single(
"listing[image]"
),

wrapAsync(
listingController.createListing
)

);

// ================= NEW =================
router.get(

"/new",

isLoggedIn,

wrapAsync(
listingController.renderNewForm
)

);

// ================= SHOW =================
router.get(

"/:id",

wrapAsync(
listingController.showListing
)

);

// ================= EDIT =================
router.get(

"/:id/edit",

isLoggedIn,

isOwner,

wrapAsync(
listingController.renderEditForm
)

);

// ================= UPDATE =================
router.put(

"/:id",

isLoggedIn,

isOwner,

upload.single(
"listing[image]"
),

wrapAsync(
listingController.updateListing
)

);

// ================= DELETE =================
router.delete(

"/:id",

isLoggedIn,

isOwner,

wrapAsync(
listingController.destroyListing
)

);

module.exports = router;