/**
 * PageSettings - Application settings and configuration
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout + ResponsiveContainer(table-page) - 16px padding
 * Responsive: Mobile/Desktop views, useResponsive() hook
 * Components: UserProfile, AppInfo, ReleaseLog widgets
 * Data: User profile data and static configuration
 */

import React, { useState, useEffect } from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import Stack from '@mui/joy/Stack';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Avatar from '@mui/joy/Avatar';
import IconButton from '@mui/joy/IconButton';
import Divider from '@mui/joy/Divider';
import Alert from '@mui/joy/Alert';

// Icons
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import UpdateIcon from '@mui/icons-material/Update';
import PersonIcon from '@mui/icons-material/Person';
import AppsIcon from '@mui/icons-material/Apps';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PageLayout from '../layouts/PageLayout';
import fonts from '../theme/fonts';
import { marked } from 'marked';
import { supabase } from '../utils/supabaseClient';

// Helper component for user profile management
function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [country, setCountry] = useState('Thailand');
  const [timezone, setTimezone] = useState('Indochina Time (Bangkok) — GMT+07:00');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get authenticated user
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData.user;
      
      if (authUser) {
        setUser(authUser);
        setEmail(authUser.email || '');
        
        // Get user profile from database
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (profileData) {
          setUserProfile(profileData);
          const nameParts = (profileData.name || '').split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
          setRole(profileData.role || 'UI Developer');
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setMessage({ type: 'danger', text: 'Failed to load user data' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      const fullName = `${firstName} ${lastName}`.trim();
      
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          name: fullName,
          role: role,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      // Reload user data
      await loadUserData();
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'danger', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current data
    const nameParts = (userProfile?.name || '').split(' ');
    setFirstName(nameParts[0] || '');
    setLastName(nameParts.slice(1).join(' ') || '');
    setRole(userProfile?.role || 'UI Developer');
    setEditing(false);
    setMessage(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography level="body-sm" color="neutral">
            Loading profile...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography level="h4" sx={{ mb: 1 }}>
          Personal info
        </Typography>
        <Typography level="body-sm" color="neutral" sx={{ mb: 3 }}>
          Customize how your profile information will appear to the networks.
        </Typography>

        {message && (
          <Alert color={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3, 
          alignItems: { xs: 'center', sm: 'flex-start' }
        }}>
          {/* Avatar Section */}
          <Box sx={{ 
            position: 'relative',
            alignSelf: { xs: 'center', sm: 'flex-start' }
          }}>
            <Avatar
              size="lg"
              src={userProfile?.avatar_url || user?.user_metadata?.avatar_url}
              sx={{ width: 80, height: 80 }}
            >
              {firstName?.[0]}{lastName?.[0]}
            </Avatar>
            {editing && (
              <IconButton
                size="sm"
                variant="solid"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  borderRadius: '50%',
                  minHeight: 24,
                  minWidth: 24,
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Form Section */}
          <Box sx={{ flex: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Stack spacing={2}>
              {/* Name Row */}
              <Box>
                <FormLabel sx={{ mb: 1 }}>Name</FormLabel>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1 
                }}>
                  <Input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!editing}
                    sx={{ flex: 1 }}
                  />
                  <Input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!editing}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>

              {/* Role and Email Row */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2 
              }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Role</FormLabel>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={!editing}
                  />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    value={email}
                    disabled
                    startDecorator="✉️"
                  />
                </FormControl>
              </Box>

              {/* Country */}
              <FormControl>
                <FormLabel>Country</FormLabel>
                <Input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  disabled={!editing}
                />
              </FormControl>

              {/* Timezone */}
              <FormControl>
                <FormLabel>Timezone</FormLabel>
                <Input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  disabled={!editing}
                  startDecorator="🕐"
                />
              </FormControl>
            </Stack>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 1, 
              mt: 3, 
              justifyContent: { xs: 'stretch', sm: 'flex-end' }
            }}>
              {editing ? (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={saving}
                    startDecorator={<CloseIcon />}
                    sx={{ order: { xs: 2, sm: 1 } }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="solid"
                    onClick={handleSave}
                    loading={saving}
                    startDecorator={<CheckIcon />}
                    sx={{ order: { xs: 1, sm: 2 } }}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => setEditing(true)}
                  startDecorator={<EditIcon />}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

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
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      } else {
        // Redirect to login page
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const tabs = [
    { label: 'User', icon: <PersonIcon />, content: <UserProfile /> },
    { label: 'App', icon: <AppsIcon />, content: <AppInfo /> },
    { label: 'Releases', icon: <UpdateIcon />, content: <ReleaseLog /> },
  ];

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      <ResponsiveContainer padding="medium">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography level="h2" sx={{ fontSize: fonts.sizes.xlarge }}>
            My profile
          </Typography>
          <Button
            variant="outlined"
            color="danger"
            size="sm"
            startDecorator={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
        
        <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(typeof newValue === 'number' ? newValue : 0)}>
          <TabList>
            {tabs.map((tab, index) => (
              <Tab key={index} value={index}>
                {tab.label}
              </Tab>
            ))}
          </TabList>
          
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={index} sx={{ p: 0, pt: 3 }}>
              {tab.content}
            </TabPanel>
          ))}
        </Tabs>
      </ResponsiveContainer>
    </Box>
  );

  // Desktop View Component
  const DesktopView = () => (
    <ResponsiveContainer variant="table-page">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography level="h2" sx={{ fontSize: fonts.sizes.xlarge }}>
          My profile
        </Typography>
        <Button
          variant="outlined"
          color="danger"
          startDecorator={<LogoutIcon />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
      
      <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(typeof newValue === 'number' ? newValue : 0)}>
        <TabList>
          {tabs.map((tab, index) => (
            <Tab key={index} value={index}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={index} sx={{ p: 0, pt: 3 }}>
            {tab.content}
          </TabPanel>
        ))}
      </Tabs>
    </ResponsiveContainer>
  );

  return (
    <PageLayout>
      {isMobile ? <MobileView /> : <DesktopView />}
    </PageLayout>
  );
};

export default PageSettings;
