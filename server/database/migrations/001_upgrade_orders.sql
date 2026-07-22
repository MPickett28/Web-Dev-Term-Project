USE terraria_arsenal;

-- Upgrade the existing orders table without discarding any order records.
//ALTER TABLE orders
    CHANGE COLUMN order_status status ENUM(
        'Submitted',
        'Processing',
        'Shipped',
        'Completed',
        'Cancelled'
    ) NOT NULL DEFAULT 'Processing',
    MODIFY COLUMN total_amount DECIMAL(12, 2) UNSIGNED NOT NULL,
    ADD COLUMN shipping_country VARCHAR(75) NULL
        AFTER shipping_postal_code,
    ADD COLUMN updated_at TIMESTAMP NOT NULL
        DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
        AFTER created_at;

-- Give pre-migration records a valid country before making the column required.
UPDATE orders
SET shipping_country = 'Unknown'
WHERE shipping_country IS NULL OR shipping_country = '';

ALTER TABLE orders
    MODIFY COLUMN shipping_country VARCHAR(75) NOT NULL;

-- Preserve the existing purchase price while adding immutable order snapshots.
ALTER TABLE order_items
    CHANGE COLUMN price_at_purchase unit_price
        DECIMAL(10, 2) UNSIGNED NOT NULL,
    ADD COLUMN product_name VARCHAR(100) NULL
        AFTER product_id,
    ADD COLUMN line_total DECIMAL(12, 2) UNSIGNED NULL
        AFTER quantity;

UPDATE order_items AS oi
INNER JOIN products AS p
    ON p.product_id = oi.product_id
SET
    oi.product_name = p.product_name,
    oi.line_total = oi.unit_price * oi.quantity
WHERE oi.product_name IS NULL OR oi.line_total IS NULL;

ALTER TABLE order_items
    MODIFY COLUMN product_name VARCHAR(100) NOT NULL,
    MODIFY COLUMN line_total DECIMAL(12, 2) UNSIGNED NOT NULL;

-- Supports newest-first account order history efficiently.
CREATE INDEX idx_orders_user_created_at
    ON orders(user_id, created_at);

DROP INDEX idx_orders_user ON orders;
