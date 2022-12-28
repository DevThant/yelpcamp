const Campground = require("../models/campground");

module.exports.checkQuery = async (q) => {
  if (q === "plth") {
    return await Campground.find({}).sort({ price: 1 });
  } else if (q === "phtl") {
    return await Campground.find({}).sort({ price: -1 });
  } else {
    // sort by alphabetical order
    return await Campground.find({}).sort({ title: 1 });
  }
};
