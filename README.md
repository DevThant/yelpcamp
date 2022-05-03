# **Yelp Camp**

1. [Basic Setup](#basic-setup)
2. [Basic CRUD](#basic-crud)
3. [Basic templating and layouts with ejs and BOOTSTRAP 5](#basic-templating-and-layouts)
4. [Basic image (Modify campground model)](#basic-image)
5. [Errors and validating data](#errors-and-validating-data)
6. [Review model](#review-model)
7. [Errors during development](#errors-during-development)

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

/campgrounds/show.ejs

```html
<form action="/campgrounds/<%= campground.id %>?_method=Delete" method="post">
  <button type="submit">Delete Campground</button>
</form>
```

---

### **Basic Templating and Layouts**

##### [Start](#)

<br>

[#1 Create Layout folder and create boilerplate.ejs inside.](#create-layout-folder-and-create-boilerplateejs-inside)

- Set up all campgrounds pages and index to layout(boilerplate.ejs).

[#2 Create partials](#create-partials)

- navbar partial

---

#### Create Layout folder and create boilerplate.ejs inside.

##### [Start](#) / [Basic Templating and Layouts](#basic-templating-and-layouts)

<br>

#1 Install EJS Mate

    npm i ejs-mate

#2 Include/Require EJS Mate in the main app

- Set the engine to ejsMate

```javascript
const ejsMate = require("ejs-mate");

app.engine("ejs", ejsMate);
```

#3 Create new folder in views directory - name layouts

```powershell
\views> mkdir layouts
```

#4 Create boilerplate ejs file in layouts folder

> This will be the basic boilerplate for every single page.

```powershell
\views\layouts> touch boilerplate.ejs
```

#5 Includes body(as reference to html body) in boilerplate.ejs

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Boilerplate</title>
  </head>
  <body>
    <h1>BEFORE</h1>

    <!-- #5 -->
    <%- body %>

    <h1>AFTER</h1>
  </body>
</html>
```

#6 **Pass in the body of desire html** to our **boilerplate** page **using layout function**

> For this example, I'm gonna use the index of the campgrounds from yelpcamp project - \views\campgrounds\index.ejs

```html
<!-- #6 -->
<% layout('layouts/boilerplate') %>

<h1>All Campgrounds</h1>
<a href="/campgrounds/new"><button>Add Campground</button></a>
<% let n = 1 %> <% for(let c of campgrounds) {%>
<div>
  <h3><%= n++ %>. <%= c.title %></h3>
  <p style="display: inline">Location: <%= c.location %></p>
  <a href="/campgrounds/<%= c.id %> "><button>View Details</button></a>
</div>

<% } %>
```

**NOTE:** **All the contents of html and ejs from index.ejs will be passed into the boilerplate.ejs file in the place of <%-body%>**

---

### Create Partials

##### [Start](#) / [Basic Templating and Layouts](#basic-templating-and-layouts)

<br>

#1 Create partials folder

```powershell
\views> mkdir partials
```

#2 Create partails

```powershell
\views\partials> touch navbar.ejs footer.ejs
```

navbar.ejs

```html
<nav class="navbar sticky-top navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="/">YelpCamp</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNavAltMarkup"
      aria-controls="navbarNavAltMarkup"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
      <div class="navbar-nav">
        <a class="nav-link" href="/">Home</a>
        <a class="nav-link" href="/campgrounds">Campgrounds</a>
        <a class="nav-link" href="/campgrounds/new">Add New Campground</a>
      </div>
    </div>
  </div>
</nav>
```

footer.ejs

```html
<footer class="footer bg-dark py-5 mt-auto">
  <div class="container">
    <span class="text-muted">&copy; YelpCamp 2022</span>
  </div>
</footer>
```

#3 Include partials in boilerplate.ejs

```html
<body>
  <%- include("../partials/navbar") %>
  <main class="container mt-5"><%- body %></main>
  <%- include("../partials/footer") %>
</body>
```

---

### **Basic Image**

##### [Start](#)

<br>

Add image to campground.

1. [Modify the campground model for image](#modify-model-for-image)
2. [Modify the seed file to add images, also price and description](#modify-seed-for-image-description-and-price)

---

#### **Modify model for image**

<br>

/models/campground.js

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  price: String,
  description: String,
  location: String,
  // #
  image: String,
});

module.exports = mongoose.model("Campground", CampgroundSchema);
```

---

#### Modify seed for image, description and price

<br>

1.  Use unsplash api to get random image from collection everytime we use image url
    > This does not store images to database, just a url that picks out random image from a collection from unsplash.
2.  Add description to seed, just a lorem ipsum.
3.  Add random price to seed.

    > **Shorthand Used**. Since the **name of variable** to generate random price is the **same as** the "price" **name of the model**,

         thus we use shorthand
         price: price
         to just
         price

/seeds/index.js

```javascript
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const r1000 = Math.floor(Math.random() * 1000);
    // #3
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      location: `${cities[r1000].city}, ${cities[r1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      // #1
      image: "https://source.unsplash.com/collection/483251",
      // #2
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora est nam sequi fugit reiciendis architecto error officia? Rerum reprehenderit maxime hic dignissimos officia, sint incidunt nemo autem velit? Nisi, eligendi.",
      // #3
      price,
    });
    await camp.save();
  }
};
```

---

### **Errors And Validating Data**

##### [Start](#)

<br>

1. [Client-side Validation (Basic and no mongoose validations)](#cilent-side-validation)
2. [Defining Express Error Class And Async Wrapper](#defining-express-error-class-and-async-wrapper)
3. [Handling Errors](#handling-errors)
   - [Error Handler](#error-handler)
   - [404 for unknown routes](#404-for-unknown-routes)
   - [400, invalid campground data (prevents creating campground directly from postman)](#400-invalid-campground-data)
   - [400, invalid campground data (with JOI)](#joi-middleware)
4. [Defining Error Template](#defining-error-template)
5. [JOI Schema Validations](#joi-schema-validations)
6. [JOI Validation Middleware](#joi-middleware)

---

### Cilent-side Validation

##### [Start](#) / [Error And Validating Data](#errors-and-validating-data)

<br>

[We can just use custom bootstrap form validation to do client-side validation.](https://getbootstrap.com/docs/5.0/forms/validation/)

THIS WONT WORK, if someone create a post request directly from something like postman.([handle this err](#))

For custom Bootstrap form validation messages, you’ll need to add the novalidate boolean attribute to your `<form>`

```javascript
// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();
```

---

### Defining Express Error Class And Async Wrapper

##### [Start](#) / [Error And Vlidating Data](#errors-and-validating-data)

<br>

1. Make utils folder in root dir
2. Create ExpressError.js in utils

ExpressError.js

```javascript
class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.status = status;
  }
}
```

3. Create catchAsync.js or asyncWrap or wrapAsync in utils
4. Export async wrapper function that pass our error in function to the error handling function.
   > [More explanation at E4](https://github.com/DevThant/My_notes/edit/master/Topics/Web_Development/Javascript/explanations.md#e4)

catchAsync.js

```javascript
// #4
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
```

5. Require both ExpressError.js and catachAsync.js in our main app
6. Wrap catchAsync Wrapper around routes' async functions
   app.js

```javascript
// #5
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");

//#6
app.post(
  "/campgrounds",
  catchAsync(async (req, res) => {
    const c = new Campground(req.body.campground);
    await c.save();
    res.redirect(`/campgrounds/${c.id}`);
  })
);
...
```

---

### Handling Errors

##### [Start](#) / [Error And Vlidating Data](#errors-and-validating-data)

1. [Error Handler](#error-handler)
2. [404 for unknown routes](#404-for-unknown-routes)
3. [400, invalid campground data (creating campground directly from routes with postman)](#400-invalid-campground-data)

---

### **Error Handler**

##### [Start](#) / [Error And Vlidating Data](#errors-and-validating-data) / [Handling Errors](#handling-errors)

<br>

1. Destructure the `err` to get message and statusCode ( if not set default)
   app.js

```javascript
app.use((err, req, res, next) => {
  const { message = "Something Went Wrong", statusCode = 500 } = err;
  res.status(statusCode).send(message);
});
```

---

### **404 for unknown routes**

##### [Start](#) / [Error And Vlidating Data](#errors-and-validating-data) / [Handling Errors](#handling-errors)

<br>

This should be at the very end of all routes!

app.js

```javascript
app.all("*", (req, res, next) => {
  next(new ExpressError("404 Not Found", 404));
});
```

---

### **400 invalid campground data**

##### [Start](#) / [Error And Vlidating Data](#errors-and-validating-data) / [Handling Errors](#handling-errors)

<br>

app.js

```javascript
app.post(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    if (!req.body.campground)
      throw new ExpressError("Invalid Campground Data", 400);
    const c = new Campground(req.body.campground);
    await c.save();
    res.redirect(`/campgrounds/${c.id}`);
  })
);
```

---

### **Defining Error Template**

##### [Start](#) / [Error And Vlidating Data](#errors-and-validating-data)

<br>

!! Since we be passing our error message and statusCode to error.ejs, we need to change the error handler.

> remove message from destructuring to give err.message a default value if there is none. If we destrucutre the err.message, it is not gonna be inside the error.

app.js

```javascript
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong";
  res.status(statusCode).render("error", { err });
});
```

1. Create error.ejs in the root views dir
2. Include boilerplate in template
3. Set err message

error.ejs

```html
<% layout('layouts/boilerplate') %>

<div class="row">
  <div class="col-6 offset-3">
    <div class="alert alert-danger" role="alert">
      <h4 class="alert-heading"><%= err.message %></h4>
      <p><%= err.stack %></p>
    </div>
  </div>
</div>
```

---

### **JOI Schema Validations**

##### [Start](#) / [Error And Vlidating Data](#errors-and-validating-data)

<br>

Joi Doc - https://joi.dev/api/?v=17.6.0

1.  Install JOI

        npm i joi

2.  Include JOI in our app

```javascript
const Joi = require("joi");
```

3. Using JOI on campgroud creating route
   > Dont mix it up with mongoose, it has nothing to do with mongoose. Joi is a javascript module.
4. Create a JOI schema that match to our mongo model of campground.
5. Destructure the error from JOI validation result
   > there will be no error object if we pass joi validation (schema.validate)
6. If there is an error, get the error message from error object and passed it to ExpressError. [More Explanation E5](https://github.com/DevThant/My_notes/blob/master/Topics/Web_Development/Javascript/explanations.md#e5)

app.js

```javascript
app.post(
  "/campgrounds",
  catchAsync(async (req, res, next) => {
    const campgroundSchema = Joi.object({
      campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().min(0).required(),
        location: Joi.string().required(),
        image: Joi.string().required(),
        description: Joi.string().required().min(10),
      }).required(),
    });
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(msg, 400);
    }
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
  })
);
```

---

### Joi Middleware

##### [Start](#) / [Error And Vlidating Data](#errors-and-validating-data)

<br>

Create middleware function for our joi validation

> Since validateCampground is not inside the route midlleware and become a seperate middleware, don't forget to call next() in case we have no error.

app.js

```javascript
const validateCampground = (req, res, next) => {
  const campgroundSchema = Joi.object({
    campground: Joi.object({
      title: Joi.string().required(),
      price: Joi.number().min(0).required(),
      location: Joi.string().required(),
      image: Joi.string().required(),
      description: Joi.string().required().min(10),
    }).required(),
  });
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    // #
    next();
  }
};
```

Seperate the campgroundSchema from the middleware

- Create JoiSchemas file in root dir and put campgroundSchema in it.

JoiSchemas.js

```javascript
const Joi = require("joi");

module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    image: Joi.string().required(),
    description: Joi.string().required().min(10),
  }).required(),
});
```

Include the campgroundSchmea in main app

- put the validateCampground middleware in our **Create(post) Campground Route** and **Update(put) Campground Route**

app.js

```javascript
const { campgroundSchema } = require("./JoiSchemas");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
  })
);

app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground.id}`);
  })
);
```

### **Review Model**

##### [Start](#)

<br>

1. [Adding review model](#adding-review-model-for-campground)
2. [Validation for review model](#validation-for-review-model)
3. [Display reviews in campground]

---

### **Adding review model for campground**

##### [Start](#) / [Review Model](#add-review-model)

<br>

review.js

```javascript
const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  body: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
```

Reference reviews in each campground

campground.js

```javascript
const CampgroundSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  location: String,
  image: String,
  // #
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});
```

Route to create new review (form is inside show page of campgrounds)

app.js

```javascript
app.post(
  "/campgrounds/:id/reviews",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
  })
);
```

### Validation for review model

##### [Start](#) / [Review Model](#add-review-model)

<br>

For client-side : use bootstrap5 form validation.

For Server-side : use **[Joi](#joi-schema-validations)**

1. Add reviewSchema for joi

JoiSchemas.js

```javascript
module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
  }).required(),
});
```

2. Include the reviewSchema and create validator function

```javascript
const { campgroundSchema, reviewSchema } = require("./JoiSchemas");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
```

3. Put the validateReview in review's creation route to validate the incoming body

```javascript
app.post(
  "/campgrounds/:id/reviews",
  validateReview,
  catchAsync(async (req, res) => {codeblock}
```

---

### Errors during development

##### [Start](#)

<br>

1. [Cannot read property 'push' of undefined](#e1)

#### E1

##### [Start](#) / [More Errors](#errors-during-development)

<br>

    Cannot read property 'push' of undefined

**Check:**

- Models, especially the part where you put ref inside. Check if the property that ref to another model is array or just an object

**Cause:**

This tends to happen when you are pushing data into something that is not an array.

app.js

```javascript
app.post("/...", async (req, res) => {
  const model = await Model.findById(id);
  const subDoc = await SubModel.findById(id);
  model.subDocs.push(subDoc);
});
```

The problem lies here - subDocs is an Object instead of Array.

model.js

```javascript
const modelSchema = new Schema({
  // #cause
  subDocs: {
    type: Schema.Types.ObjectId,
    ref: "SubDoc",
  },
});
```

**Fix:**

Change subDocs from object to array

```javascript
const modelSchema = new Schema({
  // #fix
  subDocs: [
    {
      type: Schema.Types.ObjectId,
      ref: "SubDoc",
    },
  ],
});
```

---
