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

const PageUsersDesktop: React.FC<{ users: User[] }> = ({ users }) => {
  return (
    <UserTable
      rows={users}
      onRowClick={(userId) => console.log(`User clicked: ${userId}`)}
    />
  );
};

export default PageUsersDesktop;
