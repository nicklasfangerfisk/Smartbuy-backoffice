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
        pl: '16px',
        pr: '6px',
        pt: '6px',
        width: '100%',
        minHeight: '100dvh',
        bgcolor: 'background.body',
      }}
    >
      {children}
    </Box>
  );
};

export default PageLayout;
