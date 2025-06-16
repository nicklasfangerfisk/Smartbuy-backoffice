import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Card from '@mui/joy/Card';
import Table from '@mui/joy/Table';
import LinearProgress from '@mui/joy/LinearProgress';
import Typography from '@mui/joy/Typography';

export default function UsersTable() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !authUser) {
        setError('Could not get current user');
        setLoading(false);
        return;
      }
      const { data: userRow, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();
      if (userError || !userRow) {
        setError('Could not get user role');
        setLoading(false);
        return;
      }
      const role = userRow.role;
      let usersData: any[] = [];
      let usersError = null;
      if (role === 'employee') {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: true });
        usersData = data || [];
        usersError = error;
      } else {
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

  return (
    <div style={{ padding: 32 }}>
      <Typography level="h2" sx={{ mb: 2 }}>Users</Typography>
      <Card>
        {loading && <LinearProgress />}
        {error && <Typography color="danger">Error: {error}</Typography>}
        <Table aria-label="Users" sx={{ minWidth: 700 }}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created On</th>
              <th>Last Login</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id || '-'}</td>
                <td>{user.name || '-'}</td>
                <td>{user.email || '-'}</td>
                <td>{user.role || '-'}</td>
                <td>{user.created_at ? new Date(user.created_at).toLocaleString() : '-'}</td>
                <td>{user.last_login ? new Date(user.last_login).toLocaleString() : '-'}</td>
                <td>{user.phone || '-'}</td>
              </tr>
            ))}
            {users.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#888' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
