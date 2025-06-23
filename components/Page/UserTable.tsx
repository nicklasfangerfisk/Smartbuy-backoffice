import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, Box, IconButton, Menu, MenuItem, Divider, ThemeProvider, createTheme } from '@mui/material';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  created_at: string | null;
  last_login: string | null;
  phone: string | null;
}

interface UserTableProps {
  rows: User[];
  onRowClick?: (userId: string) => void;
}

function RowMenu() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <MoreHorizRoundedIcon />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleClose}>Edit</MenuItem>
        <MenuItem onClick={handleClose}>Delete</MenuItem>
      </Menu>
    </>
  );
}

const muiTheme = createTheme({
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
  },
});

const UserTable: React.FC<UserTableProps> = ({ rows, onRowClick }) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table aria-label="Users Table" sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created On</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: User) => (
              <TableRow key={row.id} onClick={() => onRowClick?.(row.id)}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name || '-'}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.role || '-'}</TableCell>
                <TableCell>{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</TableCell>
                <TableCell>{row.last_login ? new Date(row.last_login).toLocaleString() : '-'}</TableCell>
                <TableCell>{row.phone || '-'}</TableCell>
                <TableCell><RowMenu /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </ThemeProvider>
  );
};

export default UserTable;
