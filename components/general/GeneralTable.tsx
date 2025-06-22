import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Typography, ThemeProvider, createTheme } from '@mui/material';

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

const GeneralTable: React.FC<GeneralTableProps> = ({ columns, rows, ariaLabel, minWidth = 600 }) => {
  return (
    <ThemeProvider theme={muiTheme}>
      <Table aria-label={ariaLabel} sx={{ minWidth }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || 'left'}
                sx={{ minWidth: column.minWidth }}
              >
                <Typography fontWeight="bold">{column.label}</Typography>
              </TableCell>
            ))}
          </TableRow>
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
    </ThemeProvider>
  );
};

export default GeneralTable;
