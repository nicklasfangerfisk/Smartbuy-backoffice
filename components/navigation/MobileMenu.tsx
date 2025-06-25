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
import { supabase } from '../../utils/supabaseClient';
import { useLocation } from 'react-router-dom';

export interface MobileMenuItem {
  label: string;
  icon: React.ReactNode;
  value: "home" | "orders" | "products" | "messages" | "users" | "suppliers" | "purchaseorders" | "tickets" | "smscampaigns" | "movements";
}

interface MobileMenuProps {
  items: MobileMenuItem[];
  value: "home" | "orders" | "products" | "messages" | "users" | "suppliers" | "purchaseorders" | "tickets" | "smscampaigns" | "movements";
  onChange: (value: "home" | "orders" | "products" | "messages" | "users" | "suppliers" | "purchaseorders" | "tickets" | "smscampaigns" | "movements") => void;
  toggleSidebar: () => void; // Added prop to toggle the sidebar
}

/**
 * A mobile-friendly bottom navigation menu.
 *
 * This component provides a dynamic navigation bar for mobile devices.
 * It uses Material-UI components and supports custom menu items.
 *
 * @param {MobileMenuProps} props - The props for the MobileMenu component.
 * @param {MobileMenuItem[]} props.items - Array of menu items to display.
 * @param {string} props.value - The currently selected menu item value.
 * @param {function} props.onChange - Callback function triggered when the selected menu item changes.
 *
 * @returns {JSX.Element} The rendered mobile menu component.
 */
export default function MobileMenu({ items, value, onChange, toggleSidebar }: MobileMenuProps) {
  const location = useLocation();

  // Ensure the menu is hidden on the login page
  if (location.pathname === '/login') {
    return null;
  }

  const muiTheme = React.useMemo(() => createTheme({
    components: {
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    },
  }), []);

  const handleNavigation = async (newValue: MobileMenuItem['value']) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session && ['orders', 'products', 'users', 'suppliers', 'purchaseorders', 'tickets', 'smscampaigns', 'movements'].includes(newValue)) {
      alert('You must be logged in to access this page.');
      return;
    }
    onChange(newValue);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999, backgroundColor: 'rgba(0, 0, 255, 0.2)' }}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_e, newValue) => {
            handleNavigation(newValue);
          }}
        >
          <BottomNavigationAction
            label={''}
            icon={<MenuIcon />}
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation events
              toggleSidebar();
            }}
          />
          {items.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              icon={item.icon}
              value={item.value}
              onClick={() => handleNavigation(item.value)}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </ThemeProvider>
  );
}
