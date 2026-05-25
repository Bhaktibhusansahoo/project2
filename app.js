// ================= ENV =================
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// ================= GLOBAL SAFETY =================
process.on("uncaughtException", (err) => {
  console.log("🔥 UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("🔥 UNHANDLED REJECTION:", err);
});

// ================= IMPORTS =================
const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const multer = require("multer");

const User = require("./models/user");

// ================= ROUTES =================
const userRouter = require("./routes/user");
const listingRouter = require("./routes/listings");
const reviewRouter = require("./routes/review");

// ================= DATABASE =================
mongoose.set("strictQuery", false);

const dbUrl =
  process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/test";

mongoose
  .connect(dbUrl, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log("❌ DATABASE ERROR:", err.message);
  });

// ================= VIEW ENGINE =================
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ================= MIDDLEWARE =================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ================= SESSION =================
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 3600,
  collectionName: "sessions",
});

store.on("error", (err) => {
  console.log("SESSION ERROR:", err.message);
});

app.use(
  session({
    store,
    secret: process.env.SECRET || "secretcode",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  })
);

// ================= FLASH =================
app.use(flash());

// ================= PASSPORT =================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ================= GLOBAL VARIABLES =================
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user || null;
  next();
});

// ================= ROUTES =================
app.use("/", userRouter);
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

// ================= ASYNC WRAPPER =================
function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
}

// ================= MULTER ERROR HANDLER =================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).render("error.ejs", {
        message: "Image too large. Max 15MB allowed",
        currentUser: req.user || null,
        error: [],
      });
    }
  }
  next(err);
});

// ================= GLOBAL ERROR HANDLER (FINAL FIXED) =================
app.use((err, req, res, next) => {
  console.log("🔥 GLOBAL ERROR FULL:", err);
  console.log("🔥 MESSAGE:", err?.message);

  if (res.headersSent) return next(err);

  res.status(500).render("error.ejs", {
    message: err?.message || "Something went wrong",
    currentUser: req.user || null,
    error: [],
  });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).render("error.ejs", {
    message: "Page Not Found",
    currentUser: req.user || null,
    error: [],
  });
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on ${PORT}`);
});