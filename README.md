# Wonderlust — Project Documentation

> **Visit here :** https://wanderlust-fqsj.onrender.com

> **Author:** Mrunal Jagtap  
> **Project Folder:** `44_MAJORPJ/`  
> **Runtime:** Node.js · Port `8080`  
> **Database:** MongoDB (`Wonderlust` database)

---

## 1. Project Overview

**Wonderlust** is a full-stack, server-rendered web application modelled after Airbnb. It allows users to **discover, create, edit, and delete travel accommodation listings** (holiday homes, villas, cabins, etc.) from around the world, and to **leave star-rated reviews** on those listings.

### Core Capabilities

| Feature | Description |
|---|---|
| **Listing CRUD** | Authenticated users can create, read, update, and delete property listings |
| **Image Upload** | Listing photos are uploaded directly to Cloudinary via Multer |
| **Interactive Map** | Each listing is geocoded via MapTiler and displayed on an interactive MapLibre GL map |
| **User Authentication** | Full signup / login / logout flow secured with Passport.js (local strategy) |
| **Session Management** | Server-side sessions with `express-session`; flash messages for UX feedback |
| **Reviews** | Logged-in users can post a 1–5 star rating + comment on any listing; only the review author can delete it |
| **Authorization Guards** | Only the listing owner can edit/delete their own listing; only the review author can delete their review |
| **Server-Side Validation** | All incoming form data is validated server-side with Joi before touching the database |
| **Database Seeding** | A one-shot seed script pre-populates 30 real-world listing samples with coordinates |

---

## 2. Folder Structure — Hierarchical Tree

```
Wonderlust/
└── 44_MAJORPJ/                    ← Project root (all source lives here)
    │
    ├── app.js                     ← Application entry point. Boots Express, wires all middleware
    │                                (session, passport, flash, method-override), mounts the three
    │                                routers, and starts the server on port 8080.
    │
    ├── middleware.js               ← Shared middleware functions: isLoggedIn, isOwner, isAuthor,
    │                                saveRedirectUrl, validatelisting, validatereviews.
    │
    ├── schema.js                   ← Joi validation schemas for Listing and Review payloads.
    │                                Used by middleware before any DB write.
    │
    ├── cloudconfig.js              ← Cloudinary SDK configuration + Multer-Cloudinary storage
    │                                adapter. Images are stored in the 'Wonderlust_DEV' folder.
    │
    ├── .env                        ← Environment secrets (not committed): CLOUD_NAME,
    │                                CLOUD_API_KEY, CLOUD_API_SECRET, MAP_KEY, NODE_ENV.
    │
    ├── Notes.txt                   ← Developer scratch notes.
    ├── package.json                ← NPM manifest; lists all dependencies and project metadata.
    ├── package-lock.json           ← Lockfile for reproducible installs.
    │
    ├── models/                     ← Mongoose schemas (MongoDB data layer)
    │   ├── Listing.js              ← Listing schema: title, description, price, image {url,
    │   │                             filename}, location, country, reviews[], owner ref, geometry
    │   │                             (GeoJSON Point). Post-delete hook cascades review deletion.
    │   ├── reviews.js              ← Review schema: comment, rating (1-5), createdAt, author ref.
    │   └── user.js                 ← User schema: email field only. passport-local-mongoose plugin
    │                                 auto-adds username, hashed password, and salt; also attaches
    │                                 authenticate(), serializeUser(), deserializeUser() statics.
    │
    ├── routers/                    ← Express Router modules (thin, delegate to controllers)
    │   ├── listing.js              ← Routes for /listing — GET index, GET/POST new, GET/PUT/DELETE /:id
    │   │                             Applies isLoggedIn, isOwner, Multer upload, validatelisting guards.
    │   ├── review.js               ← Routes for /listing/:id/reviews — POST / (add), DELETE /:reviewID
    │   │                             Uses mergeParams:true to inherit :id from parent router.
    │   └── user.js                 ← Routes for /signup, /login, /logout. Passport.authenticate()
    │                                 is invoked inline on POST /login.
    │
    ├── controllers/                ← Business logic handlers (called by routers)
    │   ├── listing.js              ← index, addNewlisting, renderShowListing, renderEditForm,
    │   │                             updateListing, destroyListing. Geocodes location on create.
    │   ├── review.js               ← addReview (push to listing.reviews array + save both docs),
    │   │                             destroyReview ($pull from array + delete Review doc).
    │   └── user.js                 ← signupLoader, signup (User.register + req.login),
    │                                 renderLogin, login (redirect with flash), logout (req.logOut).
    │
    ├── utils/                      ← Reusable utility helpers
    │   ├── WrapAsync.js            ← Higher-order function that wraps any async route handler and
    │   │                             pipes Promise rejections to Express's next(err) automatically.
    │   └── ExpressError.js         ← Custom Error subclass that carries a statuscode property,
    │                                 consumed by the global error handler in app.js.
    │
    ├── init/                       ← Database seeding scripts (run once manually)
    │   ├── data.js                 ← Array of 30 sample listing objects with real coordinates,
    │   │                             prices, Unsplash image URLs, and GeoJSON Point geometry.
    │   └── index.js                ← Seed runner: clears the Listing collection, stamps each
    │                                 sample with a hardcoded owner ID, then inserts them all.
    │
    ├── public/                     ← Statically served client-side assets
    │   ├── css/
    │   │   ├── style.css           ← Custom global styles (card layout, footer, listing grid).
    │   │   └── rating.css          ← CSS-only star-rating widget styles.
    │   └── js/
    │       ├── script.js           ← Bootstrap form validation (client-side HTML5 constraint API).
    │       └── map.js              ← MapLibre GL map initialisation for the listing show page;
    │                                 reads geometry coordinates from a data attribute.
    │
    ├── views/                      ← EJS templates (rendered server-side by ejs-mate)
    │   ├── layouts/
    │   │   └── boilerplate.ejs     ← Master HTML shell. Injects Bootstrap 5, FontAwesome,
    │   │                             MapTiler SDK, Google Fonts (Plus Jakarta Sans), custom CSS,
    │   │                             and the script.js. All pages extend this layout.
    │   ├── includes/               ← Reusable EJS partials
    │   │   ├── navbar.ejs          ← Sticky Bootstrap navbar with search bar and conditional
    │   │   │                         Login/Signup/Logout links based on currUser local.
    │   │   ├── flash.ejs           ← Renders success/error flash message alerts.
    │   │   └── footer.ejs          ← Site footer partial.
    │   ├── Listings/               ← Page templates for the Listing resource
    │   │   ├── index.ejs           ← Listing grid / home page (card view of all listings).
    │   │   ├── show.ejs            ← Individual listing detail page: photo, map, reviews section.
    │   │   ├── new.ejs             ← Create new listing form.
    │   │   └── edit.ejs            ← Edit existing listing form (pre-filled).
    │   ├── users/                  ← Auth page templates
    │   │   ├── login.ejs           ← Login form.
    │   │   └── signup.ejs          ← Registration form.
    │   └── error.ejs               ← Generic error page, receives `message` from global handler.
    │
    ├── uploads/                    ← Local upload staging directory (used by Multer before
    │                                 sending to Cloudinary; typically empty after upload).
    │
    └── classroom/                  ← Exploratory / practice sub-project kept alongside main app
        ├── server.js               ← Standalone Express server for classroom exercises.
        ├── routers/
        │   ├── post.js             ← Practice router for post-related routes.
        │   └── user.js             ← Practice router for user-related routes.
        └── views/
            └── page.ejs            ← Single practice EJS page.
```

---

## 3. Component Breakdown

### 3.1 Authentication System

Authentication is built entirely around **Passport.js with the Local Strategy** and **passport-local-mongoose**.

#### Flow Diagram

```
Browser                     Express (app.js)              Passport / MongoDB
  │                               │                              │
  │── POST /signup ──────────────►│                              │
  │                         User.register(newUser, password) ──►│ hashes pw → saves User doc
  │                         req.login(registeredUser) ──────────►│ serialize → session cookie
  │◄── redirect /listing ─────────│                              │
  │
  │── POST /login ───────────────►│                              │
  │                         saveRedirectUrl middleware           │
  │                         passport.authenticate('local') ─────►│ verify username+hash
  │                              ├── success: userController.login│
  │◄── redirect (original URL) ───│                              │
  │
  │── GET /logout ───────────────►│                              │
  │                         req.logOut() → clears session        │
  │◄── redirect /listing ─────────│                              │
```

#### Key Files

| File | Role |
|---|---|
| `models/user.js` | Defines `UserSchema` with an `email` field. The `passport-local-mongoose` plugin auto-adds `username`, a hashed `password` (stored as `hash`+`salt`), and static methods: `User.register()`, `User.authenticate()`, `User.serializeUser()`, `User.deserializeUser()`. |
| `app.js` (lines 96–108) | Initialises Passport, registers the Local Strategy using `User.authenticate()`, and configures serialize/deserialize to persist the user's `_id` in the session. |
| `routers/user.js` | Maps HTTP verbs to controller handlers. `POST /login` runs `saveRedirectUrl` first (saves the protected URL the user was trying to reach), then `passport.authenticate('local', ...)` inline — Passport handles the credential check itself. |
| `controllers/user.js` | `signup`: calls `User.register()` then `req.login()` to auto-log-in after registration. `login`: reads `res.locals.redirectUrl` to send the user back to where they came from. `logout`: calls `req.logOut()` (Passport v0.6+) which destroys the session. |
| `middleware.js` → `isLoggedIn` | Guards protected routes. If `req.isAuthenticated()` is false, it saves `req.originalUrl` into the session and redirects to `/login`. |
| `middleware.js` → `saveRedirectUrl` | Copies the session's `redirectUrl` into `res.locals` so it survives the Passport redirect cycle. |

#### Session Configuration (`app.js` lines 77–93)

```js
// Session cookie lives for 7 days
cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge:  7 * 24 * 60 * 60 * 1000,
    httpOnly: true,    // prevents JS access to the cookie
}
```

> [!NOTE]
> The session secret (`"HiddesSession"`) is currently hardcoded. In production this should be moved to `process.env.SESSION_SECRET`.

---

### 3.2 Mongoose Schemas

#### `Listing` Schema (`models/Listing.js`)

```
Listing
├── title          : String  (required)
├── description    : String
├── price          : Number  (default 0; setter converts empty string → 0)
├── image
│   ├── url        : String  (default: Unsplash fallback image; setter converts "" → default)
│   └── filename   : String  (default: "listingimage")
├── location       : String
├── country        : String
├── reviews        : [ObjectId → Review]   (array of references)
├── owner          : ObjectId → User        (single reference)
└── geometry       : GeoJSON Point { type: "Point", coordinates: [lng, lat] }
```

**Notable Design Decisions:**

- **Cascade Delete Hook** (`ListingSchema.post("findOneAndDelete", ...)`): When a listing is deleted via `findOneAndDelete`, the hook automatically calls `Review.deleteMany({ _id: { $in: listing.reviews } })`, preventing orphaned review documents.
- **Image Setter**: The `set` function on `image.url` gracefully handles empty strings from HTML form submissions by substituting the default Unsplash URL.
- **GeoJSON Geometry**: The `geometry` field stores a MapTiler-geocoded coordinate pair, enabling map rendering on the show page.

---

#### `Review` Schema (`models/reviews.js`)

```
Review
├── comment    : String
├── rating     : Number  (min: 1, max: 5)
├── createdAt  : Date    (default: Date.now())
└── author     : ObjectId → User
```

Reviews are **embedded by reference** inside `Listing.reviews[]`. This means the listing document holds an array of `ObjectId`s pointing to separate `Review` documents — the standard "reference" pattern rather than full embedding.

---

#### `User` Schema (`models/user.js`)

```
User (base schema)
└── email : String (required)

+ passport-local-mongoose auto-adds:
    ├── username : String (unique)
    ├── hash     : String  (PBKDF2 hash of the password)
    └── salt     : String  (random salt for hashing)
```

The plugin also attaches:
- `User.register(user, password)` — creates a new user and hashes the password
- `User.authenticate()` — returns a Passport-compatible verify function
- `User.serializeUser()` / `User.deserializeUser()` — session serialization helpers

---

### 3.3 Review Logic

#### Adding a Review

**Route:** `POST /listing/:id/reviews`  
**Guards:** `isLoggedIn` → `validatereviews` → `WrapAsync(reviewController.addReview)`

```
1. Retrieve the parent Listing by :id
2. Construct a new Review document from req.body.review
3. Stamp newReview.author = req.user._id  (logged-in user)
4. Push the new Review's _id into listing.reviews[]
5. Save both documents independently (newReview.save(), listing.save())
6. Flash "Review Added Successfully"
7. Redirect to /listing/:id
```

#### Deleting a Review

**Route:** `DELETE /listing/:id/reviews/:reviewID`  
**Guards:** `isLoggedIn` → `isAuthor` → `WrapAsync(reviewController.destroyReview)`

```
1. isAuthor middleware: find Review by :reviewID, compare review.author._id
   to res.locals.currUser._id — block if not the author
2. Use MongoDB $pull operator to remove :reviewID from Listing.reviews[]
3. Call Review.findByIdAndDelete(:reviewID) to remove the Review document
4. Flash "Review Deleted Successfully"
5. Redirect to /listing/:id
```

> [!IMPORTANT]
> Review deletion when a **listing itself** is deleted is handled by the `post("findOneAndDelete")` hook on the `Listing` model — **not** inside the review controller. This cleanly separates concerns.

---

### 3.4 Listing Logic

#### Key Operations

| Operation | Route | Guards | Notes |
|---|---|---|---|
| Index | `GET /listing` | — | Fetches all listings with `Listing.find({})` |
| Show | `GET /listing/:id` | — | Deep-populates reviews→author and owner |
| New Form | `GET /listing/new` | `isLoggedIn` | Renders the create form |
| Create | `POST /listing` | `isLoggedIn`, Multer, `validatelisting` | Geocodes location via MapTiler; saves image to Cloudinary |
| Edit Form | `GET /listing/:id/edit` | `isLoggedIn`, `isOwner` | Transforms Cloudinary URL with crop transform for preview |
| Update | `PUT /listing/:id` | `isLoggedIn`, `isOwner`, Multer, `validatelisting` | Conditionally replaces image only if a new file was uploaded |
| Delete | `DELETE /listing/:id` | `isLoggedIn`, `isOwner` | Triggers cascade review deletion via model hook |

---

### 3.5 Middleware Architecture

All shared guards live in `middleware.js` and are composed onto routes as needed:

| Middleware | Purpose |
|---|---|
| `isLoggedIn` | Blocks unauthenticated access; saves the original URL for post-login redirect |
| `saveRedirectUrl` | Moves `req.session.redirectUrl` → `res.locals.redirectUrl` (survives Passport's internal redirect) |
| `isOwner` | Fetches the listing and compares `listing.owner._id` to `currUser._id` |
| `isAuthor` | Fetches the review and compares `review.author._id` to `currUser._id` |
| `validatelisting` | Runs Joi's `ListingSchema.validate(req.body)`; throws `ExpressError(400)` on failure |
| `validatereviews` | Runs Joi's `ReviewsSchema.validate(req.body)`; throws `ExpressError(400)` on failure |

**Global error handling** (`app.js` lines 154–158): A single `(err, req, res, next)` handler at the end of the middleware chain catches all errors forwarded via `next(err)` (or thrown inside `WrapAsync`) and renders `error.ejs` with the appropriate status code and message.

---

## 4. Technology Stack

### Core Framework

| Technology | Version | Role |
|---|---|---|
| **Node.js** | — | JavaScript runtime |
| **Express.js** | `^4.22.1` | HTTP server, routing, middleware pipeline |

### Templating

| Technology | Version | Role |
|---|---|---|
| **EJS** | `^5.0.1` | Server-side HTML templating |
| **ejs-mate** | `^4.0.0` | Layout/partial system for EJS (like `extends` in Pug) |

### Database

| Technology | Version | Role |
|---|---|---|
| **MongoDB** | — | NoSQL document database (local instance on port 27017) |
| **Mongoose** | `^9.3.2` | ODM — schema definition, validation, query building |

### Authentication & Sessions

| Technology | Version | Role |
|---|---|---|
| **Passport.js** | `^0.7.0` | Authentication middleware framework |
| **passport-local** | `^1.0.0` | Username/password (local) authentication strategy |
| **passport-local-mongoose** | `^9.0.1` | Mongoose plugin — hashing, salting, Passport integration |
| **express-session** | `^1.19.0` | Server-side session storage |
| **connect-flash** | `^0.1.1` | Flash message system (one-time session messages) |
| **cookie-parser** | `^1.4.7` | Cookie parsing middleware |

### File Upload & Cloud Storage

| Technology | Version | Role |
|---|---|---|
| **Multer** | `^2.1.1` | `multipart/form-data` parsing; handles file uploads |
| **Cloudinary** | (via cloudconfig) | Cloud image storage and transformation CDN |
| **multer-storage-cloudinary** | (via cloudconfig) | Multer storage adapter that streams files directly to Cloudinary |

### Maps & Geocoding

| Technology | Version | Role |
|---|---|---|
| **@maptiler/client** | `^3.0.1` | Server-side geocoding API (forward geocoding of location strings) |
| **@maptiler/sdk** | `^4.0.1` | CDN-loaded client SDK (referenced in boilerplate.ejs) |
| **maplibre-gl** | `^5.23.0` | Open-source WebGL map renderer (used in `public/js/map.js`) |

### Validation

| Technology | Version | Role |
|---|---|---|
| **Joi** | `^18.1.1` | Server-side data schema validation (listing and review payloads) |

### Utilities

| Technology | Version | Role |
|---|---|---|
| **method-override** | `^3.0.0` | Enables PUT/DELETE via `?_method=PUT` in HTML forms |
| **dotenv** | `^17.4.1` | Loads `.env` variables into `process.env` in non-production mode |

### Frontend (CDN-loaded)

| Technology | Role |
|---|---|
| **Bootstrap 5.3.3** | Responsive grid, navbar, cards, forms, modals |
| **Font Awesome 6.6.0** | Icons (compass, magnifying glass, etc.) |
| **Google Fonts — Plus Jakarta Sans** | Primary UI typeface |

---

## 5. Data Flow Summary

```
Browser Request
      │
      ▼
Express Router (routers/*.js)
      │  applies: isLoggedIn / isOwner / isAuthor / Multer / Joi validation
      ▼
Controller (controllers/*.js)
      │  orchestrates: Mongoose queries, MapTiler geocoding, Cloudinary upload result
      ▼
Mongoose Model (models/*.js)
      │  reads/writes: MongoDB "Wonderlust" database
      ▼
Response: res.render(view, data)  →  EJS + ejs-mate  →  HTML → Browser
```
