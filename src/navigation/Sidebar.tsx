import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Tooltip from '@mui/joy/Tooltip';
import Card from '@mui/joy/Card';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import Input from '@mui/joy/Input';
import LinearProgress from '@mui/joy/LinearProgress';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { listItemButtonClasses } from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import QuestionAnswerRoundedIcon from '@mui/icons-material/QuestionAnswerRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SupportRoundedIcon from '@mui/icons-material/SupportRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { LogoutRounded as LogoutRoundedIcon } from '@mui/icons-material';
import BrightnessAutoRoundedIcon from '@mui/icons-material/BrightnessAutoRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import StorefrontIcon from '@mui/icons-material/Storefront';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { useNavigate, useLocation } from 'react-router-dom';

import ColorSchemeToggle from './ColorSchemeToggle';
// TODO: Implement closeSidebar or remove its usage if not needed.
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import withAuth from '../auth/withAuth';
import { menuByArea, MenuArea, MenuItem } from './menuConfig';
import { useResponsive } from '../hooks/useResponsive';

/**
 * Sidebar component for navigation.
 * @param {Object} props - Component props.
 * @param {function} props.setView - Function to update the current view.
 * @param {string} props.view - Current view identifier.
 */
function Sidebar({ setView, view }: { setView: (view: MenuItem['value']) => void, view: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null); // Auth user
  const [userProfile, setUserProfile] = useState<any>(null); // Contextual user row
  /**
   * Fetches the list of users from the database.
   */
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) setUsers(data);
    }
    fetchUsers();

    /**
     * Handles the authenticated user and fetches their profile.
     * @param {Object} authUser - The authenticated user object.
     */
    async function handleAuthUser(authUser: any) {
      setUser(authUser);
      if (authUser) {
        // Try to fetch user row
        let { data: userRow } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        if (!userRow) {
          // If not found, upsert as employee by default
          await supabase.from('users').upsert({
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.full_name || null,
            avatar_url: authUser.user_metadata?.avatar_url || null,
            role: 'employee',
          });
          userRow = { ...authUser, role: 'employee' };
        }
        // Do NOT sign out or block user here based on role; only set profile state
        setUserProfile(userRow);
      } else {
        setUserProfile(null);
      }
    }

    supabase.auth.getUser().then(({ data }: { data: any }) => handleAuthUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      handleAuthUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  // Auto-collapse logic based on breakpoints
  useEffect(() => {
    if (isTablet) {
      // Between 900-600px: auto-collapse on mount
      setIsCollapsed(true);
    } else if (isDesktop) {
      // Above 900px: keep current state (user can manually toggle)
      // Don't auto-expand, let user decide
    }
    // Below 600px: mobile menu handles navigation, sidebar is hidden
  }, [isTablet, isDesktop]);
  
  // Handle menu item clicks
  const handleMenuItemClick = (item: MenuItem) => {
    // Navigate to the route
    navigate(item.route);
    setView(item.value);
    
    // Auto-collapse behavior based on breakpoint
    if (isTablet) {
      // Between 900-600px: auto-collapse after navigation
      setIsCollapsed(true);
    }
    // Above 900px: don't auto-collapse, let user keep it open
  };
  
  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigation = (route: string, viewName: string) => {
    // Create a MenuItem-like object for the handleMenuItemClick logic
    const menuItem: MenuItem = {
      value: viewName as any,
      route: route,
      label: viewName,
      icon: null as any, // Icon not needed for navigation logic
      showInMobile: true // Default value
    };
    handleMenuItemClick(menuItem);
  };

  const isSelected = (route: string) => location.pathname === route;

  return (
    <Box
      className="Sidebar"
      sx={{
        display: isMobile ? 'none' : 'flex', // hide sidebar only on mobile (<=600px)
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 10000,
        height: '100vh', // match main layout viewport height
        maxHeight: '100vh', // ensure it doesn't exceed viewport
        minHeight: '100vh', // maintain minimum height for proper layout
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
        background: 'var(--joy-palette-background-surface, #fff)',
        overflow: 'hidden', // prevent sidebar itself from scrolling
        boxSizing: 'border-box', // ensure padding is included in height calculation
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': isCollapsed ? '60px' : '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': isCollapsed ? '60px' : '240px',
            },
          },
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: 'fixed',
          zIndex: 9998,
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          opacity: 'var(--SideNavigation-slideIn)',
          backgroundColor: 'var(--joy-palette-background-backdrop)',
          transition: 'opacity 0.4s',
          transform: {
            xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))',
            lg: 'translateX(-100%)',
          },
        }}
        // onClick={() => closeSidebar()}
      />
      {/* Sidebar header with logo and theme toggle */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
        <IconButton
          size="sm"
          variant="plain"
          onClick={toggleSidebar}
          sx={{ 
            p: 0.5,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'neutral.100'
            }
          }}
        >
          <img src="/favicon.svg" alt="Logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
        </IconButton>
        {!isCollapsed && (
          <>
            <Typography level="title-lg">Smartbuy</Typography>
            <ColorSchemeToggle sx={{ ml: 'auto' }} />
          </>
        )}
      </Box>
      {/* Search input - only show when not collapsed */}
      {!isCollapsed && (
        <Box sx={{ flexShrink: 0 }}>
          <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" />
        </Box>
      )}
      {/* Navigation list */}
      <Box
        sx={{
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          flex: '1 1 auto', // allow it to grow and shrink as needed
          display: 'flex',
          flexDirection: 'column',
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5,
          },
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            '--List-nestedInsetStart': '30px',
            '--ListItem-radius': (theme) => theme.vars.radius.sm,
          }}
        >
          {(['Sales', 'Support', 'Operations', 'Marketing', 'Administration'] as MenuArea[]).map((area) => (
            <ListItem nested key={area}>
              <Toggler defaultExpanded={!isCollapsed}
                renderToggle={({ open, setOpen }) => (
                  isCollapsed ? (
                    <Tooltip title={area} placement="right" arrow>
                      <ListItemButton onClick={() => setOpen(!open)}>
                        {menuByArea[area][0]?.icon}
                      </ListItemButton>
                    </Tooltip>
                  ) : (
                    <ListItemButton onClick={() => setOpen(!open)}>
                      {menuByArea[area][0]?.icon}
                      <ListItemContent>
                        <Typography level="title-sm">{area}</Typography>
                      </ListItemContent>
                      <KeyboardArrowDownIcon
                        sx={[
                          open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                        ]}
                      />
                    </ListItemButton>
                  )
                )}
              >
                <List sx={{ gap: 0.5 }}>
                  {menuByArea[area].map((item: MenuItem) => (
                    <ListItem key={item.value}>
                      {isCollapsed ? (
                        <Tooltip 
                          title={item.label} 
                          placement="right" 
                          arrow
                        >
                          <ListItemButton 
                            selected={isSelected(item.route)} 
                            onClick={() => handleNavigation(item.route, item.value)}
                            sx={{
                              justifyContent: 'center',
                              px: 1,
                              width: '100%',
                            }}
                          >
                            {item.icon}
                          </ListItemButton>
                        </Tooltip>
                      ) : (
                        <ListItemButton 
                          selected={isSelected(item.route)} 
                          onClick={() => handleNavigation(item.route, item.value)}
                          sx={{
                            justifyContent: 'flex-start',
                            px: 2,
                            width: '100%',
                          }}
                        >
                          {item.icon}
                          <ListItemContent>
                            <Typography level="body-sm">{item.label}</Typography>
                          </ListItemContent>
                        </ListItemButton>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Toggler>
            </ListItem>
          ))}
        </List>
        {/* Settings and Logout removed - user profile now handles navigation to settings */}
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        {/* Settings and Logout buttons removed as requested */}
      </Box>
      <Divider sx={{ flexShrink: 0 }} />
      {/* User profile section - clickable to navigate to Settings */}
      <Box 
        sx={{ 
          display: 'flex', 
          gap: 1, 
          alignItems: 'center', 
          minHeight: 48,
          flexShrink: 0, // prevent shrinking
          cursor: 'pointer',
          borderRadius: 'sm',
          '&:hover': {
            bgcolor: 'neutral.50'
          }
        }}
        onClick={() => handleNavigation('/settings', 'settings')}
      >
        <Avatar
          variant="outlined"
          size="sm"
          src={userProfile?.avatar_url || user?.user_metadata?.avatar_url || undefined}
        >
          {/* Fallback initials if no avatar */}
          {(!userProfile?.avatar_url && !user?.user_metadata?.avatar_url) && (
            userProfile?.first_name || userProfile?.last_name ? 
              `${userProfile.first_name?.[0] || ''}${userProfile.last_name?.[0] || ''}`.toUpperCase() :
              user?.user_metadata?.full_name ?
                user.user_metadata.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() :
                user?.email ? 
                  user.email.substring(0, 2).toUpperCase() :
                  'U'
          )}
        </Avatar>
        {!isCollapsed && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography level="title-sm">
              {userProfile?.first_name || userProfile?.last_name 
                ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim()
                : user?.user_metadata?.full_name || user?.email || 'Not signed in'
              }
            </Typography>
            <Typography level="body-xs">{user?.email || ''}</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/**
 * Toggler component for expandable sections.
 * @param {Object} props - Component props.
 * @param {boolean} [props.defaultExpanded=false] - Whether the section is expanded by default.
 * @param {function} props.renderToggle - Function to render the toggle button.
 * @param {React.ReactNode} props.children - Content to display inside the section.
 */
function Toggler({
  defaultExpanded = false,
  renderToggle,
  children,
}: {
  defaultExpanded?: boolean;
  children: React.ReactNode;
  renderToggle: (params: {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultExpanded);
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={{
          display: 'grid',
          transition: '0.2s ease',
          '& > *': {
            overflow: 'hidden',
          },
          gridTemplateRows: open ? '1fr' : '0fr',
        }}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

export default withAuth(Sidebar);
