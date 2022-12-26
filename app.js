if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// const db =
//   process.env.NODE_ENV !== "production"
//     ? "mongodb://localhost:27017/yelpcamp"
//     : process.env.MONGO_URL;

// or
// if no url inside dbUrl use local
const db = process.env.MONGO_URL || "mongodb://localhost:27017/yelpcamp";

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");

//Models
const User = require("./models/user");

// Utilities
const ExpressError = require("./utils/ExpressError");

// Routes
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/user");

const app = express();

mongoose
  .connect(db)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((error) => console.log(`Connection Error : ${error}`));

const secret = process.env.SESS_SECRET || "dustyblackcoatandaredrighthand";
const sessionConfig = {
  secret,
  saveUninitialized: false, // don't create session until something stored
  resave: false, //don't save session if unmodified
  store: MongoStore.create({
    mongoUrl: db,
    touchAfter: 24 * 3600, // time period in seconds for 24hours
  }),
  cookie: {
    //! Uncomment this when deploy to server. (server must be https, otherwise don;t)
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.use(mongoSanitize());

// --------------------Routes--------------------
// flash middleware
app.use((req, res, next) => {
  res.locals.loggedInUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// Landing
app.get("/", (req, res) => {
  res.render("index");
});

// Error
app.all("*", (req, res, next) => {
  next(new ExpressError("404 Not Found", 404));
});
// --------------------Routes--------------------

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong";
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`YelpCAMP running on port ${port}`));
