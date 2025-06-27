<!--
DEVELOPER INSTRUCTION: How to write release notes
- Do NOT render this section in the app.
- Each release entry must start with a version and date, e.g. ## [1.2.0] - YYYY-MM-DD
- Each entry must have a title line summarizing the main feature or change of that version.
- Use concise wording for all notes.
- Use sections Added, Changed, Fixed
- List items should be short and to the point.
- Place newest releases at the top.
-->

# Release Log

## [1.1.1] - 2025-06-27
**Settings Page UI & Integration**
### Added
- Responsive settings page with release log and app info (desktop & mobile).
- Sidebar navigation to settings page.
- Rounded corners for settings content areas (consistent with tables).
- Developer instructions for writing release notes.

### Changed
- Improved markdown rendering for release log using `marked` library.
- Updated README to clarify local dev workflow and HMR limitations.

## [1.1.0] - 2025-06-26
**CI Pipeline Stability**
### Fixed
- Corrected YAML syntax in the `run-tests` GitHub Actions workflow to resolve CI pipeline errors.

## [1.0.0] - 2025-06-25
**Initial Purchase Order & Inventory System**
### Added
- Purchase order management (desktop & mobile).
- Inventory and stock movement tracking.
- Role-level security (RLS) for purchase orders/items.
- Dialogs for adding and receiving purchase orders.
- Semantic sorting and filtering for purchase orders.
- Database migrations:
  - Min/max/reorder levels for products.
  - Stock movements table.
  - Split quantity columns for tracking.
- Supabase functions for material movements.
- Documentation:
  - Supabase table creation guide.
  - Receiving purchase orders guide.
  - Inventory function specs.
  - Negative stock prevention guide.

### Changed
- Improved mobile responsiveness for purchase orders.
- Enhanced error handling in mobile views.

### Fixed
- Resolved hook order issues in mobile components.
- Prevented runtime errors in `GeneralTableMobile`.

---

This marks the initial release of the purchase order and inventory management system.
