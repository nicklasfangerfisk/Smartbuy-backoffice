import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/joy/Box';

export default function UsersTable() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      // Get current user from Supabase Auth
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !authUser) {
        setError('Could not get current user');
        setLoading(false);
        return;
      }
      // Fetch current user's role from users table
      console.log('UsersTable: authUser.id', authUser.id);
      const { data: userRow, error: userError, status, statusText } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();
      if (userError || !userRow) {
        // Log error for debugging
        console.error('UsersTable: Could not get user role', { userError, userRow, authUserId: authUser.id, status, statusText });
        setError('Could not get user role');
        setLoading(false);
        return;
      }
      const role = userRow.role;
      let usersData: any[] = [];
      let usersError = null;
      if (role === 'employee') {
        // Employees see all users
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
        usersData = data || [];
        usersError = error;
      } else {
        // Customers see only themselves
        const { data, error } = await supabase.from('users').select('*').eq('id', authUser.id);
        usersData = data || [];
        usersError = error;
      }
      if (!usersError && usersData) {
        setUsers(usersData);
      } else if (usersError) {
        setError(typeof usersError === 'string' ? usersError : (usersError.message || 'Failed to fetch users'));
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  function copyToClipboard(value: string) {
    navigator.clipboard.writeText(value);
  }

  return (
    <Sheet sx={{
      width: '100%',
      borderRadius: 'sm',
      overflow: 'auto',
      mt: { xs: 1, sm: 2 },
      p: { xs: 1, sm: 2 },
      minHeight: { xs: '60dvh', sm: 'auto' },
      boxShadow: { xs: 'sm', sm: 'md' },
      maxWidth: { xs: '100vw', sm: '100%' },
    }}>
      <Typography level="h3" sx={{ mb: { xs: 1, sm: 2 }, fontSize: { xs: 20, sm: 28 } }}>
        Users
      </Typography>
      <Table
        stickyHeader
        hoverRow
        borderAxis="both"
        size="sm"
        sx={{
          '--TableCell-height': { xs: '40px', sm: '56px' },
          '& td, & th': { verticalAlign: 'middle', p: { xs: 0.5, sm: 1.5 }, fontSize: { xs: 12, sm: 16 } },
          minWidth: { xs: 360, sm: 800 },
          width: '100%',
          tableLayout: 'fixed',
          wordBreak: 'break-word',
        }}
      >
        <thead>
          <tr>
            <th style={{ minWidth: 80 }}>ID</th>
            <th style={{ minWidth: 80 }}>Name</th>
            <th style={{ minWidth: 120 }}>Email</th>
            <th style={{ minWidth: 60 }}>Role</th>
            <th style={{ minWidth: 100 }}>Created On</th>
            <th style={{ minWidth: 100 }}>Last Login</th>
            <th style={{ minWidth: 80 }}>Phone</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography level="body-xs" sx={{ wordBreak: 'break-all' }}>{user.id || '-'}</Typography>
                  {user.id && (
                    <IconButton size="sm" sx={{ '--IconButton-size': '22px', minWidth: 22, minHeight: 22, p: 0.25 }} onClick={() => copyToClipboard(user.id)} title="Copy ID">
                      <ContentCopyIcon fontSize="inherit" sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              </td>
              <td><Typography level="body-xs">{user.name || '-'}</Typography></td>
              <td>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography level="body-xs" sx={{ wordBreak: 'break-all' }}>{user.email || '-'}</Typography>
                  {user.email && (
                    <IconButton size="sm" sx={{ '--IconButton-size': '22px', minWidth: 22, minHeight: 22, p: 0.25 }} onClick={() => copyToClipboard(user.email)} title="Copy Email">
                      <ContentCopyIcon fontSize="inherit" sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              </td>
              <td><Typography level="body-xs">{user.role || '-'}</Typography></td>
              <td><Typography level="body-xs">{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</Typography></td>
              <td><Typography level="body-xs">{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</Typography></td>
              <td>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography level="body-xs">{user.phone || '-'}</Typography>
                  {user.phone && (
                    <IconButton size="sm" sx={{ '--IconButton-size': '22px', minWidth: 22, minHeight: 22, p: 0.25 }} onClick={() => copyToClipboard(user.phone)} title="Copy Phone">
                      <ContentCopyIcon fontSize="inherit" sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {loading && <Typography level="body-xs">Loading...</Typography>}
      {error && <Typography color="danger" level="body-xs">Error: {error}</Typography>}
    </Sheet>
  );
}
