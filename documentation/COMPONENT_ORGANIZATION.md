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

### 3. **Navigation & Layout**
- Contains components related to navigation and overall application layout.
- Example Components:
  - `Sidebar.tsx`
  - `Header.tsx`
  - `MobileMenu.tsx`
  - `MobilePageLayout.tsx` (shared layout for all mobile pages)

### 4. **Auth**
- Contains components related to authentication.
- Example Components:
  - `Login.tsx`

### 5. **General**
- Contains shared components, utilities, or types used across the application.
- Example Components:
  - `supabase.types.ts`
  - `MobilePageLayout.tsx` (if not already listed under Navigation & Layout)

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

5. **Mobile Page Layout Best Practice**:
   - All mobile page components must use the shared `MobilePageLayout` component (in `components/general/` or `components/navigation/` depending on your structure).
   - This ensures a fixed, consistent content area below the header and above the mobile menu, and prevents layout bugs or inconsistent spacing.
   - Do not wrap all routes in `App.tsx` with this layout; instead, use it only in mobile page components for clear separation of mobile and desktop layouts.
   - Example usage:
     ```tsx
     import MobilePageLayout from '../general/MobilePageLayout';
     
     const PageOrderMobile = () => (
       <MobilePageLayout>
         {/* Page content here */}
       </MobilePageLayout>
     );
     ```
   - This three-layer approach (App shell → MobilePageLayout → Page content) is robust, maintainable, and ensures a consistent user experience.

This structure ensures a clean and organized codebase, making it easier for developers to navigate and maintain the project.
