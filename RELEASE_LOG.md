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

## [1.2.3] - 2025-07-01
**Project Structure & Import Path Fixes**
### Changed
- Migrated all source files under `src/` and updated import paths accordingly.
- Removed unused root-level `App.tsx` and consolidated entry point to `src/App.tsx`.
- Optimized Vite config to pre-bundle MUI icons and updated MUI packages to latest versions.
### Fixed
- Resolved blank screen and missing module errors by correcting file imports and paths.

**Mobile and Desktop Order List/Table UI Improvements**
### Fixed
- Corrected mobile menu positioning to always stay fixed at the bottom and prevent scrolling.
- Ensured mobile table content goes edge-to-edge with minimal padding.
- Added an order status chip to the top-right of each order card in the mobile view, aligned to the right without extra box styling.
- Verified that the desktop table view remains unchanged, with no unintended styling or chip additions.

## [1.2.1] - 2025-06-29
**Release Notes Consolidation & Layout Improvements**
### Changed
- Removed the `Header` component to eliminate the unwanted `joysheetroot` artifact.
- Began implementing a consistent page layout for desktop pages.

## [1.2.0] - 2025-06-29
**Purchase Order & Stock Movement Enhancements**
### Added
- None

### Changed
- The purchase order receive dialog now sends product UUIDs (not integer IDs) to the backend for all stock movement records.
- The backend API for receiving purchase orders now uses `movement_type: 'incoming'` to comply with the stock_movements table constraint.
- Success feedback for receiving a purchase order is now shown as a MUI Snackbar toast, auto-hiding after 3 seconds, instead of a blocking alert dialog.
- The frontend and backend now consistently use UUIDs for purchase order and product references in all stock movement workflows.
- Added mobile/desktop detection logic to the `/movements` route in `App.tsx` to render `PageMovementsMobile` on mobile devices and `PageMovementsDesktop` on larger screens.
- Updated `GeneralTable` component styling to align with `PageUsersDesktop` table layout.
- Reverted unnecessary `Card` wrapper in `GeneralTable` for consistent styling.

### Fixed
- Fixed a bug where the frontend sent integer product IDs instead of UUIDs, causing incorrect stock movement records.
- Fixed a backend error where an invalid `movement_type` value caused a constraint violation.

## [1.1.2] - 2025-06-27
**Mobile Dashboard Cleanup**
### Changed
- Removed the mobile header (white bar) from the dashboard page for a cleaner look.
- Removed unnecessary top padding from the dashboard on mobile.

### Fixed
- Dashboard content now aligns properly at the top on all screen sizes.

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
