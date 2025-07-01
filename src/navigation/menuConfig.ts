// src/navigation/menuConfig.ts

export type MenuValue = 'home' | 'orders' | 'users' | 'suppliers' | 'products' | 'purchaseorders' | 'tickets' | 'smscampaigns' | 'movements' | 'inventory' | 'settings';

export interface MobileMenuItem {
  label: string;
  icon: React.ReactNode;
  value: MenuValue;
}

// Add more menu config as needed
