# Kitchen API

A production-grade RESTful API for a restaurant management platform called **Kitchen**, built as a backend work sample. Kitchen serves two consumers — **Vendors** who manage their menus, and **Customers** who browse and discover restaurants.

**Live URL:** https://kitchen-api-production-b213.up.railway.app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express.js |
| Database | PostgreSQL |
| Query Builder | Knex.js |
| Cache | Redis (ioredis) |
| Auth | JWT (access + refresh tokens) |
| Validation | Zod |
| Containerization | Docker + Docker Compose |
| Deployment | Railway |

---

## Architecture

The codebase follows a strict **Controller → Service → Repository** separation:

- **Controllers** — handle HTTP concerns only: parse request, trigger validation, send response
- **Services** — own all business logic and policy decisions
- **Repositories** — own all database access; nothing else touches Knex directly

This makes each layer independently testable and mirrors the architecture used in production fintech systems.

### Key Design Decisions

**UUIDs over auto-increment IDs**
All primary keys are UUIDs generated at the database level. This prevents record count leakage through sequential IDs in public URLs — standard practice in production APIs.

**Money stored in kobo (lowest denomination)**
Prices are stored as integers in kobo (₦1,500 = `150000`). This eliminates floating point arithmetic errors that compound across high-volume transactions.

**Vendor authentication via `x-vendor-id` header**
Vendors are pre-seeded (no signup flow required per spec). Each vendor request passes their UUID via `x-vendor-id`. The middleware validates the UUID format, verifies the vendor exists and is active in the database, then attaches the vendor context to the request. All menu mutations use a compound `WHERE id = :itemId AND vendor_id = :vendorId` clause to enforce strict multi-tenant isolation — a vendor can never mutate another vendor's data.

**JWT access + refresh token pair with rotation**
Customers receive a short-lived access token (15 minutes) and a long-lived refresh token (7 days). Refresh tokens are stored in the database and validated on every use. On refresh, the old token is revoked and a new pair is issued — token rotation prevents replay attacks from stolen refresh tokens.

**Redis caching with SCAN-based invalidation**
Read-heavy customer endpoints (`GET /vendors`, `GET /vendors/:id`, `GET /vendors/:id/menu`) are cached in Redis with a 5-minute TTL. Cache keys are namespaced by vendor UUID. Any write to a vendor's menu triggers surgical invalidation scoped to that vendor — no full cache flushes. The `SCAN` command is used instead of `KEYS` for pattern-based invalidation to avoid blocking Redis on large keyspaces.

**Rate limiting backed by Redis**
Auth endpoints are limited to 10 requests per 15 minutes. All other endpoints are limited to 60 requests per minute. Rate limit state is stored in Redis rather than in-process memory — this ensures limits are enforced correctly across multiple container instances behind a load balancer.

**Edge-to-Edge Request Tracing**
Every incoming HTTP request is intercepted at the perimeter by custom tracing middleware that assigns a unique tracking hash via crypto.randomUUID(). This correlation ID is explicitly injected into runtime logs, execution flows, and the global error-handling framework. If an unexpected 500 Server Error occurs, the internal system stack trace is protected for safety, but the unique requestId is bubbled back in the response. This gives support teams or developers a concrete, non-leak diagnostic key to query log aggregators..

**Defensive middleware ordering**
Rate limiters are placed before authentication middleware on all routes. This ensures expensive operations (database vendor lookup, JWT cryptographic verification) only run on traffic that has already passed the rate limit check — preventing connection pool exhaustion and CPU lock-up under malicious flood traffic.

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Redis
- Docker (optional)

### Local Setup

```bash
# Clone the repository
git clone https://github.com/blvckbill/kitchen-api.git
cd kitchen-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Run migrations
npm run migrate

# Seed the database (3 vendors with menu items)
npm run seed

# Start the development server
npm run dev
```

### Docker Setup

```bash
# Build and start all services (API + Redis)
docker compose up --build
```

The API connects to your local PostgreSQL instance via `host.docker.internal`. Ensure Postgres is running locally before starting Docker.

---

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kitchen_db
DB_USER=postgres
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Production
DATABASE_URL=     # injected by Railway
REDIS_URL=        # injected by Railway
```

---

## API Reference

All responses follow a consistent shape:

```json
{
  "success": true,
  "message": "Description of result",
  "data": {},
  "requestId": "uuid"
}
```

Prices are returned in Naira. Divide by 100 for display value (e.g. `150000` = ₦1,500.00).

---

### Customer Auth

#### Register
```
POST /api/customer/auth/register
```

**Request:**
```json
{
  "name": "Wale Bakre",
  "email": "wale@example.com",
  "password": "Test@1234",
  "phone": "+2348012345678"
}
```

**Response `201`:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "customer": {
      "id": "uuid",
      "name": "Wale Bakre",
      "email": "wale@example.com",
      "phone": "+2348012345678",
      "created_at": "2026-06-24T10:32:32.180Z"
    },
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

---

#### Login
```
POST /api/customer/auth/login
```

**Request:**
```json
{
  "email": "wale@example.com",
  "password": "Test@1234"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "customer": { "id": "uuid", "name": "Wale Bakre", "email": "wale@example.com" },
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

---

#### Refresh Token
```
POST /api/customer/auth/refresh
```

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  }
}
```

---

#### Logout
```
POST /api/customer/auth/logout
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### Customer Browsing

All browsing endpoints require `Authorization: Bearer <access_token>`.

#### List Vendors
```
GET /api/customer/vendors
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Vendors retrieved",
  "data": [
    {
      "id": "uuid",
      "name": "Mama Put Kitchen",
      "description": "Authentic Nigerian home cooking",
      "address": "Lagos Island, Lagos",
      "phone": "+2348012345678",
      "email": "mamapat@kitchen.com",
      "created_at": "2026-06-24T07:31:01.595Z"
    }
  ]
}
```

---

#### Get Vendor
```
GET /api/customer/vendors/:id
```

**Response `200`:** Single vendor object.

**Response `404`:**
```json
{
  "success": false,
  "message": "Vendor not found",
  "error": "not_found"
}
```

---

#### List Vendor Menu Items
```
GET /api/customer/vendors/:id/menu
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Menu items retrieved",
  "data": [
    {
      "id": "uuid",
      "vendor_id": "uuid",
      "name": "Jollof Rice",
      "description": "Party-style jollof rice with smoky base",
      "price": 150000,
      "category": "Rice",
      "is_available": true,
      "created_at": "2026-06-24T07:31:01.595Z"
    }
  ]
}
```

---

#### Get Menu Item
```
GET /api/customer/vendors/:id/menu/:itemId
```

**Response `200`:** Single menu item object.

---

### Vendor Menu Management

All vendor endpoints require `x-vendor-id: <vendor_uuid>` header.

#### List My Menu Items
```
GET /api/vendor/menu
```

**Response `200`:** Array of menu items belonging to the authenticated vendor.

---

#### Create Menu Item
```
POST /api/vendor/menu
```

**Request:**
```json
{
  "name": "Amala and Ewedu",
  "description": "Classic Yoruba dish with gbegiri and assorted meat",
  "price": 180000,
  "category": "Swallow",
  "is_available": true
}
```

**Response `201`:** Created menu item object.

---

#### Update Menu Item
```
PATCH /api/vendor/menu/:id
```

**Request (partial update):**
```json
{
  "price": 200000,
  "is_available": false
}
```

**Response `200`:** Updated menu item object.

**Response `404`:** Returned if item does not exist or belongs to a different vendor.

---

#### Delete Menu Item
```
DELETE /api/vendor/menu/:id
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Menu item deleted",
  "data": null
}
```

**Response `404`:** Returned if item does not exist or belongs to a different vendor.

---

## Database Schema

```
vendors
  id            uuid PK
  name          varchar(255) UNIQUE
  description   text
  address       varchar(255)
  phone         varchar(20)
  email         varchar(255) UNIQUE
  is_active     boolean
  created_at    timestamp
  updated_at    timestamp

menu_items
  id            uuid PK
  vendor_id     uuid FK → vendors.id CASCADE
  name          varchar(255)
  description   text
  price         integer (kobo)
  category      varchar(100)
  is_available  boolean
  created_at    timestamp
  updated_at    timestamp

customers
  id            uuid PK
  name          varchar(255)
  email         varchar(255) UNIQUE
  password      varchar(255) (bcrypt)
  phone         varchar(20)
  created_at    timestamp
  updated_at    timestamp

refresh_tokens
  id            uuid PK
  customer_id   uuid FK → customers.id CASCADE
  token         varchar(500) UNIQUE
  is_revoked    boolean
  expires_at    timestamp
  created_at    timestamp
  updated_at    timestamp
```

---