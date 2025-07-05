/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import IconButton from '@mui/joy/IconButton';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import { supabase } from '../utils/supabaseClient';
import useMediaQuery from '@mui/material/useMediaQuery';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import fonts from '../theme/fonts';
import PageLayout from '../layouts/PageLayout';

const typographyStyles = { fontSize: fonts.sizes.small };

// User type
interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  created_at: string | null;
  last_login: string | null;
  phone: string | null;
}

interface PageUsersDesktopProps {
  users: User[];
}

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

export default function PageUsersDesktop({ users }: PageUsersDesktopProps) {
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [createOpen, setCreateOpen] = React.useState(false);

  const isMobile = useMediaQuery('(max-width:600px)');

  // Unique roles for filter
  const roleOptions = Array.from(new Set(users.map(u => u.role).filter(Boolean)));

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Mobile rendering (optional: implement if you have a mobile component)
  if (isMobile) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>Users</Typography>
        <Typography>Mobile view not implemented.</Typography>
      </Box>
    );
  }

  return (
    <PageLayout>
      <Box sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, pl: 0, pr: 0 }}>
        <Typography level="h2" sx={{ mb: 2, textAlign: 'left', fontSize: 'xlarge' }}>Users</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Input
            placeholder="Search users..."
            sx={{ flex: 1, ...typographyStyles }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            startDecorator={<SearchIcon />}
          />
          <Select
            placeholder="Filter role"
            value={roleFilter}
            onChange={(_, value) => setRoleFilter(value ?? 'all')}
            sx={{ minWidth: 160, ...typographyStyles }}
          >
            <Option value="all">All Roles</Option>
            {roleOptions.map(role => (
              <Option key={role} value={role}>{role}</Option>
            ))}
          </Select>
          <Button
            onClick={() => setCreateOpen(true)}
            variant="solid"
            sx={typographyStyles}
          >
            Create User
          </Button>
        </Box>
        <Card>
          <Table aria-label="Users" sx={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={typographyStyles}>Name</th>
                <th style={typographyStyles}>Email</th>
                <th style={typographyStyles}>Role</th>
                <th style={typographyStyles}>Created At</th>
                <th style={typographyStyles}>Last Login</th>
                <th style={typographyStyles}>Phone</th>
                <th style={{ width: 120 }} />
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>No users found.</td>
                </tr>
              )}
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ cursor: 'pointer' }}>
                  <td style={typographyStyles}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar size="sm">{user.name ? user.name[0] : '?'}</Avatar>
                      <div>
                        <Typography level="body-xs" fontWeight="md" sx={typographyStyles}>
                          {user.name || 'Unknown'}
                        </Typography>
                      </div>
                    </Box>
                  </td>
                  <td style={typographyStyles}>{user.email}</td>
                  <td style={typographyStyles}>{user.role || '-'}</td>
                  <td style={typographyStyles}>{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                  <td style={typographyStyles}>{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</td>
                  <td style={typographyStyles}>{user.phone || '-'}</td>
                  <td><RowMenu /></td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
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
            {/* User creation form goes here */}
            <Typography>Form not implemented.</Typography>
          </ModalDialog>
        </Modal>
      </Box>
    </PageLayout>
  );
}
