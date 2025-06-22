import * as React from 'react';
import GeneralTableMobile from '../general/GeneralTableMobile';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  created_at: string | null;
  last_login: string | null;
  phone: string | null;
}

const PageUsersMobile: React.FC<{ users: User[] }> = ({ users }) => (
  <GeneralTableMobile
    items={users}
    renderItem={(user) => (
      <div>
        <strong>Name:</strong> {user.name || '-'}<br />
        <strong>Email:</strong> {user.email || '-'}<br />
        <strong>Role:</strong> {user.role || '-'}<br />
        <strong>ID:</strong> {user.id || '-'}<br />
        <strong>Created:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}<br />
        <strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}<br />
        <strong>Phone:</strong> {user.phone || '-'}
      </div>
    )}
    ariaLabel="Users Mobile View"
  />
);

export default PageUsersMobile;
