import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import GeneralTableMobile from '../general/GeneralTableMobile';

/**
 * Represents a purchase order item in the mobile view.
 * @property {string} id - Unique identifier for the purchase order.
 * @property {string} order_number - The order number.
 * @property {string} order_date - The date of the order.
 * @property {string} status - The status of the order.
 * @property {number} total - The total amount of the order.
 * @property {string} supplier_name - The name of the supplier.
 * @property {Object} [Suppliers] - Additional supplier details.
 * @property {string} Suppliers.name - The name of the supplier.
 */
export interface PagePurchaseOrderMobileItem {
  id: string;
  order_number: string;
  order_date: string;
  status: string;
  total: number;
  supplier_name: string;
  Suppliers?: {
    name: string;
  };
}

/**
 * PagePurchaseOrderMobile component displays a list of purchase orders in a mobile-friendly layout.
 *
 * @param {{ orders: PagePurchaseOrderMobileItem[] }} props - Props for the component.
 * @returns {JSX.Element} The rendered PagePurchaseOrderMobile component.
 */
const PagePurchaseOrderMobile: React.FC<{ orders: PagePurchaseOrderMobileItem[] }> = ({ orders }) => {
  return (
    <GeneralTableMobile
      items={orders}
      renderItem={(order) => (
        <Box>
          <Typography fontWeight="bold">Order Number: {order.order_number}</Typography>
          <Typography>Order Date: {order.order_date}</Typography>
          <Typography>Status: {order.status}</Typography>
          <Typography>Total: ${order.total.toFixed(2)}</Typography>
          <Typography>Supplier: {order.supplier_name}</Typography>
        </Box>
      )}
      ariaLabel="Purchase Orders Mobile View"
    />
  );
};

export default PagePurchaseOrderMobile;
