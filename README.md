# **Yelp Camp**

1. [**Basic Setup**](#basic-setup)
2. [**Basic CRUD**](#basic-crud)
3. [**Basic templating** and layouts with **ejs & BOOTSTRAP 5**](#basic-templating-and-layouts)
4. [**Basic image**(Modify campground model)](#basic-image)
5. [**Errors & Validating Data**](#errors-and-validating-data)
6. [**Review model**](#review-model)
7. [**Refactor Routes**](#refactor-routes)
8. [**Serving Static Assets**](#serving-static-assets)
9. [**Session**](#session)
   - [Setting up Session](#setting-up-session)
   - [Setting up Flash](#setting-up-flash)
10. [**Authentication**](#authentication)
    - [User model with Passport Local Mongoose](#passport-local-mongoose)
    - [Register](#register)
    - [Login](#login)
    - [Login-middleware](#required-login-middleware)
    - [Auto-login](#auto-login)
    - [Logout](#logout)
11. [**Authorization**](#authorization)
12. [**Refactor routes** with **controller** (MVC)](#controllers)
13. [`router.route()`(Fancy way to restructure routes)](#restructure-routes)
14. [Errors during development](#errors-during-development)

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

1. [Adding review model](#1-adding-review-model-for-campground)
2. [Validation for review model](#2-validation-for-review-model)
3. [Display reviews and delete](#3-display-and-delete)
4. [Delete every reviews associated with campground when campground is deleted](#delete-every-reviews)

---

### **1. Adding review model for campground**

##### [Start](#) / [Review Model](#review-model)

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

### **2. Validation for review model**

##### [Start](#) / [Review Model](#review-model)

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

### **3. Display and Delete**

##### [Start](#) / [Review Model](#review-model)

<br>

We will show all the reviews in the same show page for the campground, and to do that we just need to populate the reviews.

app.js

```javascript
app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    res.render("campgrounds/show", { campground });
  })
);
```

For deleting reviews

1. We dont necessarily need to find and update campground (optional)
2. This is enough for deleting the review.
3. This can delete reviews BUT **[We still need campground delete middleware to delete all reviews once a campground is deleted](#delete-all-reviews).**

app.js

```javascript
app.delete(
  "/campgrounds/:id/reviews/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    // #1
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    // #2
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);
```

---

### **Delete All Reviews**

##### [Start](#) / [Review Model](#review-model)

<br>

We will use mongoose midlleware to delete all the reviews associated with campground, once the campground is deleted.

> **Note:** we are using `Campground.findByIdAndDelete(id)` to delete a campground and this function triggers the following mongoose middleware `findOneAndDelete()`. Refers to [doc](https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndDelete) ( look under Returns: )

In campground model

1. Dont forget to import the review model inside the campground model
2. Use findOneAndDelete() middleware
   > This middleware returns the found document, in this case the campground we are deleting.
3. If there is a campground, delete all the reviews inside the found campground.

campground.js

```javascript
// #1
const Review = require("./review");
...
// #2
CampgroundSchema.post("findOneAndDelete", async function(doc){
  // #3
  if(doc){
    await Review.deleteMany({_id: {$in: doc.reviews}})
  }
})
```

> Note: THIS won't work if we are deleting multiple campgrounds or using other function to delete campground instead of `findByIdAndDelete()`

---

### Refactor Routes

##### [Start](#)

<br>

Seperate the campgrounds and reviews routes from the main app to Route files.

1. Create route folder in root dir.
2. Create route file for campground and reviews
3. Set the express router in each file and export the routers
4. Move the routes and necessary middlewares from main app to respective route file.
5. Set mergeParams to true in reviews express.Router.

app.js

```javascript
// Routes
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

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
```

---

### Serving Static Assets

##### [Start](#)

<br>

- Create public folder in root dir
- Then tell express to use our public folder as static assets folder

```javascript
app.use(express.static(path.join(__dirname, "public")));
```

- Now we can link our static assests - files, images, sounds, ...etc in our app.

Remove form validation script from layout/boilerplate.ejs and put it in the validateForm.js which is inside public folder. Then use the file in place of our script by sourcing it.

layouts/boilerplate.ejs

```html
<script src="/javascripts/validateForm.js"></script>
```

public/javascripts/validateForm.js

```javascript
(function () {
  "use strict";

  const forms = document.querySelectorAll(".validated-form");

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

### **Session**

##### [Start](#)

<br>

We need session :

- [To use flash messages, when user do CRUD on campgrounds and reviews, login and logout, gretting, ...etc.](#setting-up-flash)
- For users authentications.

---

### **Setting Up Session**

##### [Start](#) / [Session](#session)

<br>

To setup session

1. npm i express-session
2. Import session module
3. Create config for session and use session
4. Set up simple secret and basic requirements by express-session
5. Add options to cookies that we send back
   - set expire date for 1 week(Since **`Date.now()`** is in miliseconds, we have to convert our 1 week time into miliseconds)
   - set httpOnly (**true by default**) : to mitigate risk by accessing cookies through clinet side scripts. [read more](https://owasp.org/www-community/HttpOnly)

app.js

```javascript
// #2
const session = require("express-session");

// #3
const sessionConfig = {
  // #4
  secret: "donotstoresecretlikethis",
  resave: false,
  saveUninitialized: true,
  // #5
  cookie: {
    //  1000 miliseconds in a second, 60 s in min, 60 min in hr, 24 hr/day to 7 days
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    httpOnly: true,
  },
};

// #3
app.use(session(sessionConfig));
```

---

### **Setting Up Flash**

##### [Start](#) / [Session](#session)

<br>

- [Flash Basic Setup](#flash-basic-setup)

- [Setup Flash with partials and bootstrap](#)

---

#### **Flash Basic setup**

To setup flash messages:

1. npm i connect-flash
2. Import and use flash in app
3. To use flash, we just have to pass in a key and a value into `req.flash()`
4. Create middleware to store flash messages and pass them into every routes
   > This middleware has to come before any routes
5. Add flash message to boilerplate template.

app.js

```javascript
// #1
const flash = require("connect-flash");

// #2
app.use(flash());

// #3 req.flash("key" , "value")

// #4
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  next();
});

// Routes
```

<!-- prettier-ignore-start -->
layouts/boilerplate.ejs

```html
<main class="container my-5">
  <%= success %> 
  <%- body %>
</main>
```
<!-- prettier-ignore-end -->

Camground CRUD flash messages:

1. Create new campground

/routes/campgrounds.js

```javascript
router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    // #1 flash message
    req.flash("success", "New Campground has been added!");
    res.redirect(`/campgrounds/${campground.id}`);
  })
);
```

---

#### **Setup Flash with Partials and Bootstraps**

1. Create flash.ejs in partials
2. Add flash message with bootstrap alert
3. Inlcude the flash partials in the boilerplate
4. Since the flash is on all pages we have to make sure the bootsrap alert is not displaying the flash message box even if there is no message.
   > We have to check the length of success and error to check if there is any messages in array.

flash.ejs

<!-- prettier-ignore -->
```html

<!-- Success -->
<!-- #4 -->
<% if(success.length){ %>
<!-- #2 -->
<div class="alert alert-success alert-dismissible fade show" role="alert">
  <%= success %>
  <button
    type="button"
    class="btn-close"
    data-bs-dismiss="alert"
    aria-label="Close"
  ></button>
</div>
<% } %>

<!-- Error  -->
<!-- #4 -->
<% if(error.length){ %>
<!-- #2 -->
<div class="alert alert-danger alert-dismissible fade show" role="alert">
  <%= error %>
  <button
    type="button"
    class="btn-close"
    data-bs-dismiss="alert"
    aria-label="Close"
  ></button>
</div>
<% } %>

```

boilerplate.ejs

<!-- prettier-ignore -->
```html

<main class="container my-5">
  <!-- #3 -->
  <%- include("../partials/flash") %>
  <%- body %>
</main>
```

Then add flash messages to necessary routes.

routes/campgrounds.js

```javascript
router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    // Flash Message
    req.flash("success", "New Campground has been added!");
    res.redirect(`/campgrounds/${campground.id}`);
  })
);

router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate(
      "reviews"
    );
    if (!campground) {
      // Flash Message
      req.flash("error", "Campground does not exist!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);
```

---

### **Authentication**

##### [Start](#)

<br>

1. [User model with passport-local-mongoose](#passport-local-mongoose)
2. [**Register** (form and user registration with passport)](#register)
3. [**Login** (form and login with passport)](#login)

   - [**isLoggedIn** **Middleware**(Prevents certain routes to user without account)](#required-login-middleware)
   - [Automatically Login the user upon registration](#auto-login)

4. **[Logout](#logout)**

### **passport-local-mongoose**

##### [Start](#) / [Authentication](#authentication)

<br>

> npm i passport passport-local passport-local-mongoose

1. Create User Model
2. We don't need to specify or declare the username and password in our schema, passport-local-mongoose will take care of it. **[Read doc](https://github.com/saintedlama/passport-local-mongoose#readme)**
   > Passport-Local Mongoose will add a username, hash and salt field to store the username, the hashed password and the salt value.

models/user.js

```javascript
const mongoose = require("mongoose");
const passportLocalMongoose = require("");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// #2
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
```

3. import passport, passport-local and user model to main app.
4. Initialize the passport and enable the passport session support
   > Passport session support is entirely optional, but recommended for most apps. **`Be sure to use session()` before `passport.session()`**.
5. Tell passport to use localStrategy, and for that localStrategy the authentication method will be located on our user model.
   > We didnt really defined any methods called `authenticate()` in our user file but it is coming from the **static methods** of **passport-local-mongoose** module. #2 is important for this to work. Read doc.
6. Use passport serialize to store user to session and deserialize to remove user from the session. (Static methods)

app.js

```javascript
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");

app.use(session(sessionConfig));
app.use(flash());
// #4
app.use(passport.initialize());
app.use(passport.session());

// #5
passport.use(new localStrategy(User.authenticate()));
// #6
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
```

7. This is just a demo for user registration using passport

   - We don't need to put the password directly into User model (leaves password out)
   - Use `register()` method to save new User to database > register(user, password, cb) Convenience method to register a new user instance with a given password. Checks if username is unique. (Static methods)
     app.js

```javascript
app.get("/demoRegister", async (req, res) => {
  // #7.1
  const user = new User({ email: "demo@gmail.com", username: "demo" });
  // #7.2
  const newUser = await User.register(user, "12345password");
  res.send(newUser);
});
```

---

### **Register**

##### [Start](#) / [Authentication](#authentication)

<br>

1. Create register form in users/register.ejs
2. Create get route for register form.
3. Create post route for registering new user using passport.
4. Use passport local mongoose static method Model.register(model, password) for creating new users.
   > Also check the unique username.
5. Use try/catch to do custom error handling during login. (User trying to register with existing username, ...etc.)
   > Without try/catch, When user make some mistakes, the page will redirect the user to error page and we don't want that. Instead we flash the error to user with flash message.

routes/user.js

```javascript
// #2
router.get("/register", (req, res) => {
  res.render("users/register");
});

// #3
router.post(
  "/register",
  catchAsync(async (req, res) => {
    // #5
    try {
      const { username, email, password } = req.body;
      // We dont need to pass the password into user model, passport-local-mongoose will take care of hashing it and storing
      const user = new User({ username, email });
      // #4
      const newUser = await User.register(user, password);
      req.flash("success", "Welcome to the YelpCamp!");
      res.redirect("/campgrounds");
    } catch (error) {
      req.flash("error", error.message);
      res.redirect("/register");
    }
  })
);
```

### **Login**

##### [Start](#) / [Authentication](#authentication)

<br>

1. Create login form in users/login.ejs
2. import passport to user.js
3. Create get route for login form.
4. Create post route to authenticate the user using passport.
5. Using passport.authenticate in Login Route.
   - If user fail the authentication, flash the error message to user.
   - Redirect user upon failure.
6. redirect the user upon successful authentication.

routes/user.js

```javascript
const passport = require("passport");
// #2
router.get("/login", (req, res) => {
  res.render("users/login");
});

// #3
router.post(
  "/login",
  // #4
  passport.authenticate("local", {
    // #5.1
    failureFlash: true,
    // #5.2
    failureRedirect: "/login",
  }),
  async (req, res) => {
    // #6
    req.flash("success", "Welcome back");
    res.redirect("/campgrounds");
  }
);
```

### Required Login Middleware

##### [Start](#) / [Authentication](#authentication)

<br>

isAunthenticated method is automatically added to req by the passport. Use `req.isAuthenticated()` to check whether the user is logged in or not.

1. Don't forget these two lines in main app (rest won't work if these two aren't present.)
2. passport.authenticate() middleware invokes essentials methods to request like `req.isAuthenticated()`, `req.logout()`, `req.login()`, ...etc.

   ```javascript
   app.use(passport.initialize());
   app.use(passport.session());
   ```

3. Prevents users from accessing the new route (to create new campground) by using isAuthenticated().

routes/campground.js

```javascript
router.get("/new", (req, res) => {
  // #2
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }
  res.render("campgrounds/new");
});
```

3. Since we'll be needing to use this method on other routes and frequently, we move #2 into seperate function to use it as middleware.

utils/middlewares.js

```javascript
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }
  next();
};
```

4. Import the middleware into routes/campgrounds.js
5. Use the middleware in routes that needs preventions.

```javascript
// #4
const { isLoggedIn } = require("../utils/middleware");

// #5
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new");
});
//* Routes that need protection, new (get + post), edit (get + put), delete
```

**Redirect the user back to the page/url that they were trying to access to before getting redirect to the login.**

6. Store the url in session during isLoggedIn middleware,
7. In actual login route (post route), use req.session.returnTo to extract the url that user was trying to access before and redirect to it or redirect to campgrounds if there is no returnTo in session.
8. Delete the returnTo from session after getting the redirectURL.

utils/middlewares.js

```javascript
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // #6
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in!");
    return res.redirect("/login");
  }
  next();
};
```

routers/user.js

```javascript
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.flash("success", "Welcome back");
    // #7
    const redirectURL = req.session.returnTo || "/campgrounds";
    // #8
    delete req.session.returnTo;
    res.redirect(redirectURL);
  }
);
```

---

### Auto Login

##### [Start](#) / [Authentication](#authentication)

<br>

To login the user upon completing registration, we just have to use login()

1. Add req.login() after successful registration
2. We have to include the error ( which is highly unlikely to trigger ) and pass it into our error handler with next(err).

> req.login() does not support async

routes/user.js

```javascript
router.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ username, email });
      const newUser = await User.register(user, password);
      // #1
      req.login(newUser, (err) => {
        // #2
        if (err) return next(err);
        req.flash("success", "Welcome to the YelpCamp!");
        res.redirect("/campgrounds");
      });
    } catch (error) {
      req.flash("error", error.message);
      res.redirect("/register");
    }
  })
);
```

---

### **Logout**

##### [Start](#) / [Authentication](#authentication)

<br>

Just like `isAuthenticated()` from [login middleware](#required-login-middleware), `logout()` method is already added to the request by passport.

1. To logout we just have to use `req.logout()` to remove user from a session.

routes/user.js

```javascript
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Goodbye");
  res.redirect("/campgrounds");
});
```

2. Login + Register + Logout buttons on navbar
3. To hide and show necessarry button according to user status(logged in or not), we will need to use `req.user` (current user in the session).
   > which is also added by passport, just like isAuthenticated() and logout())
4. Add req.user to our locals to pass the current user status into every template (rather than importing it to each template.)

```javascript
app.use((req, res, next) => {
  // #4
  res.locals.loggedInUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
```

5. Show/hide the buttons by checking if there is a user data in loggedInUser.

```html
<div class="navbar-nav ms-auto">
  <% if(!loggedInUser){ %>
  <a class="nav-link" href="/login">Login</a>
  <a class="nav-link" href="/register">Register</a>
  <% }else{ %>
  <a class="nav-link" href="/logout">Logout</a>
  <% } %>
</div>
```

---

### **Authorization**

##### [Start](#)

<br>

1. [Adding an author to campground](#adding-author-to-campground)
2. [Hide/show edit and delete](#hideshow---edit-and-delete-buttons)
3. [Campground permissions for edit and delete](#campground-permissions)
4. [Review Permissions](#review-permissions)
5. [isReviewAuthor middleware](#add-isreviewauthor-middleware)

---

#### **Adding Author To Campground**

##### [Start](#) / [Authorization](#authorization)

<br>

1. Referencing the user as author in campgroundSchema. (The owner of the campground)

models/campground.js

```javascript
const CampgroundSchema = new Schema({
 ...
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
 ...
});
// Add existing user id into seed/index.js seedDB() and redo the seed to update campgrounds with user account.
```

2. Populate the author in necessary routes

routes/campgrounds.js

```javascript
// Show route for campground
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    // populate author
    const campground = await Campground.findById(req.params.id)
      .populate("reviews")
      .populate("author");
    if (!campground) {
      req.flash("error", "Campground does not exist!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);
```

3. Connect logged in user and campground when creating a new campground.
   routes/campgrounds.js
   > req.user is exposed by passport ( current user in passport session )

routes/campgrounds.js

```javascript
router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // #3
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "New Campground has been added!");
    res.redirect(`/campgrounds/${campground.id}`);
  })
);
```

#### **Hide/Show - Edit and Delete Buttons**

##### [Start](#) / [Authorization](#authorization)

<br>

1. Check if there is any user
   > If we dont check, the ejs will break when there is no user (object.id.equals(undefined)). So we use && to check if there is any user then we proceed to compare.
2. Check if campground author is equals to the current logged in user
   > We don't need to specify the id like this - `campground.author._id.equals(loggedInUser._id)`. Mongo is flexible and knows that we are comparing ids.

views/campgrounds/show

```html
<!--     #1               #2                                        -->
<% if(loggedInUser && campground.author.equals(loggedInUser._id)){%>
<a href="/campgrounds/<%= campground.id %>/edit" class="btn btn-primary"
  >Edit</a
>
<form
  class="d-inline"
  action="/campgrounds/<%= campground.id %>?_method=Delete"
  method="post"
>
  <button class="btn btn-danger" type="submit">Delete Campground</button>
</form>
<% } %>
```

#### **Campground Permissions**

##### [Start](#) / [Authorization](#authorization)

<br>

1. **Prevents accessing** edit route if user do not own the campground
2. **Prevents updating** the campground if user do not own the campground
3. **Prevents deleting** the campground if user do not own the campground
4. Refactor the above using middleware.

routes/campgrounds.js

```javascript
// #1
router.get(
  "/:id/edit",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // #1
    if (!campground) {
      req.flash("error", "Campground does not exist!");
      return res.redirect("/campgrounds");
    }
    if (!campground.author.equals(req.user._id)) {
      req.flash("error", "You do not have permission!");
      return res.redirect(`/campgrounds/${campground.id}`);
    }
    res.render("campgrounds/edit", { campground });
  })
);
// #2
router.put(
  "/:id",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // #2
    if (!campground.author.equals(req.user._id)) {
      req.flash("error", "You do not have permission!");
      return res.redirect(`/campgrounds/${campground.id}`);
    }
    await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Campground Updated.");
    res.redirect(`/campgrounds/${campground.id}`);
  })
);
// #3
router.delete(
  "/:id",
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // #3
    if (!campground.author.equals(req.user._id)) {
      req.flash("error", "You do not have permission!");
      return res.redirect(`/campgrounds/${campground.id}`);
    }
    await Campground.findByIdAndDelete(id);
    req.flash("success", `Campground Deleted!`);
    res.redirect("/campgrounds");
  })
);
```

#4 Refactoring the above code.

1. Remove the block of code that compare the author with user into seperate middleware
2. Put the middleware in necessary routes(edit(form and action), delete(action))

routes/campgrounds.js

```javascript
const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission!");
    return res.redirect(`/campgrounds/${campground.id}`);
  }
  next();
};

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Campground does not exist!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash("success", "Campground Updated.");
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", `Campground Deleted!`);
    res.redirect("/campgrounds");
  })
);
```

---

#### **Review Permissions**

##### [Start](#) / [Authorization](#authorization)

<br>

First, add author(reference to user) to review model.

models/review.js

```javascript
const reviewSchema = new Schema({
  body: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  // #
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});
```

1. Import the isLoggedIn and isAuthor middleware to routes/reviews.js
2. User must have account in order to post a review, so prevent the post route with isLoggedIn middelware.
   > also hide the form to create new reviews in views/campgrounds/show.ejs
3. Add user to review when posting a new review

routes/reviews.js

```javascript
// #1
const { validateReview, isLoggedIn } = require("../utils/middlewares");

router.post(
  "/",
  // #2
  isLoggedIn,
  validateReview,
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    // #3
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review Added!");
    res.redirect(`/campgrounds/${campground.id}`);
  })
);
```

4. Populate the review's author in campgrounds show page to display user name in thier reviews.
   > Nested population.

routes/campgrounds.js

```javascript
router.get(
  "/:id",
  catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      // #4
      .populate({ path: "reviews", populate: { path: "author" } })
      .populate("author");
    if (!campground) {
      req.flash("error", "Campground does not exist!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  })
);
```

#### **Add isReviewAuthor Middleware**

##### [Start](#) / [Authorization](#authorization)

<br>

Add a new middleware where we check the author of the reviews with the current logged in user. Just like isAuthor from campground, if the user does not have permission if they are not logged in or not the owner of the review.

> Also hide the delete button if the user is not the owner of the review.

utils/middlewares

```javascript
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have permission!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
```

```html
<% if(loggedInUser && review.author.equals(loggedInUser._id)){%>
<form
  class="d-inline"
  action="/campgrounds/<%= campground.id %>/reviews/<%= review.id %>?_method=Delete"
  method="post"
>
  <button class="btn btn-sm btn-danger" type="submit">Delete</button>
</form>
<% } %>
```

- Add isReviewAuthor to necessary routes

routes/reviews.js

```javascript
router.delete(
  "/:reviewId",
  isLoggedIn,
  // #
  isReviewAuthor,
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", `Review Deleted!`);
    res.redirect(`/campgrounds/${id}`);
  })
);
```

---

### **Controllers**

##### [Start](#)

<br>

1. Create folder for controllers
   > `mkdir controllers`
2. Create controller files.
   > /controllers/>touch campgrounds.js
3. Move the CRUD funtions from routes to controllers
4. Do the same for the other routes.

routes/campgrounds.js

```javascript
const campgrounds = require("../controllers/campgrounds.js");
// #3
router.get("/", catchAsync(campgrounds.index));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(campgrounds.createCampground)
);

router.get("/:id", catchAsync(campgrounds.showCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(campgrounds.updateCampground)
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.deleteCampground)
);
```

controllers/campgrounds.js

```javascript
const Campground = require("../models/campground");

// #3
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  campground.author = req.user._id;
  await campground.save();
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
  await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  req.flash("success", "Campground Updated.");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", `Campground Deleted!`);
  res.redirect("/campgrounds");
};
```

---

### Restructure Routes

##### [Start](#)

<br>

Use router.route() to group together the same paths with different request.

routes/campgrounds.js

```javascript
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);
```

routes/user.js

```javascript
router
  .route("/register")
  .get(users.renderRegister)
  .post(catchAsync(users.createUser));

router
  .route("/login")
  .get(users.renderLogin)
  .post(
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);
```

---

### **Errors during development**

##### [Start](#)

<br>

1. [Cannot read property 'push' of undefined](#e1)
2. [TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined](#e2)
3. [TypeError [ERR_INVALID_ARG_VALUE]: The argument 'id' must be a non-empty string. Received ''](#e3)

#### E1

##### [Start](#) / [More Errors](#errors-during-development)

<br>

    Cannot read property 'push' of undefined

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

**Check:**

This usually happens in Models, especially the part where you put ref inside. Check if the property that ref to another model is array or just an object

**Fix:**

Change subDocs from object to array

```javascript
const modelSchema = new Schema({
  // #cause
  subDocs: {
    type: Schema.Types.ObjectId,
    ref: "SubDoc",
  },
});

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

#### **E2**

##### [Start](#) / [More Errors](#errors-during-development)

<br>

Happened in Greenish_Engineering_services

    > TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined

    Happened when I try to access the routes that contains cod variable

**Cause:**

This happens cus of naming conflict, I was trying to pass the **variable** **`setting`** into the routes.

settings is conflicted with one of the ejsMate option.

utils/cod.js

```javascript
const category = ["hvac", "solar", "grounding", "electircal", "plumbing"];
const types = ["installation", "cleaning", "maintenance", "survey"];
const plans = ["One-Time", "Monthly", "3 Months", "6 Months", "Yearly"];
const methods = ["Regular", "Premium"];
const models = ["Inverter", "Non-Inverter"];
const hps = [1, 1.5, 2, 2.5, 3];
const settings = ["default", "custom"];

module.exports.cod = { category, types, plans, methods, models, hps, settings };
```

**Fix:**

- Rename or remove the settings

```javascript
const category = ["hvac", "solar", "grounding", "electircal", "plumbing"];
const types = ["installation", "cleaning", "maintenance", "survey"];
const plans = ["One-Time", "Monthly", "3 Months", "6 Months", "Yearly"];
const methods = ["Regular", "Premium"];
const models = ["Inverter", "Non-Inverter"];
const hps = [1, 1.5, 2, 2.5, 3];
const opsets = ["default", "custom"];

module.exports.cod = { category, types, plans, methods, models, hps, opsets };
```

---

#### **E3**

##### [Start](#) / [More Errors](#errors-during-development)

<br>

Happened when running app

    > TypeError [ERR_INVALID_ARG_VALUE]: The argument 'id' must be a non-empty string. Received ''
        at new NodeError (node:internal/errors:371:5)
        at Module.require (node:internal/modules/cjs/loader:1000:11)
        at require (node:internal/modules/cjs/helpers:102:18)
        at Object.<anonymous> (C:\Users\pyaes\Desktop\pyaesone\Apps\Greenish_Services\JoiSchemas.js:1:13)
        at Module._compile (node:internal/modules/cjs/loader:1103:14)
        at Object.Module._extensions..js (node:internal/modules/cjs/loader:1157:10)
        at Module.load (node:internal/modules/cjs/loader:981:32)
        at Function.Module._load (node:internal/modules/cjs/loader:822:12)
        at Module.require (node:internal/modules/cjs/loader:1005:19)
        at require (node:internal/modules/cjs/helpers:102:18) {
        code: 'ERR_INVALID_ARG_VALUE'
        }

**Cause:**

I got this error because I was not properly importing the module:

```javascript
//       #not importing any module
const Joi = require("");
```

Other possible causes :

- run it for debugging in "vs code"

**Fix:**

Make sure that every modules has been imported correctly.

```javascript
//                  #fix
const Joi = require("joi");
```

---
