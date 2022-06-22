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
12. [**Refactor routes** with **controllers** (MVC)](#controllers)
13. [**`router.route()`**(Fancy way to restructure routes)](#restructure-routes)
14. [**Image Upload**](#image-upload)
    - [Multer middleware](#multer-middleware)
    - [**Enviroment Variable .env**](#env)
    - [Cloudinary](#cloudinary)
    - [Uploading to clodinary basic](#uploading-image-to-cloudinary)
    - [Store upload images' path and filename in mongo](#storing-uploaded-image-links-in-mongo)
    - [Add image upload to campground edit](#adding-upload-to-edit-page)
    - [Delete Images from campground (edit/update)](#delete-images)
    - [Display Image with thumbnail using cloudinary api and virtual](#image-thumbnail)
15. [**Adding Maps**](#adding-maps)
16. [**Basic and common security**](#basic-security)
17. [**Errors during development**](#errors-during-development)

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

### **Image Upload**

##### [Start](#)

<br>

We are going to upload our images to cloudinary and serve them on our app. For uploading files normal html form does not work, we have to use enctype

```html
<form action="/somewhere" method="post" enctype="multipart/form-data">...</form>
```

In order for the enctype to work properly, we will need middleware called **multer**.

1. [Multer Middleware](#mutler-middleware)
2. [Cloudinary](#cloudinary)

Note : [Reduce Image Upload time](#tips)

---

#### **Multer Middleware**

##### [Start](#) / [Image Upload](#image-upload)

<br>

**Multer** is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency. **[Doc](https://www.npmjs.com/package/multer)**

1. Install multer (npm i multer)
2. Import multer and set the upload destination
3. Set up cloudinary middleware for single image or array of images
4. Set mutiple in input to upload multiple files.

routes/campgrounds.js

```javascript
// #2
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  // #3
  .post(upload.array("campground[image]"), (req, res) => {
    console.log(req.body, req.files);
    res.send("It worked");
  });
```

```html
<!-- 4 -->
<input
  class="form-control"
  type="file"
  name="campground[image]"
  id="image"
  multiple
  required
/>
```

---

#### **.env**

##### [Start](#) / [Image Upload](#image-upload)

<br>

### Note: This is for Development purpose only, not to be used in Production!

<br>

Use **.env to store** the **API KEYS and other credentials**. AND we **do not include this file** when we submit our app to github or anywhere.

1. create .env file (Do it in the top level(root) of your app!)
2. Store secrets, api keys, and important credentials in env.
   > By using key-value pairs.
3. Use dotenv npm package to use our .env file. [Docs](https://www.npmjs.com/package/dotenv)
   > npm i dotenv

.env

```.env
<!-- 2 -->
SECRET=thisisasecret
API_KEY=685648481638677
```

4. Set up a condition in main app.js, if we are running the app in development mode, require the dotenv package.
   > process.env.NODE_ENV is enviroment where our node app runs and usually it is either development or production.
5. We can now acceess our stored values from env with process.env.key
   > Expected output : thisisasecret

app.js

```javascript
// #4
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// #5
console.log(process.env.SECRET)

const express = require('express');
...
```

---

#### **Cloudinary**

##### [Start](#) / [Image Upload](#image-upload)

<br>

Open cloudinary accounts here https://cloudinary.com/

Read [.env](#env) before proceeding!

1. Place cloudinary cloud name, key and secret in .env.
   > Use values from your cloudinary account. Look for them at dashboard
2. Make sure to install dotenv and require it in main app if the app is running in development mode.
3. Now we can use our credentials from .env in anyplace of the app.
   > process.env.CLOUDINARY_CLOUD_NAME;

.env

```
CLOUDINARY_CLOUD_NAME=cloudname
CLOUDINARY_KEY=key
CLOUDINARY_SECRET=secret
```

---

#### Uploading image to cloudinary

##### [Start](#) / [Image Upload](#image-upload)

<br>

For everythinng to work and upload images from multer to cloudinary, we need to install two more packages : **cloudinary** and **multer-storage-cloudinary**. Its on the doc [here](https://www.npmjs.com/package/multer-storage-cloudinary)

1. Install packages
   > npm i cloudinary multer-storage-cloudinary
2. Create cloudinary folder and a file, where we write cloudinary configs
3. Import cloudinary and multer-storage-cloudinary
   > Always check the doc, since we need the cloudinary version to be the same as doc.
4. This is not in the doc, but we need to set up an instance of cloudinary config with our credentials.
5. Instantiate new CloudinaryStorage instance, AND specify the config, foldername(on cloudinary) to store the data, and allowed data formats.
6. Export both instances(cloudinary and storage).

cloudinary/index.js

```javascript
// #3
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// #4
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// #5
const storage = new CloudinaryStorage({
  // this is config that we set up above
  cloudinary,
  params: {
    folder: "YelpCamp",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

// #6
module.exports = { cloudinary, storage };
```

7. Import the storage in routes/campgrounds.js
   > We don't need to specify ../cloudinary/index, since express looks for index.js file
8. Set the multer dest to storage.
   > Now if we upload photos they will be stored on the cloudinary. You can look at the path in req.files for the url of photo location.

```javascript
// #7
const storage = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });
```

9. Now if we perform an upload, and check the req.files in post route, we can see the details of our upload file.
   > and use that to grab the path and store it in the mongodb

```javascript
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  // #9
  .post(upload.array("campground[image]"), (req, res) => {
    console.log(req.body, req.files);
    res.send("It worked");
  });
```

```powershell
[Object: null prototype] {
  campground: [Object: null prototype] {
    title: 'asdsadas',
    location: 'dasdasdasdasd',
    description: 'asdsadsadasdsa',
    price: '12'
  }
} [
 #9
  {
    fieldname: 'campground[image]',
    originalname: 'googlemap2.PNG',
    encoding: '7bit',
    mimetype: 'image/png',
    path: 'https://res.cloudinary.com/psthant/image/upload/v1653556315/YelpCamp/
ati4jwfsqhserusicoal.png',
    size: 2752294,
    filename: 'YelpCamp/ati4jwfsqhserusicoal'
  }
]
```

---

#### **Storing Uploaded Image Links in Mongo**

##### [Start](#) / [Image Upload](#image-upload)

<br>

We can extract the link/path, and filename(to delete image) from uploaded image with req.files. [see no.9](#uploading-image-to-cloudinary)

1. Modify the image of the campground model

models/campground.js

```javascript
const CampgroundSchema = new Schema({
  ...
  //from
  image: String,
  //to
  images: [
    {
      url:String,
      filename: String,
    }
  ]
});
```

2. Extract the path and filename of uploaded images and put it in `campground.images`.
   > Using **`map`** take **url** and **filename** of each f, and create a new array of objects.

controllers/campgrounds.js

```javascript
module.exports.createCampground = async (req, res, next) => {
  const campground = new Campground(req.body.campground);
  // #2
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "New Campground has been added!");
  res.redirect(`/campgrounds/${campground.id}`);
};
```

3. !! Now the problem lies in the campground routes
   - upload which is multer upload the image to cloud and then we get req.file.
   - But we need to validate the campground informations first before uploading the file!
   - So we have to place the validation before multer, but the problem is if we don't upload with mutler first there is no path and url of image.
   - We'll have to go around this problem [later](), but for now **remove image from JoiSchema to progress**.

```javascript
router.route("/").get(catchAsync(campgrounds.index)).post(
  isLoggedIn,
  // #3
  upload.array("campground[image]"),
  validateCampground,
  catchAsync(campgrounds.createCampground)
);
```

---

### **Adding Upload To Edit Page**

##### [Start](#) / [Image Upload](#image-upload)

<br>

1. Add encoding to form in campgrounds/edit.ejs and multiple to image file selection.
   > enctype="multipart/form-data"
2. Change the update route and controller for image upload
   > In controller, we cannot directly push the image from map. Because map created a new array for us. And we cannot push array into existing array of objects. So we have to store and spread them to push into the existing array.

Note: In future updates, we can do #2 directly inside of Campground.findByIdAndUpdate.

routes/campgrounds.js

```javascript
router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    // #2
    upload.array("campground[image]"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));
```

controllers/campgrounds.js

```javascript
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  // #2
  images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  // #2
  campground.images.push(...images);
  // # save the campground again after pushing
  await campground.save();
  req.flash("success", "Campground Updated.");
  res.redirect(`/campgrounds/${id}`);
};
```

---

### **Custom File Input (NOT WORKING WITH CURRENT BOOTSTRAP 5.1)**

##### [Start](#) / [Image Upload](#image-upload)

<br>

To display the name of the choosed file in our file input we will need to use an npm called bs-custom-file-input. [doc](https://www.npmjs.com/package/bs-custom-file-input)

1. Copy the minified version cdn from doc and paste it in the boilerplate
2. Call init method to use the bs custom file input in public/javascripts/validateForm.
3. [See this for more example on using this npm](https://github.com/Johann-S/bs-custom-file-input/blob/master/tests/index.html)
4. In example the bs-custom-file is expecting these classes
   > custom-file and custom-file-label , add them to your bootstrap file input

public/javascripts/validateForm.js

```javascript
(function () {
  "use strict";
  // #2
  bsCustomFileInput.init();

  const forms = document.querySelectorAll(".validated-form");
    ...
})();
```

```html
<div class="col-sm-12 mt-5">
  <h3>Example with label containing a child</h3>
  <!-- #4 -->
  <div class="custom-file mt-2">
    <input
      id="inputGroupFile04"
      type="file"
      multiple
      class="custom-file-input"
      multiple
    />
    <label class="custom-file-label" for="inputGroupFile04">
      <span class="d-inline-block text-truncate w-75"
        >Choose several files</span
      >
    </label>
  </div>
</div>
```

---

#### **Delete Images**

##### [Start](#) / [Image Upload](#image-upload)

<br>

1. Display all the images associated with campground in edit page.
2. Put check box for every image
3. Name chatbox and put all the selected values inside it.
   > Each checked images' filename will be put into deleteImages value which is array when parsed. (`req.body.deleteImages`)
4. Add deleteImages in JoiSchema validation.
   > otherwise, we will see deleteImages is not allowed

Note: DO NOT PUT ANY SPACE after ejs, or you might face problems

```html
value="<%= img.filename %>"
<!-- Has SPACE -->
value="<%= img.filename %> "
```

views/campgrounds/edit.ejs

```html
<div class="mb-3">
  <!-- #1 -->
  <% campground.images.forEach(function(img, i){%>
  <img src="<%= img.url %> " class="img-thumbnail" />
  <!-- #2 -->
  <div class="form-check form-check-inline">
    <input
      class="form-check-input"
      type="checkbox"
      id="image-<%= i%>"
      #3
      name="deleteImages[]"
      value="<%= img.filename %> "
    />
    <label class="form-check-label" for="image-<%= i%>">Select</label>
  </div>
  <% }) %>
</div>
```

JoiSchemas.js

```javascript
module.exports.campgroundSchema = Joi.object({
  campground: Joi.object({
    ...
    }).required(),
    // #4
  deleteImages: Joi.array(),
});
```

**Next, Delete images from mongodb and cloudinary server **

Delete images on Mongodb:

1. Check if there is any images to delete
2. Pull out the images that match with the filename from deleteImages array.

controllers/campgrounds.js

```javascript
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
  // #1
  if (req.body.deleteImages) {
    // #2
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.images } } },
    });
  }
  req.flash("success", "Campground Updated.");
  res.redirect(`/campgrounds/${id}`);
};
```

Delete Images from cloudinary

1. Import the cloudinary from cloudinary/index.js
2. Use uploader and call destroy method on filename to delete image from cloudinary.

```javascript
// #1
const { cloudinary } = require("../cloudinary");

module.exports.updateCampground = async (req, res) => {
  // ...
  if (req.body.deleteImages) {
    // #2
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.images } } },
    });
  }
  req.flash("success", "Campground Updated.");
  res.redirect(`/campgrounds/${id}`);
};
```

---

#### **Image Thumbnail**

##### [Start](#) / [Image Upload](#image-upload)

<br>

Use cloudinary URL API to get thumbnail. [Doc](https://cloudinary.com/documentation/transformation_reference)

1. Seperate the image from campground schema to make a virtual for image.
2. Create a virtual to make our thumbnail using url api from cloudinary.
3. Use the virtual thumbnail in edit form to get thumbnail images from cloudinary

models/campgrounds.js

```javascript
// #1
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

// #2
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampgroundSchema = new Schema({
  ...
  // #1
  images: [ImageSchema],
  ...
});
```

```html
<!-- #3 -->
<img src="<%= img.thumbnail %>" class="img-thumbnail" />
```

---

### Adding Maps

##### [Start](#)

<br>

[mapbox-sdk full documentation (all services)](https://github.com/mapbox/mapbox-sdk-js/blob/HEAD/docs/services.md)

1. Create MAPBOX account
2. Copy the default access token and place it in the .env under MAPBOX_TOKEN.
3. Install mapbox sdk for node
   > npm i @mapbox/mapbox-sdk
4. [Get lat + long using mapbox forward geocoding](#geocoding)
5. [Render Map on show page](#render-map-on-show-page)
6. [Cluster Map](#cluster-map)

#### Geocoding

##### [Start](#) / [Adding Maps](#adding-maps)

<br>

[mapbox-sdk Geocoding doc](https://github.com/mapbox/mapbox-sdk-js/blob/HEAD/docs/services.md#geocoding)

Note: There are multiple services and we are just using geocoding services. You can import require services just like geocoding.

1.  Import geocoding
2.  Import mapbox token
3.  Initiate mapbox geocoding service by setting valid token
    > geocoding service(geocoder) has 2 methods, **forward** and reverse geocode.
4.  Brief example of getting lat + long from geocoding.
    - forwardgeocode has many params but the query and limits are necessary(Look up the doc.)
    - We need to send the data for mapbox to geocode
    - Coordinates(lat, long) are located inside the geometry.

controllers/campgrounds.js

```javascript
// #1
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// #2
const mbxToken = process.env.MAPBOX_TOKEN;
// #3
const geocoder = mbxGeocoding({ accessToken: mbxToken });

// #4
module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    // #4.1
    .forwardGeocode({
      query: "Yosemite, CA",
      limit: 1,
    })
    // #4.2
    .send();
  // #4.3
  console.log(geoData.body.features[0].geometry.coordinates);
};
```

5. We will store the geometry that we get from 4.3 in campground, but the location data must be exactly like this geoJSON.

```json
// #5
 location: {
   type: "Point",
   coordinates: [long, lat]
 }
 // #4.3 ,geometry not coordiantes
 geometry: {
   type: "Point",
   coordinates: [long, lat]
 }

```

6. Adding geometry to our campground model

/models/campground.js

```javascript
const CampgroundSchema = new Schema({
  ...
  // #6
  geometry: {
    type: {
      type: String,
      enum: ["Point"], // Must be "Point", nothing else
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
...
});
```

8. Get geoData from the req.body.campground.location
9. Saving geometry data to the campground

/controllers/campground.js

```javascript
module.exports.createCampground = async (req, res, next) => {
  // #8
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  // #8
  campground.geometry = geoData.features[0].geometry;
...
}
```

---

#### Render Map On Show Page

##### [Start](#) / [Adding Maps](#adding-maps)

<br>

Follow the quickstart [docs](https://docs.mapbox.com/mapbox-gl-js/guides/install/#quickstart)

1. Put the js and css url in boilerplate from doc.
2. Copy the map and script from doc and place them in the show page.

views/layouts/boilerplate.ejs

```html
<!-- #1 -->
<head>
  <script src="https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.js"></script>
  <link
    href="https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css"
    rel="stylesheet"
  />
</head>
```

views/campgrounds/show.ejs

```html
<!-- #2 -->
<div class="card">
  <div id="map" style="width: 400px; height: 300px;"></div>
  ...
</div>

<script>
  mapboxgl.accessToken =
    "pk.eyJ1IjoicHN0aGFudCIsImEiOiJjbDNyMW90dzcxZG1hM2JwN3huMjVqYnJ6In0.cwJp2Bqdn683sTEIJZKf8Q";
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v11", // style URL
    center: [-74.5, 40], // starting position [lng, lat]
    zoom: 9, // starting zoom
  });
</script>
```

3. Move the script out of show page and make a seperate js file for it
4. Set the token in showPage with the ejs and link the map script

public/javascripts/showPageMap.js

```javascript
// #3 map script
mapboxgl.accessToken = mbxToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 9, // starting zoom
});
```

views/campgrounds/show.ejs

```html
<!-- #4 -->
<script>
  const mbxToken = "<%- process.env.MAPBOX_TOKEN %>";
</script>

<div class="container">...</div>

<!-- #4 -->
<script src="javascripts/showPageMap.js"></script>
```

5. Add marker to the map ([docs](https://docs.mapbox.com/mapbox-gl-js/example/add-a-marker/))

public/javascripts/showPageMap.js

```javascript
mapboxgl.accessToken = mbxToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-74.5, 40],
});

// #5
new mapboxgl.Marker().setLngLat([-74.5, 40]).addTo(map);
```

6. Add campground variable which stores all the campground information with ejs, to later use in our scripts
   > We have to convert the whole campground into JSON, beacuase of the properties like id (123abc456fasd) which is neither string nor number. Otherwise we will get an error.

/views/campgrounds/show.ejs

```javascript
<script>
  const mbxToken = '<%- process.env.MAPBOX_TOKEN %>'
  // #6 you can safely ignore the error from vscode.
  const campground = <%-JSON.stringify(campground)%>
</script>
```

7. Use the campground that we define in our show.ejs to get the coordinates in showPageMap.js
   > Display the marker and center the map to our campground location

public/javascripts/showPageMap.js

```javascript
mapboxgl.accessToken = mbxToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  // #7
  center: campground.geometry.coordinates,
  zoom: 9,
});
// #7
new mapboxgl.Marker().setLngLat(campground.geometry.coordinates).addTo(map);
```

8. Add popup to the marker ([docs](https://docs.mapbox.com/mapbox-gl-js/example/set-popup/))

public/javascripts/showPageMap.js

```javascript
const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
  `<h5>${campground.title}</h5>`
);
new mapboxgl.Marker()
  .setLngLat(campground.geometry.coordinates)
  .setPopup(popup)
  .addTo(map);
```

---

### **Cluster Map**

##### [Start](#) / [Adding Maps](#adding-maps)

<br>

1. Store token and all campgrounds data from the index.ejs
   - We have to convert the campgrounds data to JSON String, since mapbox is expecting GeoJSON(GSON) data.
   - And notice that we put all our campgrounds into the new property called features. If you look at the data mapbox is using, you can see the map is using geojson and it looks into features of that json and visualize the data on map. So we have to make our data identical to this.

campgronds/index.ejs

```html
<!-- #1 -->
<script>
  const mbxToken = "<%-process.env.MAPBOX_TOKEN%>";
  // #1.1                 #1.2
  const campgrounds = { features: <%- JSON.stringify(campgrounds)%> };
</script>
<script src="/javascripts/clusterMap.js"></script>
```

```json
{
  // These parts are not mandatory
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" }
  },
  // 1.2 (necessary for the clusters to work)
  "features": {
    "type": "Feature",
    "properties": {
      campgrounds data (id, author, images, ...etc)
    },
    "geometry": { "type": "Point", "coordinates": [-151.5129, 63.1016, 0.0] }
  }
}
```

2. Get token from ejs

javascripts/clusterMap.js

```javascript
// #2
mapboxgl.accessToken = mbxToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [-103.5917, 40.6699],
  zoom: 3,
});
```

3. Copy the basic cluster map from [here](https://docs.mapbox.com/mapbox-gl-js/example/cluster/)
4. Put our campgrounds data ("`campgrounds`" from ejs) inside the data which is used by map to visualize our data into clusters. (check 1.2 again if not clear)
   javascripts/clusterMap.js
5. Point the data source to our campgrounds(#4) in each functions of the maps.
6. For the popup (when click on single camp) to work we need another property called("`properties`").
   - Normally our campgrounds data should look like this for everything to work with this cluster map.
   ```json
   {
     features: {
       properties: {
         campgrounds data(id, author, images, ...etc)
       }
       geometry: {
         ...
       }
     }
   }
   ```
   - For this to work we will add a virtual to the campground schema (#7)

```javascript
// #3
map.on("load", () => {
  map.addSource("campgrounds", {
    type: "geojson",
    // #4
    data: campgrounds,
    cluster: true,
    clusterMaxZoom: 14, // Max zoom to cluster points on
    clusterRadius: 50, // Radius of each cluster when clustering points (defaults to 50)
  });

  map.addLayer({
    id: "clusters",
    type: "circle",
    // #5
    source: "campgrounds",
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#64dfdf",
        50,
        "#fca311",
        100,
        "#ff7b00",
        399,
        "#e01e37",
      ],
      "circle-radius": [
        "step",
        ["get", "point_count"],
        10,
        10,
        20,
        50,
        30,
        100,
        40,
      ],
    },
  });

  map.addLayer({
    id: "cluster-count",
    type: "symbol",
    // #5
    source: "campgrounds",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
  });

  map.addLayer({
    id: "unclustered-point",
    type: "circle",
    // #5
    source: "campgrounds",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#70e000",
      "circle-radius": 4,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": "#fff",
    },
  });

  // inspect a cluster on click
  map.on("click", "clusters", (e) => {
    const features = map.queryRenderedFeatures(e.point, {
      layers: ["clusters"],
    });
    const clusterId = features[0].properties.cluster_id;
    map
      .getSource("campgrounds")
      .getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: zoom,
        });
      });
  });

  map.on("click", "unclustered-point", (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const mag = e.features[0].properties.mag;
    const tsunami = e.features[0].properties.tsunami === 1 ? "yes" : "no";
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(`magnitude: ${mag}<br>Was there a tsunami?: ${tsunami}`)
      .addTo(map);
  });

  map.on("mouseenter", "clusters", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "clusters", () => {
    map.getCanvas().style.cursor = "";
  });
});
```

7. Adding virtual to campground schema
8. Virtuals are not included in the JSON if we stringify the campground data. So we have to add an option, which tells mongo to allow virtuals in json if stringify. (#1.1, #1.2)

models/campground.js

```javascript
// #8
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
   ...},
   // 8
  opts
);

// #7
CampgroundSchema.virtual("properties.popUpMarkUp").get(function () {
  return `<a href= "/campgrounds/${this._id}" >${this.title}</>`;
});
```

---

### **Basic Security**

##### [Start](#)

<br>

1. Mongo SQL injection
2.

---

#### Mongo SQL injection

##### [Start](#) / [Basic Security](#basic-security)

<br>

This will prevent insertion of $ or . in queries and params from client side.
[express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize)

    npm i express-mongo-sanitize

1. Import
2. Use mongoSanitize() middleware on every routes.

app.js

```javascript
// #1
const mongoSanitize = require("express-mongo-sanitize");
...
// #2
app.use(mongoSanitize());
```

---

### **Errors during development**

##### [Start](#)

<br>

1. [Cannot read property 'push' of undefined](#e1)
2. [TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined](#e2)
3. [TypeError [ERR_INVALID_ARG_VALUE]: The argument 'id' must be a non-empty string. Received ''](#e3)
4. [NO ERROR JUST BLANK, during image upload to cloudinary with multer middleware](#e4)

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

#### E4

##### [Start](#) / [More Errors](#errors-during-development)

<br>

No error indication nor console messages. Happened during the image upload to cloudinary with multer middleware.

**Causes:**

Potential causes:

1. Typos in cloudinary.config from cloudinary/index.js

cloudinary/index.js

```javascript
// Make sure these are correct
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});
```

2. Typos in .env
   > Check each of these from cloudinary dashboard

.env

```env

CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_KEY=key
CLOUDINARY_SECRET=secret
```

3. .env file must be in top-level of the app, root dir.

4. Missing the entire enviroment check and import of dotenv in main app.js.

app.js

```javascript
// CHECK
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// CHECK

const express = require("express");
...
```

5. Check the curly braces in multer()

routes/campgrounds.js

```javascript
// Right
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// Wrong
const { storage } = require("../cloudinary");
const upload = multer(storage);

// Wrong
const storage = require("../cloudinary");
const upload = multer({ storage });
```

---

### Tips

##### [Start](#)

You can research on how to limit the image upload size with multer online and try to implement solutions there (so the user cannot upload images with large file sizes), for example: https://stackoverflow.com/questions/34697502/how-to-limit-the-file-size-when-uploading-with-multer

Be sure to also research how to limit file upload size with Node.js (and Express.js) to investigate more potential options.

You can also look into image file upload size validation on the frontend too: https://www.geeksforgeeks.org/validation-of-file-size-while-uploading-using-javascript-jquery/

https://stackoverflow.com/a/3717847

However, sometimes the user might be patient if they are uploading large-size images, since it can also depend on the user's internet connection, as mentioned above.

You could also research how to resize an image with frontend JS before submit, for example: https://stackoverflow.com/questions/23945494/use-html5-to-resize-an-image-before-upload

You could also look into using the Cloudinary API to resize large images after upload, to make them smaller perhaps: https://cloudinary.com/documentation/image_transformations

Please let us know if you have any other questions!

You can also discuss these topics in the course community Discord server: https://discord.gg/CUga7jX

#### TODOs

<!-- TODO: Mapbox token not working with seperate script   -->
