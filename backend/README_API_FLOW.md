# BiteWise — frontend handoff cheat sheet

## Global API client

Base URL: `http://localhost:8080`

Protected requests add:

`Authorization: Bearer <token>`

## Login

`POST /api/auth/login`

Response:

```json
{"token":"...","email":"owner@example.com","ownerName":"Priyan"}
```

## Dashboard

`GET /api/analytics/dashboard`

Useful UI mappings:
- `today.revenue` → Sales card
- `today.expenses` → Expenses card
- `today.profit` → Profit card
- `today.orders` → Orders card
- `trend` → revenue/profit line charts
- `topProducts` → best sellers/profit table
- `expenseBreakdown` → donut chart
- `insights` → insight cards

## Daily Update

On page open:

`GET /api/sales/daily?date=YYYY-MM-DD`

On save:

`POST /api/sales/daily`

On close:

`POST /api/sales/daily/{date}/close`

## Important UX rule

Do not make the user type selling price or cost every day. The product setup stores those values. Daily Update should mostly be quantity inputs, exactly as specified by the product brief.
