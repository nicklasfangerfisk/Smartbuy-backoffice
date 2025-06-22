import * as React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import MenuIcon from '@mui/icons-material/Menu';
import { closeSidebar } from '../../utils';

export interface MobileMenuItem {
  label: string;
  icon: React.ReactNode;
  value: "home" | "orders" | "products" | "messages" | "users" | "suppliers" | "purchaseorders" | "tickets" | "smscampaigns";
}

interface MobileMenuProps {
  items: MobileMenuItem[];
  value: "home" | "orders" | "products" | "messages" | "users" | "suppliers" | "purchaseorders" | "tickets" | "smscampaigns";
  onChange: (value: "home" | "orders" | "products" | "messages" | "users" | "suppliers" | "purchaseorders" | "tickets" | "smscampaigns") => void;
}

export default function MobileMenu({ items, value, onChange }: MobileMenuProps) {
  const muiTheme = React.useMemo(() => createTheme(), []);
  return (
    <ThemeProvider theme={muiTheme}>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_e, newValue) => onChange(newValue)}
        >
          <BottomNavigationAction
            label={''}
            icon={<MenuIcon />}
            onClick={(e) => {
              e.preventDefault();
              closeSidebar();
            }}
          />
          {items.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              icon={item.icon}
              value={item.value}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </ThemeProvider>
  );
}
