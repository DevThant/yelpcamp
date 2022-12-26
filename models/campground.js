const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } };

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema(
  {
    title: String,
    price: Number,
    description: String,
    location: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    images: [ImageSchema],
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

// CampgroundSchema.virtual("properties.popUpMarkUp").get(function () {
//   return `<a href= "/campgrounds/${this._id}" >${this.title}</>`;
// });

CampgroundSchema.virtual("properties.popUpMarkUp").get(function () {
  return `<div class="card" style="width: 12rem">
  <img src="${this.images[0].url}" class="card-img-top" alt="${this.title}" />
  <div class="card-body">
    <h5 class="card-title">${this.title}</h5>
    <p class="card-text">$ ${this.price} per night</p>
    <a href="/campgrounds/${this._id}" class="btn btn-primary btn-sm"
      >See Campground</a
    >
  </div>
</div>

`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  // #3
  if (doc) {
    await Review.deleteMany({ _id: { $in: doc.reviews } });
  }
});
module.exports = mongoose.model("Campground", CampgroundSchema);
