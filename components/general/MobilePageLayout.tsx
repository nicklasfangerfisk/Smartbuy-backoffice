import React from 'react';
import Box from '@mui/joy/Box';
import { useTheme } from '@mui/joy/styles';

/**
 * MobilePageLayout
 *
 * Provides a fixed content area for mobile pages, starting below the header and ending above the mobile menu.
 * Ensures consistent spacing, scrolling, and safe area handling across all mobile pages.
 *
 * Usage:
 *   <MobilePageLayout>
 *     ...page content...
 *   </MobilePageLayout>
 */
const HEADER_HEIGHT = 0; // px, header is not included in this layout
const MENU_HEIGHT = 64;   // px, adjust if your mobile menu is a different height

const MobilePageLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        pt: 0, // No header offset
        pb: 0, // Remove menu padding
        height: '100vh', // Ensure full viewport height
        width: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        background: theme.vars.palette.background.body,
        padding: 0, // Remove all padding
        margin: 0, // Remove any margin
      }}
    >
      {children}
    </Box>
  );
};

export default MobilePageLayout;
