
# 📚 BookBazaar — Backend API Documentation

A Node.js + Express backend for an online bookstore. Features: JWT authentication, role-based access control, book CRUD, search, cart, reviews, orders (with pagination), and optional payment/email modules. A Postman collection is included in the repository for all request bodies and example calls.

----------

## 🚀 Features

- ✅ **CRUD for Books**  
- ✅ **Search books by title/author/genre/isbn**  
- ✅ **Add & fetch Reviews**  
- ✅ **Orders with optional Razorpay payment flow**  
- ✅ **API Key verification middleware for protected routes**  
- ✅ **JWT authentication**  
- ✅ **Postman collection included in Git repo**  

## 🛠️ Tech Stack

- **Backend**: Node.js, Express  
- **Database**: PostgreSQL (Drizzle ORM)  
- **Auth**: JWT  
- **Payment**: Razorpay (simulation)  

----------

## 🚀 Base URL

```

http://localhost:3000/api/v1

```

(All endpoints below are relative to `/api/v1`.)

----------

## 🔑 Authentication

-   **Login** returns a JWT which is stored as an HttpOnly cookie and also returned in the response.
    
-   Pass the JWT for protected endpoints in either:
    
    -   `Authorization: Bearer <token>` header
        
    -   OR the `token` cookie (HttpOnly).
        
-   Middleware used: `authMiddleware` (verifies jwt, sets `req.user`)
    
-   Role checks performed with `rbac(UserRole.Admin)` and `rbac(UserRole.Customer)` where required.
    

----------

## 📂 Routes (exact names as in your code)

### 🔐 Auth (`/api/v1/auth`)

-   `POST /auth/register` — Register a new user
    
-   `POST /auth/login` — Login (returns JWT cookie + token)
    
-   `GET /auth/me` — Get current user profile (requires auth)
    
-   `POST /auth/logout` — Logout (requires auth)
    

----------

### 📚 Books (`/api/v1/books`)

> **Important:** to avoid route collision, ensure `/books/search` is registered **before** `/books/get/:id` in your router.

-   `POST /books/add` — Add a new book (requires `authMiddleware`, `rbac(UserRole.Admin)`)
    
-   `PUT /books/update/:id` — Update a book by id (requires Admin)
    
-   `GET /books/getAll` — Get all books **(supports pagination: `page`, `limit`)**
    
-   `GET /books/get/:id` — Get single book by id
    
-   `GET /books/search` — Search books (supports query params `title`, `author`, `genre`, `isbn` **and** pagination `page`, `limit`)
    
-   `DELETE /books/delete/:id` — Delete a book by id (requires Admin)
    

----------

### 🛒 Cart (`/api/v1/cart`)

-   `POST /cart/add` — Add an item to cart (requires `authMiddleware`, `rbac(UserRole.Customer)`)
    
-   `PUT /cart/update/:id` — Update cart item (requires Customer)
    
-   `GET /cart/get` — Get cart items for logged-in user (requires Customer)
    
-   `DELETE /cart/remove/:id` — Remove item from cart (requires Customer)
    

----------

### ✍️ Reviews (`/api/v1/reviews`)

-   `POST /reviews/add/:bookId` — Add a review for a book (requires `authMiddleware`, `rbac(UserRole.Customer)`)
    
-   `GET /reviews/getAll` — Get all reviews (requires auth) — ensure this route is wired to the correct handler (e.g., `getAllReviews` or `getReviewsByBook`)
    
-   `PUT /reviews/update/:reviewId` — Update review (requires Customer + owner check)
    
-   `DELETE /reviews/remove/:reviewId` — Delete review (requires Customer + owner check)
    

> Note: the router must attach an actual handler to `/reviews/getAll` — do not leave the route as `router.route("/getAll").get(authMiddleware)` without a handler.

----------

### 📦 Orders (`/api/v1/orders`)

-   `POST /orders/place-order` — Place a new order (requires `authMiddleware`, `rbac(UserRole.Customer)`)
    
-   `PUT /orders/payment-verify` — Verify payment (requires Customer)
    
-   `GET /orders/get` — List logged-in user’s orders **(supports pagination: `page`, `limit`)** (requires Customer)
    
-   `GET /orders/get/:id` — Get order details by id (requires Customer + owner check)
    
-   `PUT /orders/cancel/:id` — Cancel an order (requires Customer + owner check)
    

----------



### ✉️ Email Service

-   Transactional emails (order confirmation, etc.) are present in the project, but email delivery depends on SMTP/provider configuration.
    

----------

## 📦 Pagination & Search Behavior

-   **Pagination query params**: `page` (default `1`), `limit` (default `10`)
    
-   Endpoints that support pagination:
    
    -   `GET /books/getAll`
        
    -   `GET /books/search` (search + pagination combined)
        
    -   `GET /orders/get` (user orders)
        
-   **Search query params** for `/books/search`: `title`, `author`, `genre`, `isbn` (server performs case-insensitive partial matches for title/author/genre; exact match for ISBN by default).
    

----------

## 🛡️ Security & Middleware

-   `authMiddleware` verifies JWT and sets `req.user = { id, email, role }`.
    
-   `rbac(UserRole.Admin)` protects admin-only routes (`/books/add`, `/books/update/:id`, `/books/delete/:id`).
    
-   `rbac(UserRole.Customer)` protects customer-only routes (cart, place-order, reviews).
    
-   Make sure input validation (`validateBody(schema)`) is attached to all `POST`/`PUT` routes as implemented in your project.
    

----------

## ⚙️ Setup & Run (local)

1.  Clone & install:
    

```bash
git clone https://github.com/vishal065/BookBazaar-masterji

cd BookBazaar-masterji/

npm install   

```

----------

**2.  Create `.env` and take the variable name from .env.sample and fill it:**

----------

3.  Development:
    

```bash

npm run dev

npm run build 

npm start

```


----------

## ☁️ Run

-   Ensure `build` produces `dist/index.js` and `start` runs `node dist/index.js`.
    
-   Render example settings:
    
    -   **Build Command:** `npm install && npm run build`
        
    -   **Start Command:** `npm start`
        
-   Confirm the entry file path in the environment (avoid `node index.js` if your built file is `dist/index.js`).
    

----------

## 📂 Postman Collection

A Postman collection is included in the repository (e.g., `postman/BookBazaar.postman_collection.json`). Import it to see all request bodies, headers, and example calls.

----------


## ⚠️ Notes

**Kindly avoid making excessive requests to the live link, as rate limiting has not been implemented in this project.**

Razorpay Payment, I can't simulate the Verify signature properly

I know it works something like this

crypto.createHmac('sha256', RAZORPAY_SECRET)

But it was creating an issue on verify, so I made changes in the workflow. u can check in the code

If anyone finds a solution to this, then let me know, although I have implemented this in real, but got stuck in simulating it

**I didn't create any Additional route for payment, it's included in the order route itself**

---

