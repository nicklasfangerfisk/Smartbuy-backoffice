// Centralized menu configuration for both Sidebar and MobileMenu
// This ensures consistency in hierarchy, links, and icons

import React from 'react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

export type MenuArea = 'Sales' | 'Support' | 'Marketing' | 'Operations';

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  route: string;
  value: string;
  area: MenuArea;
  showInMobile?: boolean;
}

export const menuItems: MenuItem[] = [
  // Sales
  { label: 'Home', icon: <HomeRoundedIcon />, route: '/dashboard', value: 'home', area: 'Sales', showInMobile: true },
  { label: 'Orders', icon: <ShoppingCartRoundedIcon />, route: '/orders', value: 'orders', area: 'Sales', showInMobile: true },
  // Support
  { label: 'Messages', icon: <QuestionAnswerRoundedIcon />, route: '/messages', value: 'messages', area: 'Support', showInMobile: true },
  { label: 'Tickets', icon: <AssignmentRoundedIcon />, route: '/tickets', value: 'tickets', area: 'Support', showInMobile: true },
  { label: 'Users', icon: <GroupRoundedIcon />, route: '/users', value: 'users', area: 'Support', showInMobile: true },
  // Marketing
  { label: 'SMS Campaigns', icon: <AssignmentRoundedIcon />, route: '/sms-campaigns', value: 'smscampaigns', area: 'Marketing', showInMobile: true },
  // Operations
  { label: 'Products', icon: <AssignmentRoundedIcon />, route: '/products', value: 'products', area: 'Operations', showInMobile: true },
  { label: 'Suppliers', icon: <StorefrontIcon />, route: '/suppliers', value: 'suppliers', area: 'Operations', showInMobile: true },
  { label: 'Purchase Orders', icon: <AssignmentTurnedInIcon />, route: '/purchase-orders', value: 'purchaseorders', area: 'Operations', showInMobile: true },
  { label: 'Movements', icon: <AssignmentRoundedIcon />, route: '/movements', value: 'movements', area: 'Operations', showInMobile: true },
  { label: 'Inventory', icon: <AssignmentRoundedIcon />, route: '/inventory', value: 'inventory', area: 'Operations', showInMobile: false },
  // Settings (stick to bottom)
  { label: 'Settings', icon: <SettingsRoundedIcon />, route: '/settings', value: 'settings', area: 'Operations', showInMobile: true },
];

// Export grouped by area for easier use in Sidebar
export const menuByArea: Record<MenuArea, MenuItem[]> = {
  Sales: menuItems.filter((item) => item.area === 'Sales'),
  Support: menuItems.filter((item) => item.area === 'Support'),
  Marketing: menuItems.filter((item) => item.area === 'Marketing'),
  Operations: menuItems.filter((item) => item.area === 'Operations'),
};
