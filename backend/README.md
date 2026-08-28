# BiteWise Backend — MVP

Backend for **BiteWise**, a simple business assistant for small food businesses. This implementation follows the supplied product specification: set up once, record daily quantities/expenses quickly, then calculate revenue, cost, profit, margins and analytics automatically. fileciteturn0file0L15-L36

## What is implemented

### MVP
- JWT registration/login
- One business profile per account
- Tenant isolation: every business-owned query is scoped to the authenticated business
- Product categories and products
- Selling price, cost price, unit profit and margin
- Daily sales entry by product quantity
- Daily order count
- Daily expense entry and expense categories
- Close-day action
- Automatic daily summary calculations
- Dashboard data
- Daily/weekly/monthly/custom-range analytics
- Product performance analytics
- Expense breakdown analytics
- Deterministic business insights (no AI)
- Notification preferences
- Mock notification abstraction for future email delivery
- Flyway PostgreSQL migrations
- Docker Compose PostgreSQL
- CORS for local React development

The MVP scope deliberately follows the source plan: inventory, low-stock alerts, real email delivery and advanced analytics are left for the next phase. fileciteturn0file0L1339-L1367

## Architecture

```text
React UI
   |
   | JSON + Bearer JWT
   v
Spring Boot REST API
   |
   +-- Controllers
   +-- Services / business rules
   +-- DTOs
   +-- Repositories (Spring Data JPA)
   +-- Security (JWT + BCrypt)
   +-- Flyway migrations
   v
PostgreSQL
```

This follows the requested Controller → Service → Repository → PostgreSQL structure and keeps business calculations in the backend. fileciteturn0file0L1135-L1165

## Requirements
- Java 25
- Maven 3.9+
- Docker Desktop (recommended for local PostgreSQL)

## Start PostgreSQL

```bash
docker compose up -d postgres
```

Default local DB:
- database: `bitewise`
- username: `bitewise`
- password: `bitewise`
- port: `5432`

For anything beyond local development, change these credentials.

If you ever see `password authentication failed for user "bitewise"`, the Postgres
data volume was likely created earlier with different credentials. Reset it with:

```bash
docker compose down -v
docker compose up -d postgres
```

## Configure

The backend reads configuration from a `.env` file in this folder automatically —
`BiteWiseApplication` loads it into system properties at startup, so it works the
same whether you run via Maven, an IDE, `run.sh` (macOS/Linux) or `run.bat`
(Windows). No manual `source .env` step is required. Just make sure `.env` matches
your Postgres credentials:

```text
DB_URL=jdbc:postgresql://localhost:5432/bitewise
DB_USERNAME=bitewise
DB_PASSWORD=bitewise
JWT_SECRET=long-random-secret
JWT_EXPIRATION_MINUTES=1440
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

Never commit real secrets.

## Run

macOS/Linux:

```bash
./run.sh
```

Windows:

```bat
run.bat
```

Or directly with Maven on any OS (the `.env` file is picked up automatically):

```bash
mvn spring-boot:run
```

API starts on `http://localhost:8080`.

Health check:

```text
GET /actuator/health
```

## Frontend integration flow

1. Registration returns a JWT.
2. Store the JWT in the frontend auth state.
3. Send it on every protected request:

```http
Authorization: Bearer <JWT>
```

4. Load `/api/business` and `/api/products` after login.
5. Keep a fixed, highly visible **Daily Update** button in the UI.
6. Daily Update calls `GET /api/sales/daily?date=YYYY-MM-DD` to preload today's quantities.
7. When the owner saves, call `POST /api/sales/daily`.
8. Add extra expenses through `POST /api/expenses`.
9. Close the day through `POST /api/sales/daily/{date}/close`.
10. Dashboard calls `GET /api/analytics/dashboard`.
11. Charts can directly consume `trend`, `topProducts`, and `expenseBreakdown`.
12. Reports use `/api/reports/*`.

This is intentionally designed around the user's desired workflow: the owner should mainly enter quantities and expenses while the backend calculates the business metrics. fileciteturn0file0L348-L409

## Core calculations

- Revenue = sum(selling price × quantity)
- Product cost = sum(cost price × quantity)
- Gross profit = revenue − product cost
- Net profit = gross profit − operating expenses
- Profit margin = net profit / revenue × 100
- Average order value = revenue / order count

These calculations are performed server-side. fileciteturn0file0L1244-L1276

## Main API

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Business
- `GET /api/business`
- `PUT /api/business`

### Products
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- `GET /api/products/categories`
- `POST /api/products/categories`

### Daily sales
- `GET /api/sales/daily?date=2026-08-18`
- `POST /api/sales/daily`
- `POST /api/sales/daily/2026-08-18/close`

### Expenses
- `GET /api/expenses?from=2026-08-01&to=2026-08-18`
- `POST /api/expenses`
- `GET /api/expenses/categories`
- `POST /api/expenses/categories`

### Analytics
- `GET /api/analytics/dashboard`
- `GET /api/analytics/daily?date=2026-08-18`
- `GET /api/analytics/weekly?end=2026-08-18`
- `GET /api/analytics/monthly?year=2026&month=8`
- `GET /api/analytics/range?from=2026-08-01&to=2026-08-18`

### Reports
- `GET /api/reports/daily?date=2026-08-18`
- `GET /api/reports/weekly?end=2026-08-18`
- `GET /api/reports/monthly?year=2026&month=8`
- `GET /api/reports/custom?from=2026-08-01&to=2026-08-18`

### Notifications
- `GET /api/notifications/preferences`
- `PUT /api/notifications/preferences`

## Example registration

```json
{
  "email": "owner@example.com",
  "password": "password123",
  "ownerName": "Priyan",
  "phone": "+91XXXXXXXXXX",
  "businessName": "Priyan's Street Bites",
  "businessType": "Food Truck",
  "location": "Vijayawada",
  "currency": "INR"
}
```

## Example product

```json
{
  "name": "Chicken Burger",
  "categoryId": null,
  "iconKey": "burger",
  "sellingPrice": 150,
  "costPrice": 75,
  "active": true
}
```

The backend calculates the unit profit and margin; the UI does not need to duplicate those rules.

## Example Daily Update

```json
{
  "date": "2026-08-18",
  "orderCount": 74,
  "items": [
    {"productId": "PRODUCT_UUID", "quantity": 35},
    {"productId": "ANOTHER_PRODUCT_UUID", "quantity": 22}
  ]
}
```

The UI only needs to ask the owner for quantities. The backend retains the product's selling/cost prices on the sale item so historical calculations do not silently change when a product price is edited later.

## Security / tenant isolation

The backend never trusts a business ID supplied by the browser for normal business operations. The business is resolved from the authenticated JWT user, and product/category/sale/expense queries are scoped to that business.

This is important because the product specification explicitly requires one business's sales, expenses, products, inventory and reports to remain inaccessible to another user. fileciteturn0file0L1059-L1079

## Important current limitation

The project is an MVP backend foundation, not the final production platform. In particular:
- no password-reset email flow yet
- no inventory tables/services yet
- no real email provider yet
- no PDF/Excel report renderer yet
- no multi-location support
- day reopening/edit workflow is intentionally not exposed yet
- scheduled notification worker is a placeholder until a real notification provider is selected

## Suggested next integration step

Once the UI is available, connect it in this order:

`Login → Business Setup → Products → Daily Update → Expenses → Close Day → Dashboard → Analytics → Reports`

That mirrors the incremental build order in the supplied specification. fileciteturn0file0L1371-L1429
