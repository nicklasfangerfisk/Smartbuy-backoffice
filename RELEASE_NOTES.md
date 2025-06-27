# Release Notes

## [Unreleased]

### Added
- None

### Changed
- The purchase order receive dialog now sends product UUIDs (not integer IDs) to the backend for all stock movement records.
- The backend API for receiving purchase orders now uses `movement_type: 'incoming'` to comply with the stock_movements table constraint.
- Success feedback for receiving a purchase order is now shown as a MUI Snackbar toast, auto-hiding after 3 seconds, instead of a blocking alert dialog.
- The frontend and backend now consistently use UUIDs for purchase order and product references in all stock movement workflows.

### Fixed
- Fixed a bug where the frontend sent integer product IDs instead of UUIDs, causing incorrect stock movement records.
- Fixed a backend error where an invalid `movement_type` value caused a constraint violation.

### Removed
- None

---

## [Older releases]
- See previous CHANGELOG or commit history.
