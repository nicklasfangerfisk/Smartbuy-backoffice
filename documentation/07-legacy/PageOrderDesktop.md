# PageOrderDesktop Documentation

## Overview
The `PageOrderDesktop` component is responsible for displaying a list of orders in a table format. It supports filtering, searching, and viewing order details. The page is designed to provide a responsive layout, adapting to both desktop and mobile views.

## Layout

### Desktop Layout
- The desktop layout features a table displaying orders with columns for order number, date, status, customer, and total.
- A search bar and filter controls are positioned above the table for easy access.
- A "Create Order" button is available to open a modal for creating new orders.
- The order details modal is displayed when a row is clicked.

### Mobile Layout
- The mobile layout uses the `PageOrderMobile` component to display orders in a mobile-friendly format.
- The layout is conditionally rendered based on the viewport width using `useMediaQuery`.

## Components

### Key Components
1. **Table**: Displays the list of orders with sortable columns.
2. **Filters**: Includes dropdowns for filtering by status, category, and customer.
3. **Search Bar**: Allows users to search for orders by order number or customer name.
4. **Order Details Modal**: Displays detailed information about a selected order.
5. **Create Order Modal**: Provides a form for creating new orders.
6. **RowMenu**: A dropdown menu for actions like edit, rename, move, and delete.

### Mobile Component
- The `PageOrderMobile` component is used for rendering the mobile layout. It receives props for handling order details and interactions.

## Styling

### Desktop Styling
- The main container uses a `Box` component with the following styles:
  - `width: '100%'`
  - `minHeight: '100dvh'`
  - `bgcolor: 'background.body'`
  - `borderRadius: 2`
  - `boxShadow: 2`
  - `p: 4`
- The table is styled with a minimum width of 800px and includes a `LinearProgress` component for loading states.
- Chips are used to display the status of orders with different colors for "Paid," "Refunded," and "Cancelled."

### Mobile Styling
- The `PageOrderMobile` component handles its own styling, optimized for smaller screens.

### Responsive Design
- The `useMediaQuery` hook is used to determine whether to render the desktop or mobile layout.
- The desktop layout is displayed for viewports wider than 600px, while the mobile layout is used for smaller viewports.

## Data Flow

### Fetching Orders
- Orders are fetched from the Supabase database using the `fetchOrders` function.
- The data is mapped to the `OrderRow` structure before being stored in the component's state.

### Filtering and Searching
- Filters for status, category, and customer are applied to the list of orders.
- The search bar filters orders by order number or customer name.

### Order Details
- Clicking a row opens the order details modal, which fetches additional data for the selected order.

### Creating Orders
- The "Create Order" button opens a modal with a form for creating new orders.
- The `handleCreateOrder` function handles the creation of orders and their associated items.

## Best Practices

1. **Responsive Design**: Use `useMediaQuery` to ensure the layout adapts to different screen sizes.
2. **Data Mapping**: Map data from the database to a consistent structure for easier state management.
3. **Component Reusability**: Use shared components like `PageOrderMobile` for mobile-specific layouts.
4. **Error Handling**: Log errors and provide user feedback for failed operations.
5. **State Management**: Use React state hooks to manage the state of filters, modals, and data.

## Future Enhancements
- Add dynamic category options based on the data.
- Implement pagination for the table to handle large datasets.
- Add more actions to the `RowMenu` dropdown.

---

This documentation provides a comprehensive overview of the `PageOrderDesktop` component, including its layout, components, styling, and data flow. It serves as a guide for maintaining and extending the page.
