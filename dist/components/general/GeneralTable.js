import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
const GeneralTable = ({ columns, rows, ariaLabel, minWidth = 600 }) => {
    return (_jsxs(Table, { "aria-label": ariaLabel, sx: { minWidth }, children: [_jsx(TableHead, { children: _jsx(TableRow, { children: columns.map((column) => (_jsx(TableCell, { align: column.align || 'left', sx: { minWidth: column.minWidth }, children: _jsx(Typography, { fontWeight: "bold", children: column.label }) }, column.id))) }) }), _jsx(TableBody, { children: rows.map((row, rowIndex) => (_jsx(TableRow, { children: columns.map((column) => (_jsx(TableCell, { align: column.align || 'left', children: column.format ? column.format(row[column.id]) : row[column.id] }, column.id))) }, rowIndex))) })] }));
};
export default GeneralTable;
