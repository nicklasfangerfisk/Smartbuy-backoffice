import React from 'react';
import Box from '@mui/joy/Box';

/**
 * PageLayout component provides consistent outer padding for pages.
 *
 * @param {React.PropsWithChildren} props - Props containing children elements.
 * @returns {JSX.Element} The rendered PageLayout component.
 */
const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',         // enable flex layout for content
        flexDirection: 'column',
        pl: '16px',
        pr: '6px',
        pt: '6px',
        width: '100%',
        flex: 1,
        minHeight: 0,
        height: '100%',          // ensure full height
        overflow: 'hidden',      // hide overflow from pages
        bgcolor: 'background.body',
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout;
