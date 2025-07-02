import React from 'react';
import Box from '@mui/joy/Box';
import useMediaQuery from '@mui/material/useMediaQuery';

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * Master page container that handles ALL layout concerns.
 * This is the ONLY component that should handle:
 * - Padding and margins
 * - Width and height constraints  
 * - Scroll behavior
 * - Responsive behavior
 * 
 * Pages should NEVER add their own layout styling.
 */
const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Box
      sx={{
        // Master container - fills available space
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        
        // Consistent padding for all pages
        px: isMobile ? 2 : 3,
        py: 3,
        
        // Single scroll container - no nested scrolling
        overflow: 'auto',
        
        // Ensure proper background
        bgcolor: 'background.body',
        
        // Mobile bottom padding for navigation
        pb: isMobile ? '80px' : 3,
      }}
    >
      {children}
    </Box>
  );
};

export default PageContainer;
