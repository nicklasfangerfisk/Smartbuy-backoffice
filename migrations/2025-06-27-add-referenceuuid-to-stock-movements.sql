-- Migration: Add referenceuuid column to stock_movements table
ALTER TABLE stock_movements ADD COLUMN referenceuuid uuid;
