/**
 * Desktop view for displaying a table of users.
 * Uses the GeneralTable component to render user data in a tabular format.
 *
 * @param {Object} props - The props for the component.
 * @param {User[]} props.users - The list of users to display.
 * @returns {JSX.Element} The rendered component.
 */

/**
 * Represents a single user in the system.
 * @property {string} id - The unique identifier for the user.
 * @property {string | null} name - The name of the user.
 * @property {string} email - The email address of the user.
 * @property {string | null} role - The role of the user.
 * @property {string | null} created_at - The timestamp when the user was created.
 * @property {string | null} last_login - The timestamp of the user's last login.
 * @property {string | null} phone - The phone number of the user.
 */
interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  created_at: string | null;
  last_login: string | null;
  phone: string | null;
}

// Fix React import issue
import React from 'react';

// Fix GeneralTable import issue
import UserTable from './UserTable';
import Card from '@mui/joy/Card';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Button from '@mui/joy/Button';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import { CssVarsProvider } from '@mui/joy/styles';
import SearchIcon from '@mui/icons-material/Search';

const PageUsersDesktop: React.FC<{ users: User[] }> = ({ users }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterRole, setFilterRole] = React.useState('All Roles');

  const filteredUsers = users.filter((user) =>
    (filterRole === 'All Roles' || user.role === filterRole) &&
    (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <CssVarsProvider>
      <Box sx={{ p: 3, backgroundColor: 'background.level1', borderRadius: 'md' }}>
        <Card variant="outlined" sx={{ p: 3, borderRadius: 'lg' }}>
          <Typography level="h4" sx={{ mb: 2 }}>
            Users
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Input
              placeholder="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startDecorator={<SearchIcon />}
              sx={{ flex: 1 }}
            />
            <Select
              value={filterRole}
              onChange={(e, newValue) => setFilterRole(newValue || 'All Roles')}
              sx={{ minWidth: 150 }}
            >
              <Option value="All Roles">All Roles</Option>
              <Option value="Admin">Admin</Option>
              <Option value="Employee">Employee</Option>
            </Select>
            <Button variant="solid" color="primary">
              Create User
            </Button>
          </Box>
          <UserTable
            rows={filteredUsers}
            onRowClick={(userId) => console.log(`User clicked: ${userId}`)}
          />
        </Card>
      </Box>
    </CssVarsProvider>
  );
};

export default PageUsersDesktop;
