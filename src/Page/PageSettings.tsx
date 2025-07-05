import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Stack from '@mui/joy/Stack';

// Icons
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import UpdateIcon from '@mui/icons-material/Update';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PageLayout from '../layouts/PageLayout';
import fonts from '../theme/fonts';
import { marked } from 'marked';

// Helper component to fetch and render the release log markdown
function ReleaseLog() {
  const [log, setLog] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    fetch('/RELEASE_LOG.md')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch release log');
        return res.text();
      })
      .then((text) => {
        setLog(text);
        setError(false);
      })
      .catch((err) => {
        console.error('Error fetching release log:', err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card sx={{ height: '100%', minHeight: { xs: 200, md: 300 } }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <UpdateIcon color="primary" />
          <Typography level="h4">Release Log</Typography>
        </Box>
        
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            bgcolor: 'background.level1',
            borderRadius: 'var(--joy-radius-md)',
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
          }}
        >
          {loading && (
            <Typography level="body-sm" color="neutral">
              Loading release log...
            </Typography>
          )}
          {error && (
            <Typography level="body-sm" color="danger">
              Failed to load release log
            </Typography>
          )}
          {!loading && !error && (
            <Box sx={{ typography: 'body-sm' }}>
              <div dangerouslySetInnerHTML={{ __html: marked(log) }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// Helper component for application information
function AppInfo() {
  const { isMobile } = useResponsive();
  
  return (
    <Card sx={{ height: '100%', minHeight: { xs: 120, md: 300 } }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <InfoIcon color="primary" />
          <Typography level="h4">Application Info</Typography>
        </Box>
        
        <Stack spacing={1.5} sx={{ flex: 1 }}>
          <Typography level="title-md" sx={{ fontWeight: 'bold' }}>
            Smartback Inventory System
          </Typography>
          
          <Stack spacing={0.5}>
            <Typography level="body-sm" color="neutral">
              <strong>Environment:</strong> {import.meta.env.MODE}
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Version:</strong> {import.meta.env.VITE_APP_VERSION || 'N/A'}
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Build:</strong> {import.meta.env.VITE_GIT_COMMIT || 'N/A'}
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </Typography>
          </Stack>
        </Stack>
        
        <Button
          component="a"
          href="https://nicklasfangerfisk.github.io/Testflow/"
          target="_blank"
          rel="noopener noreferrer"
          startDecorator={<OpenInNewIcon />}
          variant="outlined"
          color="primary"
          sx={{ mt: 2, alignSelf: 'flex-start' }}
        >
          System Test
        </Button>
      </CardContent>
    </Card>
  );
}

// Main Settings component
const PageSettings = () => {
  const { isMobile } = useResponsive();

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <ResponsiveContainer padding="medium">
        <Typography level="h2" sx={{ mb: 3, fontSize: fonts.sizes.xlarge }}>
          Settings
        </Typography>
        
        <Stack spacing={3}>
          <AppInfo />
          <ReleaseLog />
        </Stack>
      </ResponsiveContainer>
    </Box>
  );

  // Desktop View Component
  const DesktopView = () => (
    <ResponsiveContainer>
      <Typography level="h2" sx={{ mb: 3, fontSize: fonts.sizes.xlarge }}>
        Settings
      </Typography>
      
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          alignItems: 'start',
        }}
      >
        <AppInfo />
        <ReleaseLog />
      </Box>
    </ResponsiveContainer>
  );

  return (
    <PageLayout>
      {isMobile ? <MobileView /> : <DesktopView />}
    </PageLayout>
  );
};

export default PageSettings;
