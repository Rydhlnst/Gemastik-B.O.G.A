-- Migration: Fix Purchase Orders Table with correct Foreign Key
DROP TABLE IF EXISTS Purchase_Orders;

CREATE TABLE Purchase_Orders (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL,
    sppg_id TEXT NOT NULL,
    total_amount DECIMAL(20, 2) NOT NULL,
    escrow_status TEXT DEFAULT 'ESCROW_HOLD',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES Vendors(id) -- SINKRON DENGAN TABEL JAMAK
);

CREATE INDEX IF NOT EXISTS idx_po_vendor_date ON Purchase_Orders(vendor_id, order_date);
