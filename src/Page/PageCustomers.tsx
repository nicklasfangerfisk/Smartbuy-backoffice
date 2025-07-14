/**
 * PageCustomers - Customer management 
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout + ResponsiveContainer(table-page) - 16px padding
 * Responsive: Mobile/Desktop views, useResponsive() hook
 * Data: Supabase Users table filtered for customer roles
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
import GroupIcon from '@mui/icons-material/Group';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LoginIcon from '@mui/icons-material/Login';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PageLayout from '../layouts/PageLayout';
import DialogCustomer, { CustomerProfile } from '../Dialog/DialogCustomer';
import fonts from '../theme/fonts';

// Types
export interface CustomerItem {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: string | null;
  created_at: string | null;
  last_login: string | null;
  phone_number: string | null;
  avatar_url: string | null;
}

// Typography styles for consistency
const typographyStyles = { fontSize: fonts.sizes.small };
const headerStyles = { ...typographyStyles, fontWeight: 600, borderBottom: '1.5px solid #e0e0e0', background: 'inherit' };

// Helper functions
const getRoleColor = (role: string | null) => {
  switch (role?.toLowerCase()) {
    case 'customer': return 'primary';
    case 'vip': return 'warning';
    case 'premium': return 'success';
    default: return 'neutral';
  }
};

const getRoleIcon = (role: string | null) => {
  switch (role?.toLowerCase()) {
    case 'customer': return <PersonIcon />;
    case 'vip': return <GroupIcon />;
    case 'premium': return <GroupIcon />;
    default: return <PersonIcon />;
  }
};

// Generate avatar color based on user name/email
const getAvatarColor = (firstName: string | null, lastName: string | null, email: string): 'primary' | 'success' | 'warning' | 'danger' | 'neutral' => {
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const str = fullName || email;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors: ('primary' | 'success' | 'warning' | 'danger' | 'neutral')[] = ['primary', 'success', 'warning', 'danger', 'neutral'];
  return colors[Math.abs(hash) % colors.length];
};

// Generate initials from first/last name or email
const getInitials = (firstName: string | null, lastName: string | null, email: string) => {
  if (firstName || lastName) {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase();
  }
  return email.substring(0, 2).toUpperCase();
};

// Row menu component
function RowMenu({ onEdit, onView }: { onEdit: () => void, onView: () => void }) {
  return (
    <Dropdown>
      <MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}>
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem onClick={onView}>View Orders</MenuItem>
        <MenuItem onClick={onEdit}>Edit Customer</MenuItem>
        <MenuItem>Send Message</MenuItem>
        <MenuItem color="danger">Deactivate</MenuItem>
      </Menu>
    </Dropdown>
  );
}

const PageCustomers = () => {
  const { isMobile } = useResponsive();
  
  // Data states
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | undefined>();
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');

  // Fetch customers (filter for customer-type roles)
  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Filter for customer-related roles
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['customer', 'vip', 'premium', null]); // Include null for users without specific roles
      
      if (error) throw error;

      if (data) {
        const mappedCustomers = data.map((user) => ({
          id: user.id,
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          email: user.email,
          role: user.role || 'customer', // Default to customer if no role
          created_at: user.created_at || null,
          last_login: user.last_login || null,
          phone_number: user.phone_number || null,
          avatar_url: user.avatar_url || null,
        }));
        
        setCustomers(mappedCustomers);
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  // Dialog helper functions
  const handleAddCustomer = () => {
    setSelectedCustomer(undefined);
    setDialogMode('add');
    setCreateOpen(true);
  };

  const handleEditCustomer = (customer: CustomerItem) => {
    setSelectedCustomer(customer);
    setDialogMode('edit');
    setCreateOpen(true);
  };

  const handleViewCustomer = (customer: CustomerItem) => {
    setSelectedCustomer(customer);
    setDialogMode('view');
    setCreateOpen(true);
  };

  const handleDialogClose = () => {
    setCreateOpen(false);
    setSelectedCustomer(undefined);
  };

  const handleCustomerSaved = () => {
    fetchCustomers(); // Refresh the customer list
  };

  // Convert CustomerItem to CustomerProfile format for dialog
  const convertToCustomerProfile = (customer: CustomerItem): CustomerProfile => ({
    id: customer.id,
    first_name: customer.first_name || undefined,
    last_name: customer.last_name || undefined,
    email: customer.email,
    role: customer.role as 'customer' | 'vip' | 'premium' | undefined,
    avatar_url: customer.avatar_url || undefined,
    last_login: customer.last_login || undefined,
    phone_number: customer.phone_number || undefined,
  });

  // Get unique roles for filter
  const roleOptions = Array.from(new Set(customers.map(u => u.role).filter(Boolean)));

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
    const matchesSearch = 
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || customer.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sort customers by name/email
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.email;
    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.email;
    return nameA.localeCompare(nameB);
  });

  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      {/* Header */}
      <ResponsiveContainer padding="medium">
        <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
          Customers
        </Typography>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startDecorator={<SearchIcon />}
            sx={{ flex: 1 }}
          />
          <Select
            placeholder="Type"
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
          onClick={handleAddCustomer}
          sx={{ width: '100%', mb: 2 }}
        >
          Add Customer
        </Button>
      </ResponsiveContainer>

      {/* Loading and Error States */}
      {loading && <LinearProgress />}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="danger">Error: {error}</Typography>
        </Box>
      )}

      {/* Customer List */}
      <Box>
        {sortedCustomers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="neutral">
              No customers found
            </Typography>
          </Box>
        ) : (
          sortedCustomers.map((customer) => (
            <Box 
              key={customer.id} 
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
                  src={customer.avatar_url || undefined}
                  color={getAvatarColor(customer.first_name, customer.last_name, customer.email)}
                  sx={{ flexShrink: 0 }}
                >
                  {!customer.avatar_url && getInitials(customer.first_name, customer.last_name, customer.email)}
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
                      {`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer'}
                    </Typography>
                    
                    {/* Role Chip */}
                    {customer.role && (
                      <Chip 
                        size="sm"
                        color={getRoleColor(customer.role)}
                        variant="soft"
                        sx={{ fontWeight: 'bold', minWidth: 'fit-content', textTransform: 'capitalize' }}
                      >
                        {customer.role}
                      </Chip>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmailIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                    <Typography level="body-xs" color="neutral">
                      {customer.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                    {customer.phone_number && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                        <Typography level="body-xs" color="neutral">
                          {customer.phone_number}
                        </Typography>
                      </Box>
                    )}
                    {customer.last_login && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LoginIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                        <Typography level="body-xs" color="neutral">
                          {new Date(customer.last_login).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {customer.created_at && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                      <Typography level="body-xs" color="neutral">
                        Joined {new Date(customer.created_at).toLocaleDateString()}
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
        Customers
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search customers..."
          sx={{ flex: 1 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          startDecorator={<SearchIcon />}
        />
        <Select
          placeholder="Filter type"
          value={roleFilter}
          onChange={(_, value) => setRoleFilter(value ?? 'all')}
          sx={{ minWidth: 160 }}
        >
          <Option value="all">All Types</Option>
          {roleOptions.map(role => (
            <Option key={role} value={role}>{role}</Option>
          ))}
        </Select>
        <Button
          onClick={handleAddCustomer}
          variant="solid"
          startDecorator={<AddIcon />}
        >
          Add Customer
        </Button>
      </Box>

      <Card sx={{ overflow: 'visible' }}>
        {loading && <LinearProgress />}
        {error && <Typography color="danger">Error: {error}</Typography>}
        
        <Table aria-label="Customers" sx={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={headerStyles}>Name</th>
              <th style={headerStyles}>Email</th>
              <th style={headerStyles}>Type</th>
              <th style={headerStyles}>Joined</th>
              <th style={headerStyles}>Last Login</th>
              <th style={headerStyles}>Phone</th>
              <th style={{ width: 120, ...headerStyles }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCustomers.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>
                  No customers found.
                </td>
              </tr>
            )}
            {sortedCustomers.map((customer) => (
              <tr key={customer.id} style={{ cursor: 'pointer', height: 48 }}>
                <td style={typographyStyles}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      size="sm"
                      src={customer.avatar_url || undefined}
                      color={getAvatarColor(customer.first_name, customer.last_name, customer.email)}
                    >
                      {!customer.avatar_url && getInitials(customer.first_name, customer.last_name, customer.email)}
                    </Avatar>
                    <Typography level="body-sm" fontWeight="md">
                      {`${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed Customer'}
                    </Typography>
                  </Box>
                </td>
                <td style={typographyStyles}>{customer.email}</td>
                <td style={typographyStyles}>
                  {customer.role ? (
                    <Chip
                      size="sm"
                      color={getRoleColor(customer.role)}
                      variant="soft"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {customer.role}
                    </Chip>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={typographyStyles}>
                  {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : '-'}
                </td>
                <td style={typographyStyles}>
                  {customer.last_login ? new Date(customer.last_login).toLocaleDateString() : '-'}
                </td>
                <td style={typographyStyles}>{customer.phone_number || '-'}</td>
                <td>
                  <RowMenu 
                    onEdit={() => handleEditCustomer(customer)} 
                    onView={() => handleViewCustomer(customer)} 
                  />
                </td>
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
      
      {/* Customer Dialog */}
      <DialogCustomer
        open={createOpen}
        onClose={handleDialogClose}
        customer={selectedCustomer ? convertToCustomerProfile(selectedCustomer) : undefined}
        mode={dialogMode}
        onSaved={handleCustomerSaved}
      />
    </PageLayout>
  );
};

export default PageCustomers;
