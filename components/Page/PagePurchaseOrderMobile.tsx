import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import GeneralTableMobile from '../general/GeneralTableMobile';

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
