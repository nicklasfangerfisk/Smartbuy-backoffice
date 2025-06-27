import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Sheet from '@mui/joy/Sheet';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/joy/styles';
import { styled } from '@mui/joy/styles';
import { marked } from 'marked';

// Helper to fetch and render the release log markdown
function ReleaseLog() {
  const [log, setLog] = React.useState('');
  React.useEffect(() => {
    fetch('/RELEASE_LOG.md')
      .then((res) => res.text())
      .then(setLog);
  }, []);
  return (
    <Sheet variant="outlined" sx={{ p: 2, minHeight: 300, overflow: 'auto', bgcolor: 'background.level1', borderRadius: 'var(--joy-radius-lg)' }}>
      <Typography level="h4" sx={{ mb: 1 }}>Release Log</Typography>
      <Box sx={{ fontSize: 14 }}>
        <div dangerouslySetInnerHTML={{ __html: marked(log) }} />
      </Box>
    </Sheet>
  );
}

function AppInfo() {
  // You can expand this with more dynamic info if needed
  return (
    <Sheet variant="outlined" sx={{ p: 2, minHeight: 300, bgcolor: 'background.level1', borderRadius: 'var(--joy-radius-lg)' }}>
      <Typography level="h4" sx={{ mb: 1 }}>Application Info</Typography>
      <Typography level="body-md">Smartback Inventory System</Typography>
      <Typography level="body-sm" sx={{ mt: 1 }}>Environment: {import.meta.env.MODE}</Typography>
      <Typography level="body-sm">Version: {import.meta.env.VITE_APP_VERSION || 'N/A'}</Typography>
      <Typography level="body-sm">Build: {import.meta.env.VITE_GIT_COMMIT || 'N/A'}</Typography>
      <Typography level="body-sm">Date: {new Date().toLocaleDateString()}</Typography>
    </Sheet>
  );
}

const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: '1fr 1fr',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

export default function PageSettingsDesktop() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  return (
    <Box sx={{ p: { xs: 1, md: 3 }, width: '100%', maxWidth: 1200, mx: 'auto' }}>
      <Typography level="h2" sx={{ mb: 2 }}>Settings</Typography>
      <ResponsiveGrid>
        <Box>{/* Left: App Info (on mobile, on top) */}
          <AppInfo />
        </Box>
        <Box>{/* Right: Release Log (on mobile, below) */}
          <ReleaseLog />
        </Box>
      </ResponsiveGrid>
    </Box>
  );
}
