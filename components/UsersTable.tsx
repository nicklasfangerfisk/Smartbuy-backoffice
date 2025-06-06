import * as React from 'react';
import { supabase } from '../utils/supabaseClient';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';

export default function UsersTable() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('users').select('*');
      console.log('Supabase users fetch:', { data, error }); // Debug log
      if (!error && data) {
        setUsers(data);
      } else if (error) {
        setError(error.message || 'Failed to fetch users');
      }
      setLoading(false);
    }
    fetchUsers();
  }, []);

  return (
    <Sheet sx={{ width: '100%', borderRadius: 'sm', overflow: 'auto', mt: 2 }}>
      <Typography level="h3" sx={{ mb: 2 }}>
        Users
      </Typography>
      <Table stickyHeader hoverRow>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name || '-'}</td>
              <td>{user.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {loading && <Typography>Loading...</Typography>}
      {error && <Typography color="danger">Error: {error}</Typography>}
    </Sheet>
  );
}
