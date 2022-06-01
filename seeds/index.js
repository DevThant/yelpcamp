const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose
  .connect("mongodb://localhost:27017/yelpcamp")
  .then(() => {
    console.log("Mongoose Running");
  })
  .catch((error) => console.log(`Connection Error : ${error}`));

const sample = (array) => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const r1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "628d424b12ec9834243396b6",
      location: `${cities[r1000].city}, ${cities[r1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [cities[r1000].longitude, cities[r1000].latitude],
      },
      images: [
        {
          url: "https://res.cloudinary.com/psthant/image/upload/v1653570486/YelpCamp/uhawqscqdz0beli2cqei.png",
          filename: "YelpCamp/uhawqscqdz0beli2cqei",
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora est nam sequi fugit reiciendis architecto error officia? Rerum reprehenderit maxime hic dignissimos officia, sint incidunt nemo autem velit? Nisi, eligendi.",
      price,
    });
    await camp.save();
  }
};

seedDB();
