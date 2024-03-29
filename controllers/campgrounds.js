const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");
const { queries } = require("../utils/constants");
const { checkQuery } = require("./campgroundHelpers");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mbxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mbxToken });

module.exports.index = async (req, res) => {
  // get queries from url
  const { q, search } = req.query;
  // if there is a query, use checkQuery to sort the campgrounds or search for a campground
  if (q) {
    const campgrounds = await checkQuery(q);
    res.render("campgrounds/index", { campgrounds, queries });
  } else if (search) {
    const campgrounds = await Campground.find({
      title: { $regex: search, $options: "i" },
    });
    res.render("campgrounds/index", { campgrounds, queries });
  }
  // if there is no query, just render the campgrounds
  else {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds, queries });
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  console.log(campground);
  req.flash("success", "New Campground has been added!");
  res.redirect(`/campgrounds/${campground.id}`);
};

module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground) {
    req.flash("error", "Campground does not exist!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground does not exist!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.images.push(...images);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  console.log(req.body.deleteImages, campground);
  req.flash("success", "Campground Updated.");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", `Campground Deleted!`);
  res.redirect("/campgrounds");
};
