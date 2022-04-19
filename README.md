# **Yelp Camp**

1. [Basic Setup](#basic-setup)
2. [Basic CRUD](#basic-crud)
3.

### **Basic Setup**

##### [Start](#)

<br>

```powershell
>npm i express mongoose ejs method-override
>touch app.js
>mkdir views public models
\views>touch index.js
\models>touch campground.js
```

1. Set view engines to ejs and views directory
2. Use json and url parser to parse incoming requests from url and jsons
3. Set static directory
4. Use method override for CRUD operations

```javascript
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");
const Campground = require("./models/campground");

const app = express();
const port = 3000;

mongoose
  .connect("mongodb://localhost:27017/yelpcamp")
  .then(() => {
    console.log("Mongoose Running");
  })
  .catch((error) => console.log(`Connection Error : ${error}`));

// #1
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// #2
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// #3
app.use(express.static(path.join(__dirname, "public")));
// #4
app.use(methodOverride("method"));

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(port, () => console.log(`App running on port ${port}`));
```

Basic campground model

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
});

module.exports = mongoose.model("Campground", CampgroundSchema);
```

---

### **Basic CRUD**

##### [Start](#)

<br>

1. [Seed folder to populate the database`(seeding)`](#seeding)
2.
3.
4.

---

### Seeding

##### [Start](#) / [Basic CRUD](#basic-crud)

<br>

1. Make seeds folder and main seed file
2. Download cities.js and seedHelpers.js in seeds

```powershell
>mkdir seeds
\seeds> touch index.js
```

Seeding

1. Delete all existing campgrounds
2. Require the exported seed data( cites, places, descriptors )
3. Make 50 random campgrounds.
4. Choose random index from array for the places and descriptors (`sample function`)
5. Make random number from 1 to 1000 for random location

   index.js

```javascript
const mongoose = require("mongoose");
const Campground = require("../models/campground");
// #2
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose
  .connect("mongodb://localhost:27017/yelpcamp")
  .then(() => {
    console.log("Mongoose Running");
  })
  .catch((error) => console.log(`Connection Error : ${error}`));

// #4
const sample = (array) => array[Math.floor(Math.random() * Array.length)];
const seedDB = async () => {
  // #1
  await Campground.deleteMany({});
  // #3
  for (let i = 0; i < 50; i++) {
    // #5
    let r1000 = Math.floor(Math.random() * 1000);
    const camp = new Campground({
      // #5
      location: `${cities[r1000].city}, ${cities[r1000].state}`,
      // #4
      title: `${sample(descriptors)} ${sample(places)}`,
    });
    await camp.save();
  }
};

seedDB();
```

---

### **Campground Index**

##### [Start](#) / [Basic CRUD](#basic-crud)

<br>

app.js

```javascript
const express = require("express");
.
.
.
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.listen(port, () => console.log(`App running on port ${port}`));
```

views/campgrounds/index.ejs

```html
<h1>All Campgrounds</h1>
<% let n = 1 %> <% for(let c of campgrounds) {%>
<div>
  <h3><%= n++ %>. <%= c.title %></h3>
  <p>Location: <%= c.location %></p>
</div>

<% } %>
```

---

### **Campground Show**

##### [Start](#) / [Basic CRUD](#basic-crud)

<br>

app.js

```javascript
app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
});
```

views/campgrounds/index.ejs

```html
<h3><%= n++ %>. <%= c.title %></h3>
<p>Location: <%= c.location %></p>
<a href="/campgrounds/<%= c.id %> "><button>View Details</button></a>
```

views/campgrounds/show.ejs

```html
<h1><%= campground.title %></h1>
<div>
  <p>Location: <%= campground.location %></p>
</div>
```

---

### **Campground New/Create**

##### [Start](#) / [Basic CRUD](#basic-crud)

<br>

1. Important! : Orders matter, don't put `"campgorunds/new"` below the `"campgrounds/:id"`
2. Create new campground from the form
3. Better! Create new campground from the form (Alternative way)
   > Give grouped name in name section of the input in ejs

app.js

```javascript
// #1
app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

// #2
app.post("/campgrounds", async (req, res) => {
  const { title, location } = req.body;
  const c = new Campground({ title, location });
  await c.save();
  res.redirect(`/campgrounds/${c.id}`);
});

// #3 (alt for #2)
app.post("/campgrounds", async (req, res) => {
  const c = new Campground(req.body.campground);
  await c.save();
  res.redirect(`/campgrounds/${c.id}`);
});

// #1
app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
});
```

/views/campgrounds/new.ejs

```html
<form action="/campgrounds" method="post">
  <label for="title">Title:</label>
  <!-- 3 -->
  <!-- <input type="text" name="title" id="location" /> -->
  <input type="text" name="campground[title]" id="title" />
  <label for="location">Location:</label>
  <!-- 3 -->
  <!-- <input type="text" name="location" id="location" /> -->
  <input type="text" name="campground[location]" id="location" />

  <button type="submit">Add</button>
</form>
```

---

### **Campground Edit/Update**

##### [Start](#) / [Basic CRUD](#basic-crud)

<br>

1. Create route to edit page
2. Update the campground with req from edit page

app.js

```javascript
// #1
app.get("/campgrounds/:id/edit", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/edit", { campground });
});

// #2
app.put("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(
    id,
    req.body.campground
    // {...req.body.campground} this works too
  );
  res.redirect(`/campgrounds/${campground.id}`);
});

app.get("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  res.render("campgrounds/show", { campground });
});
```

/views/campgrounds/edit.ejs

```html
<form action="/campgrounds/<%= campground.id %>?_method=PUT" method="post">
  <div>
    <label for="title">Title:</label>
    <input
      type="text"
      name="campground[title]"
      id="title"
      placeholder="<%= campground.title %> "
    />
    <label for="location">Location:</label>
    <input
      type="text"
      name="campground[location]"
      id="location"
      placeholder="<%= campground.location %> "
    />
  </div>
  <button type="submit">Make Changes</button>
</form>
```

---

### **Campground Delete**

##### [Start](#) / [Basic CRUD](#basic-crud)

<br>

```javascript
app.delete("/campgrounds/:id", async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
});
```

```html

```
