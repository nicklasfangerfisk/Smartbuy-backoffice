import * as React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { supabase } from '../utils/supabaseClient';
import { useLocation } from 'react-router-dom';
import { menuItems, menuByArea, MenuArea, MenuValue } from '../../navigation/menuConfig.tsx';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export interface MobileMenuItem {
  label: string;
  icon: React.ReactNode;
  value: MenuValue;
}

interface MobileMenuProps {
  items: MobileMenuItem[];
  value: MenuValue;
  onChange: (value: MenuValue) => void;
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
export default function MobileMenu({ value, onChange, toggleSidebar }: MobileMenuProps) {
  const location = useLocation();
  const [areaDialogOpen, setAreaDialogOpen] = React.useState(false);
  const [selectedArea, setSelectedArea] = React.useState<MenuArea | null>('Sales');

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

  // Use only items marked for mobile
  const mobileMenuItems = menuItems.filter((item) => item.showInMobile);
  // Only show submenus for the selected area
  const areaMenuItems = selectedArea ? menuByArea[selectedArea].filter((item: typeof menuItems[number]) => item.showInMobile) : [];

  const handleNavigation = async (newValue: typeof mobileMenuItems[number]['value']) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session && [
      'orders', 'products', 'users', 'suppliers', 'purchaseorders', 'tickets', 'smscampaigns', 'movements'
    ].includes(newValue)) {
      alert('You must be logged in to access this page.');
      return;
    }
    onChange(newValue as MobileMenuProps['value']);
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <Dialog open={areaDialogOpen} onClose={() => setAreaDialogOpen(false)}>
        <DialogTitle>Select Area</DialogTitle>
        <DialogContent>
          {(['Sales', 'Support', 'Marketing', 'Operations'] as MenuArea[]).map((area) => (
            <Button
              key={area}
              fullWidth
              variant={selectedArea === area ? 'contained' : 'outlined'}
              onClick={() => {
                setSelectedArea(area);
                setAreaDialogOpen(false);
              }}
              sx={{ my: 1 }}
            >
              {area}
            </Button>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAreaDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(0, 0, 255, 0.2)',
          overflow: 'hidden', // Prevent scrolling
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', overflowX: 'auto' }}>
          <BottomNavigation
            showLabels
            value={value}
            onChange={(_e, newValue) => {
              handleNavigation(newValue);
            }}
            sx={{ minWidth: 'max-content', flex: 1 }}
          >
            {areaMenuItems.map((item) => (
              <BottomNavigationAction
                key={item.value}
                label={item.label}
                icon={item.icon}
                value={item.value}
                onClick={() => handleNavigation(item.value)}
              />
            ))}
            <BottomNavigationAction
              label={selectedArea || ''}
              icon={<MenuIcon />}
              onClick={(e) => {
                e.stopPropagation();
                setAreaDialogOpen(true);
              }}
            />
          </BottomNavigation>
        </div>
      </Paper>
    </ThemeProvider>
  );
}
