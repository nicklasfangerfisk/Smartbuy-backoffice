import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, ThemeProvider, createTheme, Box } from '@mui/material';
import withAuth from '../auth/withAuth';

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any) => string;
}

interface GeneralTableProps {
  columns: Column[];
  rows: any[];
  ariaLabel: string;
  minWidth?: number;
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

/**
 * GeneralTable is a reusable table component built with Material-UI.
 * It supports dynamic columns, custom formatting, and hover effects.
 * 
 * Props:
 * - columns: Array of column definitions, each with an id, label, and optional properties like minWidth, align, and format.
 * - rows: Array of data objects to populate the table.
 * - ariaLabel: Accessibility label for the table.
 * - minWidth: Minimum width of the table (default: 600).
 */

const GeneralTable: React.FC<GeneralTableProps> = ({ columns, rows, ariaLabel, minWidth = 600 }) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <Box sx={{ overflowX: 'auto', pl: '24px', pr: '24px', pt: 0 }}> {/* Updated top padding of the table box to 0 */}
        <Table aria-label={ariaLabel} sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  sx={{ minWidth: column.minWidth, pb: 0 }} // Updated padding between column header and underline to 0
                >
                  <Typography fontWeight="bold">{column.label}</Typography>
                </TableCell>
              ))}
            </TableRow> {/* Fixed closing tag */}
          </TableHead>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    {column.format ? column.format(row[column.id]) : row[column.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </ThemeProvider>
  );
};

export default withAuth(GeneralTable);
