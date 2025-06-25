-- Migration: Rename quantity to quantity_ordered on purchaseorderitems

ALTER TABLE purchaseorderitems
  RENAME COLUMN quantity TO quantity_ordered;
