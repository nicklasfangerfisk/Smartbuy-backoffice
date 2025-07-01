import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import { marked } from 'marked';
import Button from '@mui/joy/Button';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

function ReleaseLog() {
  const [log, setLog] = React.useState('');
  React.useEffect(() => {
    fetch('/RELEASE_LOG.md')
      .then((res) => res.text())
      .then(setLog);
  }, []);
  return (
    <Box
      sx={{
        p: 2,
        minHeight: 200,
        overflow: 'auto',
        bgcolor: 'background.level1',
        mt: 2,
        borderRadius: 'var(--joy-radius-lg)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography level="h4" sx={{ mb: 1 }}>
        Release Log
      </Typography>
      <Box sx={{ fontSize: 14 }}>
        <div dangerouslySetInnerHTML={{ __html: marked(log) }} />
      </Box>
    </Box>
  );
}

function AppInfo() {
  return (
    <Box
      sx={{
        p: 2,
        minHeight: 120,
        bgcolor: 'background.level1',
        borderRadius: 'var(--joy-radius-lg)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography level="h4" sx={{ mb: 1 }}>
        Application Info
      </Typography>
      <Typography level="body-md">Smartback Inventory System</Typography>
      <Typography level="body-sm" sx={{ mt: 1 }}>
        Environment: {import.meta.env.MODE}
      </Typography>
      <Typography level="body-sm">
        Version: {import.meta.env.VITE_APP_VERSION || 'N/A'}
      </Typography>
      <Typography level="body-sm">
        Build: {import.meta.env.VITE_GIT_COMMIT || 'N/A'}
      </Typography>
      <Typography level="body-sm">
        Date: {new Date().toLocaleDateString()}
      </Typography>
      <Button
        component="a"
        href="https://nicklasfangerfisk.github.io/Testflow/"
        target="_blank"
        rel="noopener noreferrer"
        startDecorator={<OpenInNewIcon />}
        sx={{ mt: 2 }}
        variant="outlined"
        color="primary"
      >
        System test
      </Button>
    </Box>
  );
}

export default function PageSettingsMobile() {
  return (
    <Box sx={{ p: 1, width: '100%', maxWidth: 600, mx: 'auto' }}>
      <Typography level="h2" sx={{ mb: 2 }}>
        Settings
      </Typography>
      <AppInfo />
      <ReleaseLog />
    </Box>
  );
}
