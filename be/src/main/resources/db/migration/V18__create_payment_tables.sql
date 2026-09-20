CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_code BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'VND',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_gateway VARCHAR(30) NOT NULL,
    item_type VARCHAR(50) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_code ON orders(order_code);

CREATE TABLE payment_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    gateway VARCHAR(30) NOT NULL,
    transaction_ref VARCHAR(100) NULL,
    amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    raw_payload LONGTEXT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_tx_order FOREIGN KEY (order_id) REFERENCES orders (id)
);

CREATE INDEX idx_tx_order ON payment_transactions(order_id);
CREATE INDEX idx_tx_ref ON payment_transactions(transaction_ref);