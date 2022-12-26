const mongoose = require("mongoose");
const User = require("../models/user");
const users = require("./users");
const images = require("./images");
const Campground = require("../models/campground");
const cities = require("./cities");
const { places, descriptors, getUserIds } = require("./seedHelpers");
const ck = require("ckey");

const db = ck.MONGO_URL;

mongoose
  .connect(db)
  .then(() => {
    console.log("Mongoose Running");
  })
  .catch((error) => console.log(`Connection Error : ${error}`));

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedUser = async () => {
  await User.deleteMany({});
  users.forEach(async (user) => {
    const { email, username, password } = user;
    const newUser = new User({ email, username });
    await User.register(newUser, password);
  });
  console.log("Seeding Finished");
};

const seedDB = async () => {
  seedUser();
  await Campground.deleteMany({});
  for (let i = 0; i < 400; i++) {
    const r1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const image = images[Math.floor(Math.random() * images.length)];
    const allUsers = await getUserIds();
    const author = allUsers[Math.floor(Math.random() * allUsers.length)];
    const camp = new Campground({
      author,
      location: `${cities[r1000].city}, ${cities[r1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [cities[r1000].longitude, cities[r1000].latitude],
      },
      images: [
        {
          url: `https://res.cloudinary.com/psthant/image/upload/${image.code}/${image.folder}/${image.filename}`,
          filename: `${image.folder}/${image.filename}}`,
        },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora est nam sequi fugit reiciendis architecto error officia? Rerum reprehenderit maxime hic dignissimos officia, sint incidunt nemo autem velit? Nisi, eligendi.",
      price,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
  console.log("Seed Completed");
});
