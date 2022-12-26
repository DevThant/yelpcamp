const mongoose = require("mongoose");
const Review = require("../models/review");
const reviews = require("./reviews");
const Campground = require("../models/campground");
const { getUserIds } = require("./seedHelpers");
const ck = require("ckey");

const db = ck.MONGO_URL;

mongoose
  .connect(db)
  .then(() => {
    console.log("Mongoose Running");
  })
  .catch((error) => console.log(`Connection Error : ${error}`));

const seedReviews = async () => {
  await Review.deleteMany({});
  const allUsers = await getUserIds();
  const allCampgrounds = await Campground.find({});
  for (let i = 0; i < 1200; i++) {
    const review = reviews[Math.floor(Math.random() * reviews.length)];
    const author = allUsers[Math.floor(Math.random() * allUsers.length)];
    const newReview = new Review({
      ...review,
      author,
    });

    const campground =
      allCampgrounds[Math.floor(Math.random() * allCampgrounds.length)];
    campground.reviews.push(newReview);
    await newReview.save();
    await campground.save();
  }
  console.log("Seeding Finished");
};

seedReviews();
