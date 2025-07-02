import React from 'react';
import Box from '@mui/joy/Box';

interface PageContentProps {
  children: React.ReactNode;
  fullWidth?: boolean; // For tables that need edge-to-edge
}

/**
 * Content area wrapper for page content.
 * Provides flex-grow behavior and handles overflow.
 */
const PageContent: React.FC<PageContentProps> = ({ children, fullWidth = false }) => {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0, // Allow shrinking
        ...(fullWidth && {
          mx: -2, // Negative margin to counteract container padding for edge-to-edge content
        })
      }}
    >
      {children}
    </Box>
  );
};

export default PageContent;
