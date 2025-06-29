import HomeRoundedIcon from '@mui/icons-material/HomeRounded';

export type MenuValue = 'home' | 'orders' | 'products' | 'messages' | 'users' | 'suppliers' | 'purchaseorders' | 'tickets' | 'smscampaigns' | 'movements';

export type MenuArea = 'Sales' | 'Support' | 'Operations' | 'Marketing';

export interface MenuItem {
  label: string;
  route: string;
  value: MenuValue;
  icon: typeof HomeRoundedIcon;
}

export const menuByArea: Record<MenuArea, MenuItem[]> = {
  Sales: [],
  Support: [],
  Operations: [],
  Marketing: [],
};