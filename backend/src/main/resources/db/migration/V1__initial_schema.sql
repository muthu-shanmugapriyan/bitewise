CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    owner_name VARCHAR(120) NOT NULL,
    phone VARCHAR(40),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(160) NOT NULL,
    business_type VARCHAR(80) NOT NULL,
    location VARCHAR(255),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    opening_time TIME,
    closing_time TIME,
    operating_days VARCHAR(120),
    notification_method VARCHAR(30) DEFAULT 'NONE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon_key VARCHAR(80),
    UNIQUE (business_id, name)
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    name VARCHAR(160) NOT NULL,
    icon_key VARCHAR(80),
    selling_price NUMERIC(14,2) NOT NULL CHECK (selling_price >= 0),
    cost_price NUMERIC(14,2) NOT NULL CHECK (cost_price >= 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    order_count INTEGER NOT NULL DEFAULT 0 CHECK (order_count >= 0),
    closed BOOLEAN NOT NULL DEFAULT FALSE,
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (business_id, sale_date)
);

CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    selling_price NUMERIC(14,2) NOT NULL CHECK (selling_price >= 0),
    cost_price NUMERIC(14,2) NOT NULL CHECK (cost_price >= 0),
    UNIQUE (sale_id, product_id)
);

CREATE TABLE expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    UNIQUE (business_id, name)
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
    expense_date DATE NOT NULL,
    description VARCHAR(255),
    amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
    expense_type VARCHAR(30) NOT NULL DEFAULT 'VARIABLE',
    recurring BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    summary_date DATE NOT NULL,
    revenue NUMERIC(14,2) NOT NULL DEFAULT 0,
    product_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    operating_expenses NUMERIC(14,2) NOT NULL DEFAULT 0,
    gross_profit NUMERIC(14,2) NOT NULL DEFAULT 0,
    net_profit NUMERIC(14,2) NOT NULL DEFAULT 0,
    profit_margin NUMERIC(8,2) NOT NULL DEFAULT 0,
    order_count INTEGER NOT NULL DEFAULT 0,
    units_sold INTEGER NOT NULL DEFAULT 0,
    UNIQUE (business_id, summary_date)
);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL UNIQUE REFERENCES businesses(id) ON DELETE CASCADE,
    daily_summary BOOLEAN NOT NULL DEFAULT FALSE,
    weekly_report BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_report BOOLEAN NOT NULL DEFAULT FALSE,
    email_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    preferred_report_time TIME DEFAULT '21:30'
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    actor_user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80),
    entity_id UUID,
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_business ON products(business_id);
CREATE INDEX idx_sales_business_date ON sales(business_id, sale_date);
CREATE INDEX idx_expenses_business_date ON expenses(business_id, expense_date);
CREATE INDEX idx_audit_business_date ON audit_logs(business_id, created_at);
