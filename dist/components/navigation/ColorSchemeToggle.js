var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useColorScheme } from '@mui/joy/styles';
import IconButton from '@mui/joy/IconButton';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeIcon from '@mui/icons-material/LightMode';
export default function ColorSchemeToggle(props) {
    const { onClick, sx } = props, other = __rest(props, ["onClick", "sx"]);
    const { mode, setMode } = useColorScheme();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return (_jsx(IconButton, Object.assign({ size: "sm", variant: "outlined", color: "neutral" }, other, { sx: sx, disabled: true })));
    }
    return (_jsxs(IconButton, Object.assign({ "data-screenshot": "toggle-mode", size: "sm", variant: "outlined", color: "neutral" }, other, { onClick: (event) => {
            if (mode === 'light') {
                setMode('dark');
            }
            else {
                setMode('light');
            }
            onClick === null || onClick === void 0 ? void 0 : onClick(event);
        }, sx: [
            mode === 'dark'
                ? { '& > *:first-of-type': { display: 'none' } }
                : { '& > *:first-of-type': { display: 'initial' } },
            mode === 'light'
                ? { '& > *:last-of-type': { display: 'none' } }
                : { '& > *:last-of-type': { display: 'initial' } },
            ...(Array.isArray(sx) ? sx : [sx]),
        ], children: [_jsx(DarkModeRoundedIcon, {}), _jsx(LightModeIcon, {})] })));
}
