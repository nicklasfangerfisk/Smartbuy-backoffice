# Smartback Layout Isolation, Responsive Design, and Prop Validation

## Overview
This document describes the process, rationale, and best practices for achieving strict page isolation, robust responsive design, and prop validation in the Smartback backoffice application. It is intended for current and future maintainers.

---

## 1. Problem: Layout Bleed-Through & Page Isolation
- **Issue:** Content from one page (e.g., dashboard) was visible underneath or alongside other pages due to insufficient isolation of main content areas and improper use of fixed/absolute positioning.
- **Solution:** All main page components (including `ProductTable.tsx`, `OrderTable.tsx`, etc.) were refactored to wrap their desktop views in a full-size container (`Box`, `Sheet`, or `Card`) with:
  - `width: '100%'`
  - `minHeight: '100dvh'`
  - Proper background color and border radius
  - Padding and box shadow for visual separation

## 2. Responsive Design
- **Approach:** Used Material UI’s `useMediaQuery` to conditionally render mobile or desktop views.
- **Example:** In `ProductTable.tsx`, the mobile view (`ProductTableMobile`) is rendered only if `isMobile` is true, ensuring only one layout is visible at a time.

## 3. Prop Validation & Build Error Fixes
- **Issue:** Passing an invalid `products` prop to `ProductTableMobile` caused a TypeScript build error.
- **Solution:** Removed the invalid prop, ensuring that only the expected props are passed to child components.

## 4. Best Practices for Future Maintenance
- Always wrap main content in a full-size container to prevent layout bleed-through.
- Use conditional rendering for mobile/desktop layouts, not CSS alone.
- Validate all props passed to child components to avoid build/runtime errors.
- Document any layout or prop changes in the component file for future maintainers.
- Consider migrating to a dynamic, router-based layout for even stricter isolation and easier navigation.

## 5. Next Steps (Optional)
- Migrate to a router-based layout for stricter isolation.
- Refactor any remaining pages/components to follow this pattern.
- Review for any remaining layout or prop errors.

## Router-Based Layout and Dynamic URL Paths

The application has been migrated to a router-based layout using React Router. Each page is now accessible via a unique URL path, ensuring stricter isolation and easier navigation.

### Key Changes
1. **Dynamic Routing**:
   - Added `react-router-dom` to manage routes dynamically.
   - Defined routes for all main pages in `App.tsx` using `BrowserRouter` and `Routes`.

2. **Updated Navigation**:
   - Navigation components (e.g., `Sidebar`, `Header`) now use `Link` or `NavLink` for navigation.

3. **Page URLs**:
   - `/` - Dashboard
   - `/orders` - Orders
   - `/products` - Products
   - `/users` - Users
   - `/suppliers` - Suppliers
   - `/purchase-orders` - Purchase Orders
   - `/login` - Login
   - `/tickets` - Tickets
   - `/sms-campaigns` - SMS Campaigns

### Benefits
- Stricter layout isolation.
- Easier navigation and maintainability.
- Improved user experience with dynamic URL paths.

### Next Steps
- Test all routes for functionality and responsiveness.
- Update any remaining static navigation links to use dynamic routing.

## Responsive Page Layout Strategy

To ensure a consistent and maintainable responsive design across the application, the following strategy is adopted:

1. **Separate Components for Mobile and Desktop Views**:
   - Each page should have distinct components for mobile and desktop views.
   - Example: `PageProductDesktop.tsx` (desktop) and `PageProductMobile.tsx` (mobile).

2. **Shared Logic**:
   - Common logic, such as data fetching or state management, should be abstracted into shared hooks or utilities.
   - Example: Use a custom hook like `useOrders` to fetch and manage order data.

3. **Component Naming**:
   - Use descriptive names to differentiate between mobile and desktop components.
   - Example: Append `Mobile` to the component name for mobile views (e.g., `ProductTableMobile`).

4. **Media Query Usage**:
   - Use `useMediaQuery` or similar utilities to determine the screen size and conditionally render the appropriate component.
   - Example:
     ```tsx
     const isMobile = useMediaQuery('(max-width: 600px)');
     return isMobile ? <OrderTableMobile /> : <OrderTable />;
     ```

5. **Consistent Folder Structure**:
   - Place all page components in the `components/Page` folder.
   - Example:
     - `components/Page/OrderTable.tsx`
     - `components/Page/OrderTableMobile.tsx`

6. **Testing and Validation**:
   - Ensure both mobile and desktop components are tested for functionality and responsiveness.

This strategy ensures a clean separation of concerns, reduces complexity, and provides a consistent user experience across devices.

---

**Maintainer Note:**
This documentation should be reviewed and updated as the project evolves, especially if new layout paradigms or navigation strategies are introduced.
