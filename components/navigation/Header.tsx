import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

export default function Header() {
  return (
    <Box sx={{ height: 64, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', px: 2 }}>
      <Typography>Header</Typography>
    </Box>
  );
}