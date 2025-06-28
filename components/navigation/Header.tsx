import * as React from 'react';
import GlobalStyles from '@mui/joy/GlobalStyles';
import Box from '@mui/joy/Box';

/**
 * A responsive header component for smaller screens.
 *
 * This component is visible only on screens with `xs` to `md` breakpoints.
 * It is hidden on larger screens (`md` and above).
 *
 * Note: The hamburger menu has been removed and is now part of the `MobileMenu` component.
 *
 * @returns {JSX.Element} The rendered header component.
 */
export default function Header() {
  return (
    <Box
      sx={{
        // Display the header only on larger screens.
        display: { xs: 'none', md: 'flex' },
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', // changed from 'fixed' to 'sticky'
        top: 0,
        width: '100vw',
        height: 'var(--Header-height)',
        zIndex: 9995,
        p: 2,
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'background.level1',
        boxShadow: 'sm',
        background: 'var(--joy-palette-background-surface, #fff)', // ensure background
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            // Define a CSS variable for the header height.
            '--Header-height': '52px',
            [theme.breakpoints.up('md')]: {
              '--Header-height': '64px',
            },
          },
        })}
      />
    </Box>
  );
}
