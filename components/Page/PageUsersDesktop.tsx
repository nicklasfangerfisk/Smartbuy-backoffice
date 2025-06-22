import * as React from 'react';
import GeneralTable from '../general/GeneralTable';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  created_at: string | null;
  last_login: string | null;
  phone: string | null;
}

const PageUsersDesktop: React.FC<{ users: User[] }> = ({ users }) => (
  <GeneralTable
    rows={users}
    columns={[
      { id: 'id', label: 'ID' },
      { id: 'name', label: 'Name' },
      { id: 'email', label: 'Email' },
      { id: 'role', label: 'Role' },
      { id: 'created_at', label: 'Created On', format: (value) => (value ? new Date(value).toLocaleString() : '-') },
      { id: 'last_login', label: 'Last Login', format: (value) => (value ? new Date(value).toLocaleString() : '-') },
      { id: 'phone', label: 'Phone' },
    ]}
    ariaLabel="Users Table"
  />
);

export default PageUsersDesktop;
