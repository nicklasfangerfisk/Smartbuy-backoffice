import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import Box from '@mui/joy/Box';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListDivider from '@mui/joy/ListDivider';
const GeneralTableMobile = ({ items, renderItem, ariaLabel }) => {
    return (_jsx(Box, { children: _jsx(List, { "aria-label": ariaLabel, children: items.map((item, index) => (_jsxs(React.Fragment, { children: [_jsx(ListItem, { children: renderItem(item) }), index < items.length - 1 && _jsx(ListDivider, {})] }, index))) }) }));
};
export default GeneralTableMobile;
