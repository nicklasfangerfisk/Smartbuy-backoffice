import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
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
import Sheet from '@mui/joy/Sheet';
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
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
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
import UserDialog from '../Dialog/UserDialog';
import { closeSidebar } from '../../utils';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import withAuth from '../auth/withAuth';

/**
 * Sidebar component for navigation.
 * @param {Object} props - Component props.
 * @param {function} props.setView - Function to update the current view.
 * @param {string} props.view - Current view identifier.
 */
function Sidebar({ setView, view }: { setView: (view: 'home' | 'orders' | 'products' | 'messages' | 'users' | 'suppliers' | 'purchaseorders' | 'tickets' | 'smscampaigns') => void, view: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null); // Auth user
  const [userProfile, setUserProfile] = useState<any>(null); // Contextual user row
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
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
        setEditName(userRow.name || '');
        setEditAvatar(userRow.avatar_url || '');
      } else {
        setUserProfile(null);
        setEditName('');
        setEditAvatar('');
      }
    }

    supabase.auth.getUser().then(({ data }: { data: any }) => handleAuthUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      handleAuthUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  /**
   * Updates the user profile with the edited name and avatar.
   */
  const handleEditProfile = async () => {
    if (!user) return;
    await supabase.from('users').update({ name: editName, avatar_url: editAvatar }).eq('id', user.id);
    // Refresh user profile
    const { data: userRows } = await supabase.from('users').select('*').eq('id', user.id).single();
    setUserProfile(userRows || null);
    setEditOpen(false);
  };

  const handleNavigation = (route: string, viewName: string) => {
    setView(viewName as any);
    navigate(route);
  };

  const isSelected = (route: string) => location.pathname === route;

  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: 'fixed', md: 'sticky' },
        transform: {
          xs: 'translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))',
          md: 'none',
        },
        transition: 'transform 0.4s, width 0.4s',
        zIndex: 10000,
        minHeight: '100dvh',
        width: 'var(--Sidebar-width)',
        top: 0,
        p: 2,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Sidebar-width': '220px',
            [theme.breakpoints.up('lg')]: {
              '--Sidebar-width': '240px',
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
        onClick={() => closeSidebar()}
      />
      {/* Sidebar header with logo and theme toggle */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <img src="/favicon.svg" alt="Logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
        <Typography level="title-lg">Smartbuy</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      {/* Search input */}
      <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" />
      {/* Navigation list */}
      <Box
        sx={{
          minHeight: 0,
          overflow: 'hidden auto',
          flexGrow: 1,
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
          {/* Sales Accordion - expanded by default */}
          <ListItem nested>
            <Toggler defaultExpanded={true}
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <DashboardRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Sales</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem>
                  <ListItemButton selected={isSelected('/dashboard')} onClick={() => handleNavigation('/dashboard', 'home')}>
                    <HomeRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Home</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton selected={isSelected('/orders')} onClick={() => handleNavigation('/orders', 'orders')}>
                    <ShoppingCartRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Orders</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
                <ListItem nested>
                  <Toggler
                    renderToggle={({ open, setOpen }) => (
                      <ListItemButton onClick={() => setOpen(!open)}>
                        <AssignmentRoundedIcon />
                        <ListItemContent>
                          <Typography level="body-sm">Deliveries</Typography>
                        </ListItemContent>
                        <KeyboardArrowDownIcon
                          sx={[
                            open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                          ]}
                        />
                      </ListItemButton>
                    )}
                  >
                    <List sx={{ gap: 0.5 }}>
                      <ListItem sx={{ mt: 0.5 }}>
                        <ListItemButton>New order</ListItemButton>
                      </ListItem>
                      <ListItem>
                        <ListItemButton>Backlog</ListItemButton>
                      </ListItem>
                      <ListItem>
                        <ListItemButton>In progress</ListItemButton>
                      </ListItem>
                      <ListItem>
                        <ListItemButton>Shipped</ListItemButton>
                      </ListItem>
                    </List>
                  </Toggler>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>

          {/* Support Accordion - expanded by default */}
          <ListItem nested>
            <Toggler defaultExpanded={true}
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <SupportRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Support</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem>
                  <ListItemButton selected={isSelected('/messages')} onClick={() => setView('messages')}>
                    <QuestionAnswerRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Messages</Typography>
                    </ListItemContent>
                    <Chip size="sm" color="primary" variant="solid">
                      4
                    </Chip>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton selected={isSelected('/tickets')} onClick={() => handleNavigation('/tickets', 'tickets')}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Tickets</Typography>
                    </ListItemContent>
                    <Chip size="sm" color="primary" variant="solid">
                      2
                    </Chip>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton selected={isSelected('/users')} onClick={() => handleNavigation('/users', 'users')}>
                    <GroupRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Users</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>

          {/* Purchasing Accordion - expanded by default */}
          <ListItem nested>
            <Toggler defaultExpanded={true}
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <AssignmentRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Purchasing</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem>
                  <ListItemButton selected={isSelected('/products')} onClick={() => handleNavigation('/products', 'products')}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Products</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton selected={isSelected('/suppliers')} onClick={() => handleNavigation('/suppliers', 'suppliers')}>
                    <StorefrontIcon sx={{ mr: 0.5 }} />
                    <ListItemContent>
                      <Typography level="body-sm">Suppliers</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton selected={isSelected('/purchase-orders')} onClick={() => handleNavigation('/purchase-orders', 'purchaseorders')}>
                    <AssignmentTurnedInIcon sx={{ mr: 0.5 }} />
                    <ListItemContent>
                      <Typography level="body-sm">Purchase Orders</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>

          {/* Marketing Accordion - expanded by default */}
          <ListItem nested>
            <Toggler defaultExpanded={true}
              renderToggle={({ open, setOpen }) => (
                <ListItemButton onClick={() => setOpen(!open)}>
                  <AssignmentRoundedIcon />
                  <ListItemContent>
                    <Typography level="title-sm">Marketing</Typography>
                  </ListItemContent>
                  <KeyboardArrowDownIcon
                    sx={[
                      open ? { transform: 'rotate(180deg)' } : { transform: 'none' },
                    ]}
                  />
                </ListItemButton>
              )}
            >
              <List sx={{ gap: 0.5 }}>
                <ListItem>
                  <ListItemButton selected={isSelected('/sms-campaigns')} onClick={() => handleNavigation('/sms-campaigns', 'smscampaigns')}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">SMS Campaigns</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
              </List>
            </Toggler>
          </ListItem>
        </List>
        {/* Settings Button (stick to bottom) */}
      </Box>
      <Box sx={{ mt: 'auto', mb: 2 }}>
        <List sx={{ p: 0 }}>
          <ListItem sx={{ p: 0, alignItems: 'stretch' }}>
            <ListItemButton sx={{ width: '100%', alignItems: 'center', minHeight: 40 }}>
              <SettingsRoundedIcon sx={{ mr: 1 }} />
              <ListItemContent sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
                <Typography level="body-sm">Settings</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem sx={{ p: 0, alignItems: 'stretch' }}>
            <ListItemButton
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/login'; // Redirect to login page after logout
              }}
              sx={{ width: '100%', alignItems: 'center', minHeight: 40 }}
            >
              <LogoutRoundedIcon sx={{ mr: 1 }} />
              <ListItemContent sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
                <Typography level="body-sm">Logout</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Divider />
      {/* User profile section */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minHeight: 48 }}>
        <Avatar
          variant="outlined"
          size="sm"
          src={userProfile?.avatar_url || user?.user_metadata?.avatar_url || undefined}
          onClick={() => setUserDialogOpen(true)}
          sx={{ cursor: 'pointer' }}
        />
        <Box sx={{ minWidth: 0, flex: 1, cursor: 'pointer' }} onClick={() => setUserDialogOpen(true)}>
          <Typography level="title-sm">{userProfile?.name || user?.user_metadata?.full_name || user?.email || 'Not signed in'}</Typography>
          <Typography level="body-xs">{userProfile?.email || user?.email || ''}</Typography>
        </Box>
      </Box>
      <UserDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        userProfile={userProfile}
        editName={editName}
        setEditName={setEditName}
        editAvatar={editAvatar}
        setEditAvatar={setEditAvatar}
        onSave={handleEditProfile}
      />
    </Sheet>
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
