# Terraria Arsenal API

## Run locally

1. Copy `.env.example` to `.env` and enter the MySQL credentials.
2. Install dependencies with `npm install`.
3. Start the API with `npm run dev`.

The default base URL is `http://localhost:5000/api`.

## Authentication

### Register

`POST /api/auth/register`

```json
{
  "firstName": "Terra",
  "lastName": "Hero",
  "email": "hero@example.com",
  "password": "at-least-8-characters",
  "confirmPassword": "at-least-8-characters"
}
```

### Login

`POST /api/auth/login`

```json
{
  "email": "hero@example.com",
  "password": "at-least-8-characters"
}
```

Login returns a JWT that expires after two hours. Send it to protected endpoints
with `Authorization: Bearer YOUR_TOKEN`.

## Account management

- `GET /api/users/me` returns the authenticated user's profile.
- `PUT /api/users/me` updates the authenticated user's first and last name.

To optionally change the password with `PUT /api/users/me`, include
`currentPassword`, `newPassword`, and a matching `confirmPassword`. The name
fields are always required.

## Orders

All order endpoints require `Authorization: Bearer YOUR_TOKEN`.

- `POST /api/orders` creates an order.
- `GET /api/orders` lists the authenticated user's orders newest first.
- `GET /api/orders/:id` returns one owned order with shipping and item details.

Apply the existing-database migration once before using these endpoints:

```text
database/migrations/001_upgrade_orders.sql
```

Create-order request:

```json
{
  "items": [
    { "productId": 1, "quantity": 1 },
    { "productId": 3, "quantity": 2 }
  ],
  "shipping": {
    "name": "Terra Hero",
    "address": "1 Forest Road",
    "city": "Spawn Point",
    "region": "NL",
    "postalCode": "A1A 1A1",
    "country": "Canada"
  }
}
```

Order creation reads current names, prices, and inventory from MySQL, locks the
selected products, creates the order and item snapshots, and decrements stock in
one transaction. The older `POST /api/orders/checkout` path remains available as
an alias for compatibility.
