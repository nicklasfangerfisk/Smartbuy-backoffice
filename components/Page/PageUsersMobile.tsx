import * as React from 'react';
import GeneralTableMobile from '../general/GeneralTableMobile';

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

/**
 * Props for the PageUsersMobile component.
 * @property {User[]} users - The list of users to display.
 */
interface PageUsersMobileProps {
  users: User[];
}

/**
 * PageUsersMobile component displays a list of users in a mobile-friendly layout.
 * It uses GeneralTableMobile for rendering the user data.
 *
 * @param {PageUsersMobileProps} props - Props for the component.
 * @returns {JSX.Element} The rendered PageUsersMobile component.
 */
const PageUsersMobile: React.FC<PageUsersMobileProps> = ({ users }) => {
  /**
   * Renders a single user item.
   *
   * @param {User} user - The user to render.
   * @returns {JSX.Element} The rendered user item.
   */
  const renderUserItem = (user: User) => (
    <div>
      <strong>Name:</strong> {user.name || '-'}<br />
      <strong>Email:</strong> {user.email || '-'}<br />
      <strong>Role:</strong> {user.role || '-'}<br />
      <strong>ID:</strong> {user.id || '-'}<br />
      <strong>Created:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}<br />
      <strong>Last Login:</strong> {user.last_login ? new Date(user.last_login).toLocaleString() : '-'}<br />
      <strong>Phone:</strong> {user.phone || '-'}
    </div>
  );

  return (
    <GeneralTableMobile
      items={users}
      renderItem={renderUserItem}
      ariaLabel="Users Mobile View"
    />
  );
};

export default PageUsersMobile;
