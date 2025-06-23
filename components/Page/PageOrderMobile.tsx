/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import Link from '@mui/joy/Link';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import ListItemDecorator from '@mui/joy/ListItemDecorator';
import ListDivider from '@mui/joy/ListDivider';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';

import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import OrderTableDetails from '../Dialog/OrderTableDetails';
import { supabase } from '../../utils/supabaseClient';
import GeneralTableMobile from '../general/GeneralTableMobile';
import { handleOrderClick } from '../../utils';

export interface PageOrderMobileItem {
  /** Represents an order item in the mobile view. */
  id: string;
  /** Date of the order. */
  date: string;
  /** Status of the order. */
  status: 'Paid' | 'Refunded' | 'Cancelled';
  /** Customer details. */
  customer: {
    /** Initials of the customer's name. */
    initial: string;
    /** Full name of the customer. */
    name: string;
    /** Email address of the customer. */
    email: string;
  };
}

export interface OrderTableMobileItem {
  // Define the structure for OrderTableMobileItem here if needed
}

interface OrderTableMobileProps {
  /** Props for the OrderTableMobile component. */
  orders: PageOrderMobileItem[];
  /** Callback for when an order is clicked. */
  onRowClick?: (orderId: string) => void;
  /** Whether the order details modal is open. */
  orderDetailsOpen: boolean;
  /** The currently selected order. */
  selectedOrder: any;
  /** Function to fetch items for a specific order. */
  fetchOrderItems: (orderUuid: string) => Promise<any[]>;
  /** Callback to close the order details modal. */
  onCloseOrderDetails: () => void;
}

/**
 * OrderTableMobile component displays a list of orders in a mobile-friendly layout.
 * It supports viewing order details in a modal.
 *
 * @param {OrderTableMobileProps} props - Props for the component.
 * @returns {JSX.Element} The rendered OrderTableMobile component.
 */
export default function OrderTableMobile({ orders, onRowClick, orderDetailsOpen, selectedOrder, fetchOrderItems, onCloseOrderDetails }: OrderTableMobileProps) {
  return (
    <Box sx={{ width: '100vw', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: { xs: 2, md: 4 }, position: 'fixed', inset: 0, zIndex: 12000 }}>
      <Typography level="h2" sx={{ mb: 2, textAlign: 'left' }}>Orders</Typography>
      <GeneralTableMobile
        items={orders}
        renderItem={(order) => (
          <Box
            onClick={() => onRowClick?.(order.id)}
            sx={{ cursor: 'pointer' }}
          >
            <Typography>{order.date}</Typography>
            <Typography>{order.status}</Typography>
            <Typography>{order.customer.name}</Typography>
          </Box>
        )}
        ariaLabel="Orders Mobile View"
      />
      <OrderTableDetails
        open={orderDetailsOpen}
        onClose={onCloseOrderDetails}
        selectedOrder={selectedOrder}
        fetchOrderItems={fetchOrderItems}
      />
    </Box>
  );
}
