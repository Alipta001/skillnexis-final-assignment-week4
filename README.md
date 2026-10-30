# ShopWithMe

A small full-stack storefront built with React, Vite, Tailwind CSS, Express,
MongoDB and Mongoose. Customers can browse products, create an account, keep a
server-saved cart, check out with Cash on Delivery, and review their orders.
Administrators can manage products and order status.

## Requirements

- Node.js 18 or newer and npm
- MongoDB running locally or a MongoDB Atlas connection string

## Start the backend

```bash
cd final-project-week4/backend
npm install
cp .env.example .env
```

Set `MONGO_URI` and a long random `JWT_SECRET` in `backend/.env`, then run:

```bash
npm run dev
```

The API starts on `http://localhost:5000`. Check `GET /api/health`.

## Start the frontend

In another terminal:

```bash
cd final-project-week4/frontend
npm install
cp .env.example .env
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`. Set `VITE_API_URL` in
`frontend/.env` if the backend uses another address.

## Create an administrator

Public registration always creates a normal `user`; it ignores any submitted
role. Register the account through the app first, then promote that account
directly in MongoDB using an administrator-controlled shell:

```javascript
use week4_ecommerce
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

Sign out and sign back in to receive a token with the updated role. Do not add a
public admin-registration endpoint or commit secrets to source control.

## API overview

| Method            | Endpoint                | Access         | Purpose                              |
| ----------------- | ----------------------- | -------------- | ------------------------------------ |
| POST              | `/api/auth/register`    | Public         | Create a customer account            |
| POST              | `/api/auth/login`       | Public         | Sign in                              |
| GET               | `/api/auth/me`          | User           | Current account                      |
| GET               | `/api/products`         | Public         | List/search/filter products          |
| GET               | `/api/products/:id`     | Public         | Product details                      |
| POST, PUT, DELETE | `/api/products[/:id]`   | Admin          | Product management                   |
| GET, POST         | `/api/cart`             | User           | Read cart / add product              |
| PUT, DELETE       | `/api/cart/:productId`  | User           | Change quantity / remove item        |
| POST              | `/api/orders`           | User           | Place Cash on Delivery order         |
| GET               | `/api/orders/my-orders` | User           | Customer order history               |
| GET               | `/api/orders/:id`       | Owner or admin | Order details                        |
| GET               | `/api/admin/dashboard`  | Admin          | Product/order/customer totals        |
| GET               | `/api/admin/products`   | Admin          | Product management list              |
| GET               | `/api/admin/orders`     | Admin          | All orders                           |
| PUT               | `/api/admin/orders/:id` | Admin          | Change order status                  |
| POST              | `/api/uploads/image`    | Admin          | Upload product image (`image` field) |

Protected API calls use `Authorization: Bearer <token>`. Product images are
JPEG, PNG or WEBP, up to 5 MB. Uploaded files are served from `/uploads`.

## Testing with Postman

Import `postman/Field-and-Form.postman_collection.json`. Set the `baseUrl`
collection variable to the backend URL. Copy the JWT from login into the
`token` variable for protected calls.

## Notes

- The backend uses exactly four Mongoose models: User, Product, Cart and Order.
- Order totals are calculated from current database prices; frontend totals are
  for display only.
- Stock is checked when adding/updating cart items and reserved when an order
  is placed. Failed checkout attempts restore any stock already reserved.
- The application has no card processing; Cash on Delivery is the only method.
