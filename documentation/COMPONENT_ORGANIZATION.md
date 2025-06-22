# Component Organization

The `components` folder has been reorganized to improve maintainability, scalability, and clarity. Below is the new structure and guidelines for each subfolder:

## Folder Structure

### 1. **Page**
- Contains components that represent entire pages or major sections of the application.
- Example Components:
  - `OrderTable.tsx`
  - `ProductTableMobile.tsx`
  - `Suppliers.tsx`

### 2. **Dialog**
- Contains components for modals, popups, and dialogs.
- Example Components:
  - `OrderTableDetails.tsx`
  - `SupplierForm.tsx`
  - `UserDialog.tsx`

### 3. **Navigation**
- Contains components related to navigation and layout.
- Example Components:
  - `Sidebar.tsx`
  - `Header.tsx`
  - `MobileMenu.tsx`

### 4. **Auth**
- Contains components related to authentication.
- Example Components:
  - `Login.tsx`

### 5. **General**
- Contains shared components, utilities, or types used across the application.
- Example Components:
  - `supabase.types.ts`

### 6. **Hooks**
- Contains custom React hooks.
- Example Components:
  - `useTickets.ts`

## Guidelines

1. **Purpose-Driven Organization**:
   - Components are grouped by their purpose or functionality.

2. **Consistent Naming**:
   - Follow the naming conventions outlined in `NAMING_CONVENTIONS.md`.

3. **Reusability**:
   - Shared or reusable components should be placed in `General` or other appropriate folders.

4. **Scalability**:
   - New subfolders can be created as needed to accommodate additional categories of components.

This structure ensures a clean and organized codebase, making it easier for developers to navigate and maintain the project.
