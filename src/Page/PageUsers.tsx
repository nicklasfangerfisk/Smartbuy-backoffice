/**
 * PageUsers - User management and administration
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout + ResponsiveContainer(table-page) - 16px padding
 * Responsive: Mobile/Desktop views, useResponsive() hook
 * Data: Supabase Users table with role management
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import Table from '@mui/joy/Table';
import Stack from '@mui/joy/Stack';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LoginIcon from '@mui/icons-material/Login';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PageLayout from '../layouts/PageLayout';
import fonts from '../theme/fonts';

// Types
export interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  created_at: string | null;
  last_login: string | null;
  phone: string | null;
}

// Typography styles for consistency
const typographyStyles = { fontSize: fonts.sizes.small };
const headerStyles = { ...typographyStyles, fontWeight: 600, borderBottom: '1.5px solid #e0e0e0', background: 'inherit' };

// Helper functions
const getRoleColor = (role: string | null) => {
  switch (role?.toLowerCase()) {
    case 'admin': return 'danger';
    case 'manager': return 'warning';
    case 'user': return 'primary';
    case 'staff': return 'success';
    default: return 'neutral';
  }
};

const getRoleIcon = (role: string | null) => {
  switch (role?.toLowerCase()) {
    case 'admin': return <AdminPanelSettingsIcon />;
    case 'manager': return <SupervisorAccountIcon />;
    case 'user': return <PersonIcon />;
    case 'staff': return <AccountCircleIcon />;
    default: return <PersonIcon />;
  }
};

// Generate avatar color based on user name/email
const getAvatarColor = (name: string | null, email: string): 'primary' | 'success' | 'warning' | 'danger' | 'neutral' => {
  const str = name || email;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors: ('primary' | 'success' | 'warning' | 'danger' | 'neutral')[] = ['primary', 'success', 'warning', 'danger', 'neutral'];
  return colors[Math.abs(hash) % colors.length];
};

// Generate initials from name or email
const getInitials = (name: string | null, email: string) => {
  if (name) {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

// Row menu component
function RowMenu() {
  return (
    <Dropdown>
      <MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}>
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Reset Password</MenuItem>
        <MenuItem>Disable</MenuItem>
        <MenuItem color="danger">Delete</MenuItem>
      </Menu>
    </Dropdown>
  );
}

const PageUsers = () => {
  const { isMobile } = useResponsive();
  
  // Data states
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.from('users').select('*');
      
      if (error) throw error;

      if (data) {
        const mappedUsers = data.map((user) => ({
          id: user.id,
          name: user.name || null,
          email: user.email,
          role: user.role || null,
          created_at: user.created_at || null,
          last_login: user.last_login || null,
          phone: user.phone || null,
        }));
        setUsers(mappedUsers);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Get unique roles for filter
  const roleOptions = Array.from(new Set(users.map(u => u.role).filter(Boolean)));

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sort users by name/email
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const nameA = a.name || a.email;
    const nameB = b.name || b.email;
    return nameA.localeCompare(nameB);
  });

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      {/* Header */}
      <ResponsiveContainer padding="medium">
        <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
          Users
        </Typography>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startDecorator={<SearchIcon />}
            sx={{ flex: 1 }}
          />
          <Select
            placeholder="Role"
            value={roleFilter}
            onChange={(_, value) => setRoleFilter(value ?? 'all')}
            sx={{ minWidth: 120 }}
          >
            <Option value="all">All</Option>
            {roleOptions.map(role => (
              <Option key={role} value={role}>{role}</Option>
            ))}
          </Select>
        </Box>

        <Button
          variant="solid"
          startDecorator={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ width: '100%', mb: 2 }}
        >
          Create User
        </Button>
      </ResponsiveContainer>

      {/* Loading and Error States */}
      {loading && <LinearProgress />}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="danger">Error: {error}</Typography>
        </Box>
      )}

      {/* User List */}
      <Box>
        {sortedUsers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="neutral">
              No users found
            </Typography>
          </Box>
        ) : (
          sortedUsers.map((user) => (
            <Box 
              key={user.id} 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'background.level1'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Avatar */}
                <Avatar
                  size="md"
                  color={getAvatarColor(user.name, user.email)}
                  sx={{ flexShrink: 0 }}
                >
                  {getInitials(user.name, user.email)}
                </Avatar>

                {/* Main Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography 
                      level="title-sm" 
                      sx={{ 
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '60%'
                      }}
                    >
                      {user.name || 'Unnamed User'}
                    </Typography>
                    
                    {/* Role Chip */}
                    {user.role && (
                      <Chip 
                        size="sm"
                        color={getRoleColor(user.role)}
                        variant="soft"
                        sx={{ fontWeight: 'bold', minWidth: 'fit-content', textTransform: 'capitalize' }}
                      >
                        {user.role}
                      </Chip>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmailIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                    <Typography level="body-xs" color="neutral">
                      {user.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                    {user.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                        <Typography level="body-xs" color="neutral">
                          {user.phone}
                        </Typography>
                      </Box>
                    )}
                    {user.last_login && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LoginIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                        <Typography level="body-xs" color="neutral">
                          {new Date(user.last_login).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {user.created_at && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                      <Typography level="body-xs" color="neutral">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );

  // Desktop View Component
  const DesktopView = () => (
    <ResponsiveContainer variant="table-page">
      <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
        Users
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search users..."
          sx={{ flex: 1 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          startDecorator={<SearchIcon />}
        />
        <Select
          placeholder="Filter role"
          value={roleFilter}
          onChange={(_, value) => setRoleFilter(value ?? 'all')}
          sx={{ minWidth: 160 }}
        >
          <Option value="all">All Roles</Option>
          {roleOptions.map(role => (
            <Option key={role} value={role}>{role}</Option>
          ))}
        </Select>
        <Button
          onClick={() => setCreateOpen(true)}
          variant="solid"
          startDecorator={<AddIcon />}
        >
          Create User
        </Button>
      </Box>

      <Card sx={{ overflow: 'visible' }}>
        {loading && <LinearProgress />}
        {error && <Typography color="danger">Error: {error}</Typography>}
        
        <Table aria-label="Users" sx={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={headerStyles}>Name</th>
              <th style={headerStyles}>Email</th>
              <th style={headerStyles}>Role</th>
              <th style={headerStyles}>Created At</th>
              <th style={headerStyles}>Last Login</th>
              <th style={headerStyles}>Phone</th>
              <th style={{ width: 120, ...headerStyles }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>
                  No users found.
                </td>
              </tr>
            )}
            {sortedUsers.map((user) => (
              <tr key={user.id} style={{ cursor: 'pointer', height: 48 }}>
                <td style={typographyStyles}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                      size="sm" 
                      color={getAvatarColor(user.name, user.email)}
                    >
                      {getInitials(user.name, user.email)}
                    </Avatar>
                    <Typography level="body-sm" fontWeight="md">
                      {user.name || 'Unnamed User'}
                    </Typography>
                  </Box>
                </td>
                <td style={typographyStyles}>{user.email}</td>
                <td style={typographyStyles}>
                  {user.role ? (
                    <Chip
                      size="sm"
                      color={getRoleColor(user.role)}
                      variant="soft"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {user.role}
                    </Chip>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={typographyStyles}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                </td>
                <td style={typographyStyles}>
                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : '-'}
                </td>
                <td style={typographyStyles}>{user.phone || '-'}</td>
                <td><RowMenu /></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </ResponsiveContainer>
  );

  return (
    <PageLayout>
      {isMobile ? <MobileView /> : <DesktopView />}
      
      {/* Create User Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        aria-labelledby="create-user-modal"
      >
        <ModalDialog aria-labelledby="create-user-modal" sx={{ maxWidth: 600, width: '100%' }}>
          <ModalClose />
          <Typography id="create-user-modal" level="title-md" fontWeight="lg" sx={{ mb: 2 }}>
            Create User
          </Typography>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            User creation functionality will be implemented here.
          </Typography>
          <Button onClick={() => setCreateOpen(false)} variant="outlined">
            Close
          </Button>
        </ModalDialog>
      </Modal>
    </PageLayout>
  );
};

export default PageUsers;
