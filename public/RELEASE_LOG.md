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

## [3.2.6] - 2025-07-13 09:47:18
**Release Automation Tag-Based Commit Analysis**
### Fixed
- Fixed release automation to analyze commits since last tag instead of time-based approach
- Resolved chicken-and-egg problem where release commits were included in analysis
- Improved commit detection to capture all changes between releases properly


## [3.2.5] - 2025-07-13 09:44:41
**Bug Fixes and Stability**
### Fixed
- Feat: Complete checkout experience with Joy UI components
- Fix sidebar viewport overflow issue v3.0.3
- Feat: clean up unit test suite and fix test environment


## [3.2.4] - 2025-07-13 09:42:56
**Release Automation Commit Filtering Improvements**
### Fixed
- Improved release automation commit filtering to exclude version tags and release commits more effectively
- Enhanced commit message parsing with better pattern recognition for meaningful content
- Fixed release notes for previous version to reflect actual automation improvements


## [3.2.3] - 2025-07-13 09:40:07
**Release Automation Improvements**
### Fixed
- Enhanced release automation to generate meaningful release notes from commit messages
- Improved commit message parsing with better filtering of release and version commits
- Added intelligent categorization of commits into Added/Changed/Fixed sections


## [3.2.2] - 2025-07-13 09:35:32
**Release Automation Timezone Fixes**
### Fixed
- Fixed incorrect timezone calculation in release automation scripts using proper Europe/Copenhagen timezone API
- Corrected function name typo from getCurrentCopenhageTime to getCurrentCopenhagenTime
- Replaced manual DST offset calculation with automatic timezone handling
- Fixed release log file paths in automation scripts to use public/RELEASE_LOG.md


## [3.2.1] - 2025-07-13 09:25:00
**Purchase Order Form Improvements & Bug Fixes**
### Added
- Split layout purchase order form with header info on left and items on right
- Responsive mobile design with card-based item layout
- Real-time total calculation display at bottom of items section
- Status-based editing (pending orders editable, others view-only)
### Fixed
- Purchase order number generation for new orders
- Missing order number display with fallback text
- Form state synchronization when switching between orders
- Table column spacing and overlap issues in items editor

## [3.2.0] - 2025-07-13 15:30:00
**Enhanced Supplier Management with Contact Actions & Purchase Order Integration**
### Added
- Unified supplier dialog with view, edit, and add modes
- Clickable email and phone buttons that open device default applications
- "Add Purchase Order" button with supplier auto-injection
- Purchase orders table in supplier view showing order history
- Supplier avatar upload functionality with 5MB limit and image validation
- Contact action buttons for direct email and phone communication
### Changed
- Supplier cards now open in view mode first, with edit accessible via button
- Edit button changed from primary (blue) to secondary (outlined) styling
- "Add Purchase Order" button styled as primary action (blue solid)
- Improved responsive layout for contact information with better button spacing
- Consolidated SupplierDisplay functionality into unified SupplierForm component
### Fixed
- Avatar display issues with proper image scaling within circular bounds
- Grid layout alignment with negative margins for edge-to-edge card display
- Responsive contact button layout preventing text overflow on small screens
### Technical Details
- Enhanced SupplierForm component with three distinct modes (add/edit/view)
- Integrated PurchaseOrderForm with pre-selected supplier context
- Automatic purchase orders list refresh after new order creation
- Improved TypeScript interfaces and error handling
- Supabase storage integration for supplier image management

## [3.1.1] - 2025-07-12 16:45:00
**Suppliers Page Grid Layout Fix**
### Fixed
- Fixed responsive grid layout preventing card overlapping
- Improved card sizing and spacing across all screen sizes
- Enhanced clickable card interaction with delete functionality moved to edit form

## [3.1.0] - 2025-07-12 15:30:00
**Checkout Dialog**
### Added
- Total amount display in both collapsed and expanded mobile order summary
### Changed
- Removed card borders around Contact and Address sections for cleaner UI
- Improved mobile order summary layout with better button positioning
### Fixed
- Fixed checkout navigation buttons visibility on mobile by adjusting z-index layering
- Resolved collapse button overlap with close button in mobile checkout dialog

## [3.0.3] - 2025-07-11 21:25:00
**Sidebar Viewport Overflow Fix**
### Fixed
- Fixed sidebar extending beyond viewport bottom causing page scrollbar
- Improved layout height management using proper flex constraints
- Optimized page content overflow behavior for better scrolling experience

## [3.0.2] - 2025-07-11 20:15:00
**Unit Test Suite Cleanup & Environment Fixes**
### Fixed
- Removed temporary debugging test file causing consistent test failures
- Added window.matchMedia mock for Material-UI components in Jest environment
- Fixed test selectors to match actual UI placeholders and button text
- Test suite now properly runs only the three intended authentication test cases
### Technical Details
- Enhanced Jest setup configuration for React component testing
- Improved test reliability and compatibility with Material-UI Joy components
- All authentication tests now pass consistently (login, error handling, logout)

## [3.0.1] - 2025-07-11 17:55:00
**Product Image Upload & Inventory Management Enhancement**
### Added
- Product image upload functionality with Supabase storage integration
- Drag & drop image upload interface with file validation (images only, max 5MB)
- Image preview and removal capabilities in product forms
- Inventory management section in product creation/editing forms
- Minimum stock, maximum stock, and reorder amount fields
- Dedicated inventory section with clear visual separation and icons
- Storage policies for productimages bucket with proper RLS configuration
- Database column consistency improvements (image_url standardization)
### Changed
- ProductTableForm and ProductDialog components enhanced with image upload
- Product interface updated to include inventory management fields
- Form validation improved with proper type conversion for inventory fields
- Product save operations now handle image URLs and inventory data
- Enhanced user experience with intuitive form organization
### Fixed
- Column name consistency between database schema and TypeScript interfaces
- Storage bucket name alignment for successful image uploads
- RLS policy violations resolved for authenticated image uploads
### Technical Details
- Image storage integrated with Supabase productimages bucket
- Inventory fields connected to existing database schema (min_stock, max_stock, reorder_amount)
- Proper null handling for optional inventory and image fields
- TypeScript type safety maintained across all form components

## [3.0.0] - 2025-07-11 16:45:00
**Major Update: Comprehensive Currency Persistence & Multi-Currency Foundation**
### Added
- Complete currency persistence system across all price-related database tables
- Currency and exchange rate fields for Products (SalesPrice, CostPrice)
- Currency and exchange rate fields for Orders (order_total)
- Currency and exchange rate fields for OrderItems (unitprice, price)
- Currency and exchange rate fields for PurchaseOrderItems (unit_price)
- Database migration with proper indexes for performance optimization
- Enhanced currency utilities with multi-currency support functions
- Currency data preparation functions for all price operations
- TypeScript interfaces for currency-enabled database tables
- Validation functions for currency persistence testing
- Currency information display in Settings page Application Info section
- Comprehensive documentation for currency implementation
### Changed
- All product creation/editing operations now include currency data persistence
- Order and order item creation enhanced with currency field storage
- Purchase order item operations updated with currency persistence
- Currency utilities expanded with exchange rate conversion capabilities
- Application now foundation-ready for international multi-currency operations
### Technical Details
- Database schema extended with ISO 4217 currency codes (3-character)
- Exchange rates stored with 6 decimal precision for accurate conversions
- Default currency set to Danish Kroner (DKK) with 1.0 exchange rate
- Backward compatibility maintained for all existing data
- Performance optimized with strategic database indexes

## [2.1.7] - 2025-07-11 14:30:00
**Avatar Upload System and User Profile UI Improvements**
### Added
- Full avatar upload functionality with Supabase storage integration
- File validation for image type and size (max 5MB)
- Real-time avatar preview and database synchronization
- Clean upload UI that only appears in edit mode
### Changed
- Improved avatar section layout with proper spacing and centering
- Upload button moved underneath avatar to eliminate overlap
- Simplified upload helper text for better user experience
- Enhanced form field spacing consistency between name and role/department fields
### Fixed
- Resolved container overflow issues in user profile layout
- Fixed avatar image loading with proper Supabase storage bucket configuration
- Eliminated debugging UI elements for production-ready interface

## [2.1.6] - 2025-07-10 12:45:00
**Enhanced User Profile Management with Full Supabase Integration**
### Added
- Department field to user profile for better organization
- Avatar URL field with live preview support
- Account information section showing member since date, last login, and user ID
### Changed
- User profile now fully synchronized with Supabase users table
- Removed country and timezone fields (not stored in database)
- Enhanced form validation and data persistence
### Fixed
- All user profile fields now properly save to and load from Supabase
- Avatar display correctly uses database-stored avatar URL

## [2.1.5] - 2025-07-10 12:20:00
**Mobile Menu Navigation Fix for SMS Campaigns and Purchase Orders**
### Fixed
- Fixed mobile menu navigation not working for SMS Campaigns and Purchase Orders buttons
- Corrected route mapping in App.tsx to properly handle hyphenated routes (/sms-campaigns, /purchase-orders)
- Mobile users can now successfully navigate to SMS Campaigns and Purchase Orders pages from the mobile bottom navigation menu

## [2.1.4] - 2025-07-06 18:30:00
**Static Asset Organization and Production Build Fixes**
### Fixed
- Fixed duplicate index.html files by removing empty src/public/index.html and keeping root index.html as the correct Vite template
- Fixed duplicate RELEASE_LOG.md files by removing root version and keeping public/RELEASE_LOG.md as the correct static asset
- Fixed favicon.svg not loading in Vercel production by moving from root to public directory for proper static asset serving
- Cleaned up project structure to follow Vite best practices for static asset placement in public directory

## [2.1.3] - 2025-07-06 17:45:00
**Release Log Display Fix for Production Deployment**
### Fixed
- Fixed release log not displaying in production/Vercel deployment by moving RELEASE_LOG.md to public folder for proper static asset serving
- Enhanced ReleaseLog component with fallback content mechanism to ensure meaningful display even when file is unavailable
- Added proper error handling and debug logging for production troubleshooting
- Configured Vite publicDir setting to ensure consistent static asset handling across environments
- Improved user experience with graceful fallback instead of error messages when release log cannot be loaded

## [2.1.2] - 2025-07-06 16:45:00
**Modern Login Page Redesign with Split Layout**
### Added
- Beautiful split-screen login layout inspired by MUI Joy UI sign-in side template
- Glassmorphism effect with backdrop blur and semi-transparent backgrounds
- Dynamic mountain landscape background images that change with light/dark mode
- Dark/light mode toggle in login page header
- Company branding with SmartBack logo and name in header
- Modern typography and improved spacing using Joy UI components
- Responsive design that adapts to mobile and desktop screens

### Changed
- Complete visual redesign of login page while preserving all authentication functionality
- Enhanced user experience with modern, professional appearance
- Improved form layout with better visual hierarchy and spacing

### Fixed
- Removed Google OAuth option as requested to simplify authentication flow

## [2.1.1] - 2025-07-06 14:30:00
**Enhanced Settings Page with User Profile Management**
### Added
- Comprehensive user profile management in Settings page with tabbed interface
- "User", "App", and "Releases" tabs for organized settings navigation
- Full-featured user profile form with avatar, name, role, email, country, and timezone fields
- Profile editing with save/cancel functionality and success/error messaging
- "My Profile" menu item in sidebar navigation (Support section)
- Logout button in Settings page header for both mobile and desktop views
- Responsive profile form layout with avatar positioning (top on mobile, left on desktop)

### Changed
- Settings page now accessible via clickable user profile in sidebar footer
- Removed Settings and Logout menu items from sidebar navigation
- Enhanced mobile responsiveness for profile form with stacked layout
- Updated user profile interaction to navigate directly to Settings page
- Improved Settings page UX with modern tabbed interface design

### Fixed
- User profile form now properly responsive across all screen sizes
- Consistent navigation patterns between sidebar user profile and menu items
- Proper form field validation and state management in profile editing

## [2.1.0] - 2025-07-05 23:15:00
**Mobile Ticket Communication Enhancement**
### Added
- Full mobile communication interface for tickets with messaging functionality
- Mobile ticket detail view with back navigation to ticket list
- Two-view mobile experience: list view and communication view
- Mobile message input with send button and keyboard shortcuts
- Mobile-optimized message bubbles and conversation layout
- Header with ticket details, status, and resolve button in mobile communication view

### Changed
- Enhanced mobile ticket interaction with clickable ticket cards
- Improved mobile user experience with dedicated communication screen
- Updated mobile layout to support full-screen messaging interface

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
