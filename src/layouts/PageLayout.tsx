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
        width: '100%',
        flex: 1,
        bgcolor: 'background.body',
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout;
