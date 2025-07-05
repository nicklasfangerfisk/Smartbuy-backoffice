# Naming Conventions

## Components in the Pages Folder

1. **Component Name Format**:
   - Use `PascalCase` for all component names.
   - Example: `OrderTable`, `ProductTableMobile`.

2. **File Name Format**:
   - Match the file name with the component name.
   - Example: If the component is `OrderTable`, the file name should be `OrderTable.tsx`.

3. **Folder Structure**:
   - Each page component should reside in the `components/Page` folder.
   - Example: `components/Page/OrderTable.tsx`.

4. **Suffix Usage**:
   - Use descriptive suffixes to indicate the component's purpose or variation.
     - Example: `Mobile` for mobile-specific components (`ProductTableMobile`).
     - Example: `Details` for components showing detailed views (`OrderTableDetails`).

5. **Avoid Abbreviations**:
   - Use full, descriptive names to ensure clarity.
   - Example: Use `PurchaseOrderTable` instead of `POTable`.

6. **Consistency**:
   - Ensure consistent naming across all components to maintain readability and organization.

## Page Component Naming Convention

1. **Desktop and Mobile Views**:
   - Use `Page` as a prefix for all page components.
   - Append `Desktop` for desktop-specific components and `Mobile` for mobile-specific components.
   - Example: `PageOrderDesktop`, `PageOrderMobile`.

2. **File Name Format**:
   - Match the file name with the component name.
   - Example: If the component is `PageOrderDesktop`, the file name should be `PageOrderDesktop.tsx`.

3. **Folder Structure**:
   - Place all page components in the `components/Page` folder.
   - Example:
     - `components/Page/PageOrderDesktop.tsx`
     - `components/Page/PageOrderMobile.tsx`.

This naming convention ensures clarity, consistency, and ease of navigation within the codebase. Future components should adhere to these guidelines.
