// src/navigation/menuConfig.ts
import React from 'react';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import LanguageIcon from '@mui/icons-material/Language';

export type MenuValue = 'home' | 'dashboard' | 'orders' | 'users' | 'customers' | 'employees' | 'suppliers' | 'products' | 'purchaseorders' | 'tickets' | 'smscampaigns' | 'movements' | 'settings' | 'profile' | 'storefronts';

export type MenuArea = 'Sales' | 'Support' | 'Marketing' | 'Operations' | 'Administration';

export interface MenuItem {
  label: string;
  icon: React.ReactNode;
  value: MenuValue;
  route: string;
  showInMobile: boolean;
}

export interface MobileMenuItem {
  label: string;
  icon: React.ReactNode;
  value: MenuValue;
}

export const menuItems: MenuItem[] = [
  { label: 'Home', icon: React.createElement(HomeRoundedIcon), value: 'home', route: '/', showInMobile: true },
  { label: 'Dashboard', icon: React.createElement(DashboardRoundedIcon), value: 'dashboard', route: '/dashboard', showInMobile: true },
  { label: 'Orders', icon: React.createElement(ShoppingCartRoundedIcon), value: 'orders', route: '/orders', showInMobile: true },
  { label: 'Products', icon: React.createElement(StorefrontIcon), value: 'products', route: '/products', showInMobile: true },
  { label: 'Customers', icon: React.createElement(GroupRoundedIcon), value: 'customers', route: '/customers', showInMobile: true },
  { label: 'Employees', icon: React.createElement(BadgeIcon), value: 'employees', route: '/employees', showInMobile: true },
  { label: 'Suppliers', icon: React.createElement(SupportRoundedIcon), value: 'suppliers', route: '/suppliers', showInMobile: true },
  { label: 'Purchase Orders', icon: React.createElement(AssignmentTurnedInIcon), value: 'purchaseorders', route: '/purchase-orders', showInMobile: true },
  { label: 'Tickets', icon: React.createElement(QuestionAnswerRoundedIcon), value: 'tickets', route: '/tickets', showInMobile: true },
  { label: 'SMS Campaigns', icon: React.createElement(AssignmentRoundedIcon), value: 'smscampaigns', route: '/sms-campaigns', showInMobile: true },
  { label: 'Movements', icon: React.createElement(AssignmentRoundedIcon), value: 'movements', route: '/movements', showInMobile: true },
  { label: 'My Profile', icon: React.createElement(PersonIcon), value: 'profile', route: '/settings', showInMobile: true },
];

export const menuByArea: Record<MenuArea, MenuItem[]> = {
  Sales: [
    { label: 'Dashboard', icon: React.createElement(DashboardRoundedIcon), value: 'dashboard', route: '/dashboard', showInMobile: true },
    { label: 'Orders', icon: React.createElement(ShoppingCartRoundedIcon), value: 'orders', route: '/orders', showInMobile: true },
    { label: 'Storefronts', icon: React.createElement(LanguageIcon), value: 'storefronts', route: '/storefronts', showInMobile: true },
    { label: 'Customers', icon: React.createElement(GroupRoundedIcon), value: 'customers', route: '/customers', showInMobile: true },
  ],
  Support: [
    { label: 'Tickets', icon: React.createElement(QuestionAnswerRoundedIcon), value: 'tickets', route: '/tickets', showInMobile: true },
  ],
  Marketing: [
    { label: 'Products', icon: React.createElement(StorefrontIcon), value: 'products', route: '/products', showInMobile: true },
    { label: 'SMS Campaigns', icon: React.createElement(AssignmentRoundedIcon), value: 'smscampaigns', route: '/sms-campaigns', showInMobile: true },
  ],
  Operations: [
    { label: 'Suppliers', icon: React.createElement(SupportRoundedIcon), value: 'suppliers', route: '/suppliers', showInMobile: true },
    { label: 'Purchase Orders', icon: React.createElement(AssignmentTurnedInIcon), value: 'purchaseorders', route: '/purchase-orders', showInMobile: true },
    { label: 'Movements', icon: React.createElement(AssignmentRoundedIcon), value: 'movements', route: '/movements', showInMobile: true },
  ],
  Administration: [
    { label: 'Employees', icon: React.createElement(BadgeIcon), value: 'employees', route: '/employees', showInMobile: true },
    { label: 'My Profile', icon: React.createElement(PersonIcon), value: 'profile', route: '/settings', showInMobile: true },
  ],
};
