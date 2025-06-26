# Release Log

## [1.0.0] - 2025-06-25
### Added
- Full purchase order management system with desktop and mobile views.
- Inventory and stock movement tracking.
- Role-level security (RLS) for purchase orders and items.
- Dialogs for adding and receiving purchase orders.
- Semantic sorting and filtering for purchase orders.
- Migrations for database schema updates:
  - Added min/max/reorder levels to products.
  - Created stock movements table.
  - Split quantity columns for better tracking.
- Supabase functions for tracking material movements.
- Documentation:
  - Guide for creating Supabase tables.
  - Receiving purchase orders guide.
  - Inventory function specifications.
  - Prevention of negative stock guide.

### Changed
- Improved mobile responsiveness for purchase order management.
- Enhanced error handling and defensive programming in mobile views.

### Fixed
- Resolved hook order issues in mobile components.
- Prevented runtime errors in `GeneralTableMobile` component.

## [1.1.0] - 2025-06-26
### Fixed
- Corrected YAML syntax in the `run-tests` GitHub Actions workflow to resolve CI pipeline errors.

---

This marks the initial release of the purchase order and inventory management system.
