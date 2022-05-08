const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");

// Utilities
const ExpressError = require("./utils/ExpressError");

// Routes
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

const app = express();
const port = 3000;

mongoose
  .connect("mongodb://localhost:27017/yelpcamp")
  .then(() => {
    console.log("Mongoose Running");
  })
  .catch((error) => console.log(`Connection Error : ${error}`));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.engine("ejs", ejsMate);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// --------------------Routes--------------------

// Campgrounds
app.use("/campgrounds", campgroundRoutes);

// Reviews
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

app.listen(port, () => console.log(`YelpCAMP running on port ${port}`));
