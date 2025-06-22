import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import { closeSidebar } from '../../utils';
export default function MobileMenu({ items, value, onChange }) {
    const muiTheme = React.useMemo(() => createTheme(), []);
    return (_jsx(ThemeProvider, { theme: muiTheme, children: _jsx(Paper, { sx: { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1200 }, children: _jsxs(BottomNavigation, { showLabels: true, value: value, onChange: (_e, newValue) => onChange(newValue), children: [_jsx(BottomNavigationAction, { label: '', icon: _jsx(MenuIcon, {}), onClick: (e) => {
                            e.preventDefault();
                            closeSidebar();
                        } }), items.map((item) => (_jsx(BottomNavigationAction, { label: item.label, icon: item.icon, value: item.value }, item.value)))] }) }) }));
}
