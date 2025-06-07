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

import ColorSchemeToggle from './ColorSchemeToggle';
import UserDialog from './UserDialog';
import { closeSidebar } from '../utils';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

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
        sx={[
          {
            display: 'grid',
            transition: '0.2s ease',
            '& > *': {
              overflow: 'hidden',
            },
          },
          open ? { gridTemplateRows: '1fr' } : { gridTemplateRows: '0fr' },
        ]}
      >
        {children}
      </Box>
    </React.Fragment>
  );
}

export default function Sidebar({ setView, view }: { setView: (view: 'home' | 'orders' | 'products' | 'messages' | 'users' | 'suppliers' | 'purchaseorders') => void, view: string }) {
  const [users, setUsers] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null); // Auth user
  const [userProfile, setUserProfile] = useState<any>(null); // Contextual user row
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('users').select('*');
      if (!error && data) setUsers(data);
    }
    fetchUsers();

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

    supabase.auth.getUser().then(({ data }) => handleAuthUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthUser(session?.user ?? null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleEditProfile = async () => {
    if (!user) return;
    await supabase.from('users').update({ name: editName, avatar_url: editAvatar }).eq('id', user.id);
    // Refresh user profile
    const { data: userRows } = await supabase.from('users').select('*').eq('id', user.id).single();
    setUserProfile(userRows || null);
    setEditOpen(false);
  };

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
        height: '100dvh',
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
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <IconButton variant="soft" color="primary" size="sm">
          <BrightnessAutoRoundedIcon />
        </IconButton>
        <Typography level="title-lg">Smartbuy</Typography>
        <ColorSchemeToggle sx={{ ml: 'auto' }} />
      </Box>
      <Input size="sm" startDecorator={<SearchRoundedIcon />} placeholder="Search" />
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
                  <ListItemButton selected={view === 'home'} onClick={() => setView('home')}>
                    <HomeRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Home</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton selected={view === 'orders'} onClick={() => setView('orders')}>
                    <ShoppingCartRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Orders</Typography>
                    </ListItemContent>
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton selected={view === 'products'} onClick={() => setView('products')}>
                    <AssignmentRoundedIcon />
                    <ListItemContent>
                      <Typography level="body-sm">Products</Typography>
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
                  <ListItemButton selected={view === 'messages'} onClick={() => setView('messages')}>
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
                  <ListItemButton selected={view === 'users'} onClick={() => setView('users')}>
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
                  <ListItemButton selected={view === 'suppliers'} onClick={() => setView('suppliers')}>
                    Suppliers
                  </ListItemButton>
                </ListItem>
                <ListItem>
                  <ListItemButton selected={view === 'purchaseorders'} onClick={() => setView('purchaseorders')}>
                    Purchase Orders
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
            <ListItemButton onClick={async () => { await supabase.auth.signOut(); }} sx={{ width: '100%', alignItems: 'center', minHeight: 40 }}>
              <LogoutRoundedIcon sx={{ mr: 1 }} />
              <ListItemContent sx={{ display: 'flex', alignItems: 'center', p: 0 }}>
                <Typography level="body-sm">Logout</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Divider />
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
