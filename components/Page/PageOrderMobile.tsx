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

export interface PageOrderMobileItem {
  id: string;
  date: string;
  status: 'Paid' | 'Refunded' | 'Cancelled';
  customer: {
    initial: string;
    name: string;
    email: string;
  };
}

interface OrderTableMobileProps {
  orders: PageOrderMobileItem[];
  onRowClick?: (orderId: string) => void;
  orderDetailsOpen: boolean;
  selectedOrder: any;
  fetchOrderItems: (orderUuid: string) => Promise<any[]>;
  onCloseOrderDetails: () => void;
}

function RowMenu() {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Rename</MenuItem>
        <MenuItem>Move</MenuItem>
        <Divider />
        <MenuItem color="danger">Delete</MenuItem>
      </Menu>
    </Dropdown>
  );
}

export default function OrderTableMobile({ orders, onRowClick, orderDetailsOpen, selectedOrder, fetchOrderItems, onCloseOrderDetails }: OrderTableMobileProps) {
  return (
    <Box sx={{ width: '100vw', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: { xs: 2, md: 4 }, position: 'fixed', inset: 0, zIndex: 12000 }}>
      <Typography level="h2" sx={{ mb: 2, textAlign: 'left' }}>Orders</Typography>
      <GeneralTableMobile
        items={orders}
        renderItem={(order) => (
          <Box>
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
