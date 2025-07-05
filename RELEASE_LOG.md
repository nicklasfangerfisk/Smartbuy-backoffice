<!--
DEVELOPER INSTRUCTION: How to write release notes
- Do NOT render this section in the app.
- Each release entry must start with a version, date and time, e.g. ## [1.2.0] - YYYY-MM-DD HH:MM:SS
- Use Copenhagen time (CET/CEST) for all timestamps
- Each entry must have a title line summarizing the main feature or change of that version.
- Use concise wording for all notes.
- Use sections Added, Changed, Fixed
- List items should be short and to the point.
- Place newest releases at the top.
-->

## [2.0.0] - 2025-07-05 22:45:00
**Complete Unified Responsive Design System**
### Added
- Unified responsive PageTickets component with desktop split-view and mobile card layout
- Consistent mobile card design pattern across all major entity pages
- Avatar support with user initials and proper color schemes throughout the application
- Responsive messaging interface for tickets with real-time chat functionality
- Mobile-optimized search and filtering controls across all pages
- Beach splash screen for completed tickets in mobile view

### Changed
- **BREAKING**: Migrated all page components to unified responsive architecture
- Consolidated PageOrders, PageProducts, PagePurchaseOrders, PageSettings, PageSmsCampaigns, PageUsers, PageSuppliers, and PageTickets
- Removed all separate Desktop/Mobile page component variants
- Enhanced mobile user experience with consistent card-based layouts
- Improved avatar display consistency across desktop and mobile interfaces
- Updated navigation and routing to use unified components

### Removed
- PageInventoryDesktop component and menu item (functionality consolidated into PageProducts)
- All legacy Desktop/Mobile page component pairs (9 components total)
- Duplicate code and inconsistent UI patterns between desktop and mobile views

### Fixed
- Responsive breakpoint consistency at 600px across all components
- TypeScript compilation errors during unified component migration
- Build optimization with reduced bundle size from component consolidation
- Navigation menu item cleanup and proper route handling

## [1.5.1] - 2025-07-05 21:47:38
**UI Bug Fixes**
### Fixed
- Bug fixes and stability improvements
- Performance optimizations
- Resolved user interface issues
- Updated documentation accuracy


## [1.5.0] - 2025-07-05 21:10:57
**Documentation Enhancements**
### Added
- New feature implementations
- Updated documentation and guides

### Changed
- Enhanced existing functionality
- Improved user experience


## [1.4.2] - 2025-07-05 10:25:07
**Documentation Fixes**
### Fixed
- Bug fixes and stability improvements
- Performance optimizations
- Updated documentation accuracy


## [1.4.1] - 2025-07-05 10:22:55
**Documentation Fixes**
### Fixed
- Bug fixes and stability improvements
- Performance optimizations
- Updated documentation accuracy


## [1.4.0] - 2025-07-05 10:15:01
**Autorelease**
### Added
- Automatic release workflow

## [1.3.2] - 2025-07-05 10:10:39
**UI Bug Fixes**
### Fixed
- Bug fixes and stability improvements
- Performance optimizations
- Resolved user interface issues
- Updated documentation accuracy


## [1.3.1] - 2025-07-05 09:53:00
**Version Management Enhancement**
### Added
- Support for multiple releases per day with timestamp format (YYYY-MM-DD HH:MM:SS)
- Enhanced version sync documentation and workflow
- Automated version consistency checks

### Changed
- Updated release log format to include precise timestamps
- Improved version sync script robustness

## [1.3.0] - 2025-07-05 09:35:00
**Collapsible Sidebar and Responsive Layout Enhancements**
### Added
- Fully responsive collapsible sidebar with breakpoint-aware behavior
- Clickable favicon toggle for manual sidebar collapse/expand
- Auto-collapse functionality for tablet users (900-600px)
- Smooth CSS transitions and animations for sidebar state changes
- Tooltip support for collapsed menu items with icons-only display
- Unified responsive breakpoint system at 600px across all components
- Enhanced PageMovements component with mobile/desktop responsive views
- ResponsiveContainer and ResponsiveModal components for consistent layouts

### Changed
- Unified App.tsx sidebar visibility logic with custom responsive hooks
- Updated sidebar width from 240px to 60px in collapsed state
- Improved mobile menu and sidebar coordination at consistent breakpoints
- Enhanced navigation UX with context-aware auto-collapse behavior

### Fixed
- Sidebar visibility breakpoint corrected from 900px to 600px
- Consistent responsive behavior across all page components
- TypeScript import path issues in multiple component files
- Build performance optimizations with proper code splitting

## [1.2.5] - 2025-07-02
**Complete Manual Stock Adjustment Feature Implementation**
### Added
- Robust mobile-first Manual Stock Adjustment feature with Joy UI components.
- Edge-to-edge, responsive mobile layout with proper content isolation.
- Compact row-based movements list with color-coded icons and quantity chips.
- Advanced filtering system with movement type, product, and reason category filters.
- Active filter chips display with clear all functionality.
- Subtle "+ Movement" floating action button positioned above mobile menu.
- Comprehensive stock adjustment dialog with current stock display and real-time calculation.
- Joy UI toast notifications replacing browser alerts for better UX.
- Signed quantity support for positive/negative adjustments.
- Database integration preventing negative stock levels.

### Changed
- Migrated PageMovementsMobile from Material-UI to Joy UI for consistency.
- Converted mobile movements list from card-based to compact row layout.
- Replaced all browser alert() calls with Joy UI Snackbar notifications.
- Updated stock movement calculations to use signed quantities for adjustments.
- Simplified edge-to-edge CSS implementation for better maintainability.
- Enhanced mobile menu to avoid alert() usage and improved error handling.

### Fixed
- Resolved layout isolation issues ensuring content doesn't scroll under mobile menu.
- Fixed TypeScript errors and missing imports in MobileMenu component.
- Eliminated aggressive CSS overrides in favor of cleaner implementation.
- Increased bottom padding to 100px ensuring last row visibility above mobile menu.
- Cleaned up console errors from Material-UI/Joy UI component mixing.

## [1.2.4] - 2025-07-02
**Complete Ticketing System Implementation**
### Added
- Comprehensive ticketing system with ticket list and chat-style communication area.
- Ticket creation dialog with subject and requester name fields.
- Ticket resolution dialog with predefined resolution options and comments.
- Real-time message sending and receiving functionality.
- Search and status filtering for tickets (Open, Pending, Closed, All).
- Friendly relative timestamps for tickets and activities.
- Professional chat bubble interface with sender differentiation.
- Date separators for better conversation flow.
- Keyboard shortcuts (Enter to send, Shift+Enter for new line).

### Changed
- Migrated ticketing system from test data to live Supabase integration.
- Renamed `TicketForm.tsx` to `DialogTicketCreate.tsx` for consistency.
- Renamed `TicketResForm.tsx` to `DialogTicketResolve.tsx` for consistency.
- Updated ticket list layout with status chips and improved spacing.
- Enhanced message area with modern chat bubble design and white text for current user messages.
- Increased ticket list width by 30% for better usability.

### Fixed
- Resolved database constraint violation by using 'chat' activity type instead of 'message'.
- Corrected import paths for DialogTicketCreate component.
- Fixed message sending functionality with proper error handling and user feedback.

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
