/**
 * PageEmployees - Employee management and administration
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout + ResponsiveContainer(table-page) - 16px padding
 * Responsive: Mobile/Desktop views, useResponsive() hook
 * Data: Supabase Users table filtered for employee roles
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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import BadgeIcon from '@mui/icons-material/Badge';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LoginIcon from '@mui/icons-material/Login';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PageLayout from '../layouts/PageLayout';
import DialogEmployee, { EmployeeProfile } from '../Dialog/DialogEmployee';
import fonts from '../theme/fonts';

// Types
export interface EmployeeItem {
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
    case 'admin': return 'danger';
    case 'manager': return 'warning';
    case 'staff': return 'success';
    case 'employee': return 'primary';
    case 'user': return 'neutral';
    default: return 'neutral';
  }
};

const getRoleIcon = (role: string | null) => {
  switch (role?.toLowerCase()) {
    case 'admin': return <AdminPanelSettingsIcon />;
    case 'manager': return <SupervisorAccountIcon />;
    case 'staff': return <AccountCircleIcon />;
    case 'employee': return <PersonIcon />;
    case 'user': return <PersonIcon />;
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
function RowMenu({ employee, onEdit, onView }: { employee: EmployeeItem, onEdit: (employee: EmployeeItem) => void, onView: (employee: EmployeeItem) => void }) {
  return (
    <Dropdown>
      <MenuButton slots={{ root: IconButton }} slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}>
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem onClick={() => onEdit(employee)}>Edit Employee</MenuItem>
        <MenuItem onClick={() => onView(employee)}>View Details</MenuItem>
        <MenuItem>Change Role</MenuItem>
        <MenuItem>Reset Password</MenuItem>
        <MenuItem>Deactivate</MenuItem>
        <MenuItem color="danger">Remove</MenuItem>
      </Menu>
    </Dropdown>
  );
}

const PageEmployees = () => {
  const { isMobile } = useResponsive();
  
  // Data states
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | undefined>();
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');

  // Fetch employees (filter for employee-type roles)
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Filter for employee-related roles
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('role', ['admin', 'manager', 'staff', 'employee', 'user']); // Include all employee-type roles
      
      if (error) throw error;

      if (data) {
        const mappedEmployees = data.map((user) => ({
          id: user.id,
          first_name: user.first_name || null,
          last_name: user.last_name || null,
          email: user.email,
          role: user.role || 'employee', // Default to employee if no role
          created_at: user.created_at || null,
          last_login: user.last_login || null,
          phone_number: user.phone_number || null,
          avatar_url: user.avatar_url || null,
        }));
        
        setEmployees(mappedEmployees);
      }
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  // Dialog helper functions
  const handleAddEmployee = () => {
    setSelectedEmployee(undefined);
    setDialogMode('add');
    setCreateOpen(true);
  };

  const handleEditEmployee = (employee: EmployeeItem) => {
    setSelectedEmployee(employee);
    setDialogMode('edit');
    setCreateOpen(true);
  };

  const handleViewEmployee = (employee: EmployeeItem) => {
    setSelectedEmployee(employee);
    setDialogMode('view');
    setCreateOpen(true);
  };

  const handleDialogClose = () => {
    setCreateOpen(false);
    setSelectedEmployee(undefined);
  };

  const handleEmployeeSaved = () => {
    fetchEmployees(); // Refresh the employee list
  };

  // Convert EmployeeItem to EmployeeProfile format for dialog
  const convertToEmployeeProfile = (employee: EmployeeItem): EmployeeProfile => ({
    id: employee.id,
    first_name: employee.first_name || undefined,
    last_name: employee.last_name || undefined,
    email: employee.email,
    role: employee.role as 'admin' | 'manager' | 'staff' | 'employee' | undefined,
    avatar_url: employee.avatar_url || undefined,
    last_login: employee.last_login || undefined,
    phone_number: employee.phone_number || undefined,
  });

  // Get unique roles for filter
  const roleOptions = Array.from(new Set(employees.map(u => u.role).filter(Boolean)));

  // Filter employees
  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
    const matchesSearch = 
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sort employees by name/email
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim() || a.email;
    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim() || b.email;
    return nameA.localeCompare(nameB);
  });

  // Initial fetch
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      {/* Header */}
      <ResponsiveContainer padding="medium">
        <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
          Employees
        </Typography>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Search employees..."
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
          onClick={handleAddEmployee}
          sx={{ width: '100%', mb: 2 }}
        >
          Add Employee
        </Button>
      </ResponsiveContainer>

      {/* Loading and Error States */}
      {loading && <LinearProgress />}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="danger">Error: {error}</Typography>
        </Box>
      )}

      {/* Employee List */}
      <Box>
        {sortedEmployees.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="neutral">
              No employees found
            </Typography>
          </Box>
        ) : (
          sortedEmployees.map((employee) => (
            <Box 
              key={employee.id} 
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
                  src={employee.avatar_url || undefined}
                  color={getAvatarColor(employee.first_name, employee.last_name, employee.email)}
                  sx={{ flexShrink: 0 }}
                >
                  {!employee.avatar_url && getInitials(employee.first_name, employee.last_name, employee.email)}
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
                      {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unnamed Employee'}
                    </Typography>
                    
                    {/* Role Chip */}
                    {employee.role && (
                      <Chip 
                        size="sm"
                        color={getRoleColor(employee.role)}
                        variant="soft"
                        sx={{ fontWeight: 'bold', minWidth: 'fit-content', textTransform: 'capitalize' }}
                      >
                        {employee.role}
                      </Chip>
                    )}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <EmailIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                    <Typography level="body-xs" color="neutral">
                      {employee.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                    {employee.phone_number && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                        <Typography level="body-xs" color="neutral">
                          {employee.phone_number}
                        </Typography>
                      </Box>
                    )}
                    {employee.last_login && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LoginIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                        <Typography level="body-xs" color="neutral">
                          {new Date(employee.last_login).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {employee.created_at && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                      <Typography level="body-xs" color="neutral">
                        Hired {new Date(employee.created_at).toLocaleDateString()}
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
        Employees
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search employees..."
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
          onClick={handleAddEmployee}
          variant="solid"
          startDecorator={<AddIcon />}
        >
          Add Employee
        </Button>
      </Box>

      <Card sx={{ overflow: 'visible' }}>
        {loading && <LinearProgress />}
        {error && <Typography color="danger">Error: {error}</Typography>}
        
        <Table aria-label="Employees" sx={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={headerStyles}>Name</th>
              <th style={headerStyles}>Email</th>
              <th style={headerStyles}>Role</th>
              <th style={headerStyles}>Hired</th>
              <th style={headerStyles}>Last Login</th>
              <th style={headerStyles}>Phone</th>
              <th style={{ width: 120, ...headerStyles }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>
                  No employees found.
                </td>
              </tr>
            )}
            {sortedEmployees.map((employee) => (
              <tr key={employee.id} style={{ cursor: 'pointer', height: 48 }}>
                <td style={typographyStyles}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      size="sm"
                      src={employee.avatar_url || undefined}
                      color={getAvatarColor(employee.first_name, employee.last_name, employee.email)}
                    >
                      {!employee.avatar_url && getInitials(employee.first_name, employee.last_name, employee.email)}
                    </Avatar>
                    <Typography level="body-sm" fontWeight="md">
                      {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || 'Unnamed Employee'}
                    </Typography>
                  </Box>
                </td>
                <td style={typographyStyles}>{employee.email}</td>
                <td style={typographyStyles}>
                  {employee.role ? (
                    <Chip
                      size="sm"
                      color={getRoleColor(employee.role)}
                      variant="soft"
                      sx={{ textTransform: 'capitalize' }}
                    >
                      {employee.role}
                    </Chip>
                  ) : (
                    '-'
                  )}
                </td>
                <td style={typographyStyles}>
                  {employee.created_at ? new Date(employee.created_at).toLocaleDateString() : '-'}
                </td>
                <td style={typographyStyles}>
                  {employee.last_login ? new Date(employee.last_login).toLocaleDateString() : '-'}
                </td>
                <td style={typographyStyles}>{employee.phone_number || '-'}</td>
                <td><RowMenu employee={employee} onEdit={handleEditEmployee} onView={handleViewEmployee} /></td>
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
      
      {/* Employee Dialog */}
      <DialogEmployee
        open={createOpen}
        onClose={handleDialogClose}
        employee={selectedEmployee ? convertToEmployeeProfile(selectedEmployee) : undefined}
        mode={dialogMode}
        onSaved={handleEmployeeSaved}
      />
    </PageLayout>
  );
};

export default PageEmployees;
