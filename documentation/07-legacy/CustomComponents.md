# Custom Components Used in Navigation

This document lists and describes custom React components used in navigation that are **not** part of MUI or Joy UI. These components are used to provide additional functionality or structure in the navigation system.

---

## 1. `Toggler`
**Location:** `components/navigation/Sidebar.tsx`

**Purpose:**
- Provides expandable/collapsible sections (accordions) for grouping menu items in the sidebar.
- Accepts a `renderToggle` prop for custom toggle button rendering and manages its own open/closed state.

**Usage Example:**
```tsx
<Toggler defaultExpanded={true} renderToggle={...}>
  <List>...</List>
</Toggler>
```

---

## 2. `UserDialog`
**Location:** `components/Dialog/UserDialog.tsx`

**Purpose:**
- Displays and allows editing of the current user's profile (name, avatar, etc.).
- Used in the sidebar's user profile section.

---

## 3. Centralized Menu Config
**Location:** `navigation/menuConfig.tsx`

**Purpose:**
- Exports a single source of truth for menu hierarchy, links, and icons.
- Used by both `Sidebar` and `MobileMenu` to ensure consistent navigation structure.

**Usage:**
```tsx
import { menuItems, menuByArea } from 'navigation/menuConfig';
```

---

If you add new custom navigation components, please document them here.
