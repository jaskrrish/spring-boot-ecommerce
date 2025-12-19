-- Migration to add product_url column to products table
-- This will add the column without losing existing data

ALTER TABLE products
ADD COLUMN product_url VARCHAR(500) NULL;

-- Optional: Add a comment to document the column
ALTER TABLE products
MODIFY COLUMN product_url VARCHAR(500) NULL 
COMMENT 'Optional URL for product image (Unsplash URLs recommended)';
