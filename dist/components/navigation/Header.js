import { jsx as _jsx } from "react/jsx-runtime";
import GlobalStyles from '@mui/joy/GlobalStyles';
import Sheet from '@mui/joy/Sheet';
export default function Header() {
    return (_jsx(Sheet, { sx: {
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'fixed',
            top: 0,
            width: '100vw',
            height: 'var(--Header-height)',
            zIndex: 9995,
            p: 2,
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'background.level1',
            boxShadow: 'sm',
        }, children: _jsx(GlobalStyles, { styles: (theme) => ({
                ':root': {
                    '--Header-height': '52px',
                    [theme.breakpoints.up('md')]: {
                        '--Header-height': '0px',
                    },
                },
            }) }) }));
}
