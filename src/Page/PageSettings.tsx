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
import { CURRENCY_CONFIG, formatCurrency, formatCurrencyWithSymbol } from '../utils/currencyUtils';
import { marked } from 'marked';
import { supabase } from '../utils/supabaseClient';

// Helper component for user profile management
function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);
  
  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

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
          // Use first_name and last_name directly from database
          setFirstName(profileData.first_name || '');
          setLastName(profileData.last_name || '');
          setRole(profileData.role || 'UI Developer');
          setDepartment(profileData.department || '');
          setAvatarUrl(profileData.avatar_url || '');
          setPhoneNumber(profileData.phone_number || '');
        }
        // Fallback to auth metadata if database fields are empty
        if (!profileData?.phone_number && authUser.user_metadata?.phone_number) {
          setPhoneNumber(authUser.user_metadata.phone_number);
        }
        // Note: authUser.phone is for SMS-based auth, not the same as our profile phone
        // Sync name fields from auth.users metadata if they exist and profile fields are empty
        if (authUser.user_metadata) {
          if (!profileData?.first_name && authUser.user_metadata.first_name) {
            setFirstName(authUser.user_metadata.first_name);
          }
          if (!profileData?.last_name && authUser.user_metadata.last_name) {
            setLastName(authUser.user_metadata.last_name);
          }
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
    
    // Validate phone number: must start with + and be at least 8 digits total
    const phoneRegex = /^\+[1-9]\d{7,}$/;
    if (phoneNumber && !phoneRegex.test(phoneNumber)) {
      setMessage({ 
        type: 'danger', 
        text: 'Phone number must include country code and be valid (e.g., +4512345678, +1234567890)' 
      });
      return;
    }
    
    // Validate names
    if (!firstName.trim()) {
      setMessage({ type: 'danger', text: 'First name is required' });
      return;
    }
    
    try {
      setSaving(true);
      
      // Note: name field will be automatically synced via database trigger
      // We only need to update first_name, last_name, and other fields
      const { error: userTableError } = await supabase
        .from('users')
        .update({
          role: role.trim() || null,
          department: department.trim() || null,
          avatar_url: avatarUrl.trim() || null,
          phone_number: phoneNumber.trim() || null,
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          // name field will be auto-updated by trigger
        })
        .eq('id', user.id);
      
      if (userTableError) throw userTableError;
      
      // Update phone number and metadata in auth.users table
      // Note: Supabase auth doesn't support direct phone updates via updateUser for existing users
      // Phone number will be stored in our users table and user_metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim() || null,
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone_number: phoneNumber.trim() || null, // Store in metadata for reference
        }
      });
      
      if (authError) {
        console.warn('Failed to update auth.users metadata:', authError);
        // Don't throw error - auth metadata update is not critical
        // The phone number is still properly stored in our users table
      }
      
      // Reload user data
      await loadUserData();
      setEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      let errorMessage = 'Failed to save profile';
      if (error instanceof Error) {
        if (error.message.includes('phone_number_format_check')) {
          errorMessage = 'Phone number format is invalid. Please use international format with country code (e.g., +4512345678)';
        } else {
          errorMessage = `Failed to save profile: ${error.message}`;
        }
      }
      setMessage({ type: 'danger', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'danger', text: 'Please select a valid image file' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'danger', text: 'Image size must be less than 5MB' });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      // Upload directly to bucket root
      const filePath = fileName;

      // Upload file to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update avatar URL in state first for immediate UI update
      setAvatarUrl(publicUrl);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: publicUrl }) // Store the clean URL in database
        .eq('id', user.id);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      // Force reload user data to sync with database
      await loadUserData();
      
      setMessage({ type: 'success', text: 'Avatar uploaded successfully' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      let errorMessage = 'Failed to upload avatar';
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          errorMessage = 'Storage bucket not configured. Please contact admin.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please contact admin.';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }
      
      setMessage({ type: 'danger', text: errorMessage });
    } finally {
      setUploading(false);
      // Clear the input
      event.target.value = '';
    }
  };

  const handleCancel = () => {
    // Reset form to current data
    setFirstName(userProfile?.first_name || '');
    setLastName(userProfile?.last_name || '');
    setRole(userProfile?.role || 'UI Developer');
    setDepartment(userProfile?.department || '');
    setAvatarUrl(userProfile?.avatar_url || '');
    setPhoneNumber(userProfile?.phone_number || '');
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
          Your profile information.
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
          alignItems: { xs: 'center', sm: 'stretch' },
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden' // Prevent overflow
        }}>
          {/* Avatar Section - Takes 1/3 of space */}
          <Box sx={{ 
            flex: { xs: 'none', sm: '1' }, // Use flex ratio instead of fixed percentage
            maxWidth: { xs: '100%', sm: '300px' }, // Limit max width
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // Center vertically
            alignItems: 'center', // Center horizontally
            position: 'relative',
            minHeight: { xs: 'auto', sm: '400px' }, // Minimum height for proper centering
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Box sx={{ 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Avatar
                size="lg"
                src={avatarUrl || userProfile?.avatar_url || user?.user_metadata?.avatar_url}
                sx={{ width: 160, height: 160 }}
                key={`avatar-${avatarUrl}-${userProfile?.avatar_url}`} // Force re-render when URL changes
              >
                {firstName?.[0]}{lastName?.[0]}
              </Avatar>
              
              {/* Upload controls - only show when editing */}
              {editing && (
                <Box sx={{ 
                  mt: 2, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 1
                }}>
                  {/* Upload button */}
                  <IconButton
                    component="label"
                    size="sm"
                    variant="solid"
                    color="primary"
                    loading={uploading}
                    sx={{
                      borderRadius: '8px',
                      px: 2,
                      py: 1,
                    }}
                  >
                    <EditIcon fontSize="small" sx={{ mr: 1 }} />
                    Upload Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      style={{ display: 'none' }}
                    />
                  </IconButton>
                  
                  {/* Upload helper text */}
                  <Typography 
                    level="body-xs" 
                    color="neutral" 
                    sx={{ 
                      textAlign: 'center',
                      maxWidth: 180,
                      lineHeight: 1.4
                    }}
                  >
                    Max 5MB (JPG, PNG, GIF)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Form Section - Takes remaining space */}
          <Box sx={{ 
            flex: { xs: 'none', sm: '2' }, // Use flex ratio instead of fixed percentage
            maxWidth: { xs: '100%', sm: 'calc(100% - 300px - 24px)' }, // Ensure it doesn't overflow
            width: { xs: '100%', sm: 'auto' },
            minWidth: 0 // Allow flex item to shrink below content size
          }}>
            <Stack spacing={2}>
              {/* Name Row */}
              <Box>
                <FormLabel sx={{ mb: 1 }}>Name</FormLabel>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2 
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

              {/* Phone Number Row */}
              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!editing}
                  placeholder="e.g., +4512345678, +1234567890"
                  startDecorator="📞"
                />
                {editing && (
                  <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                    Include country code (e.g., +45 for Denmark, +1 for US/Canada)
                  </Typography>
                )}
              </FormControl>

              {/* Role and Department Row */}
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
                  <FormLabel>Department</FormLabel>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={!editing}
                    placeholder="e.g., Engineering, Sales, Marketing"
                  />
                </FormControl>
              </Box>

              {/* Email */}
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={email}
                  disabled
                  startDecorator="✉️"
                />
              </FormControl>

              {/* Avatar URL */}
              <FormControl>
                <FormLabel>Avatar URL</FormLabel>
                <Input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  disabled={!editing}
                  placeholder="https://example.com/avatar.jpg"
                  startDecorator="🖼️"
                />
              </FormControl>

              {/* Read-only info */}
              {userProfile && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.level1', borderRadius: 'sm' }}>
                  <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
                    Account Information
                  </Typography>
                  <Stack spacing={1}>
                    {userProfile.created_at && (
                      <Typography level="body-sm">
                        <strong>Member since:</strong> {new Date(userProfile.created_at).toLocaleDateString()}
                      </Typography>
                    )}
                    {userProfile.last_login && (
                      <Typography level="body-sm">
                        <strong>Last login:</strong> {new Date(userProfile.last_login).toLocaleDateString()}
                      </Typography>
                    )}
                    {(userProfile.phone_number || phoneNumber) && (
                      <Typography level="body-sm">
                        <strong>Phone (stored):</strong> {userProfile.phone_number || phoneNumber}
                      </Typography>
                    )}
                    <Typography level="body-sm">
                      <strong>User ID:</strong> {userProfile.id}
                    </Typography>
                  </Stack>
                </Box>
              )}
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

  // Fallback content if the file is not available
  const fallbackContent = `## Latest Release
**Version 2.1.2** - July 6, 2025

### Recent Updates
- Modern Login Page Redesign with Split Layout
- Glassmorphism effect with backdrop blur and semi-transparent backgrounds
- Dynamic mountain landscape background images that change with light/dark mode
- Dark/light mode toggle in login page header
- Company branding with SmartBack logo and name in header

### System Status
- All systems operational
- Database migrations up to date
- Authentication services active

*For complete release history, please check the development environment or contact support.*`;

  React.useEffect(() => {
    // Try to fetch the release log from the public directory
    const url = '/RELEASE_LOG.md';
    console.log('Fetching release log from:', url);
    
    fetch(url)
      .then((res) => {
        console.log('Release log response status:', res.status, res.statusText);
        if (!res.ok) {
          throw new Error(`Failed to fetch release log: ${res.status} ${res.statusText}`);
        }
        return res.text();
      })
      .then((text) => {
        console.log('Release log loaded successfully, length:', text.length);
        // Filter out the developer instruction comments
        const filteredText = text.replace(/<!--[\s\S]*?-->/g, '').trim();
        setLog(filteredText);
        setError(false);
      })
      .catch((err) => {
        console.error('Error fetching release log:', err);
        console.log('Using fallback content');
        setLog(fallbackContent);
        setError(false); // Don't show error, just use fallback
      })
      .finally(() => setLoading(false));
  }, [fallbackContent]);

  return (
    <Card sx={{ height: '100%', minHeight: { xs: 200, md: 300 } }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <UpdateIcon color="primary" />
          <Typography level="h4">Release Log</Typography>
        </Box>
        
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {loading && (
            <Typography level="body-sm" color="neutral">
              Loading release log...
            </Typography>
          )}
          {!loading && (
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
            {__APP_NAME__.charAt(0).toUpperCase() + __APP_NAME__.slice(1)} business System
          </Typography>
          
          <Stack spacing={0.5}>
            <Typography level="body-sm" color="neutral">
              <strong>Environment:</strong> {import.meta.env.MODE}
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Version:</strong> {__APP_VERSION__}
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Build Date:</strong> {new Date().toLocaleDateString()}
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Platform:</strong> Web Application
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Language:</strong> English (US)
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Currency:</strong> {CURRENCY_CONFIG.currency} ({CURRENCY_CONFIG.symbol}) - {CURRENCY_CONFIG.locale}
            </Typography>
            <Typography level="body-sm" color="neutral">
              <strong>Currency Precision:</strong> Smart formatting (0-2 decimal places)
            </Typography>
          </Stack>
        </Stack>
        
        {/* Currency Formatting Examples */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'neutral.50', borderRadius: 'md' }}>
          <Typography level="title-sm" sx={{ mb: 1 }}>
            Currency Formatting Examples
          </Typography>
          <Stack spacing={0.5}>
            <Typography level="body-xs" color="neutral">
              <strong>Whole numbers:</strong> {formatCurrency(100)} • {formatCurrency(1500)} • {formatCurrency(25000)}
            </Typography>
            <Typography level="body-xs" color="neutral">
              <strong>With decimals:</strong> {formatCurrency(99.50)} • {formatCurrency(1234.56)} • {formatCurrency(15.25)}
            </Typography>
          </Stack>
        </Box>
        
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
        
        <Tabs 
          value={activeTab} 
          onChange={(event, newValue) => setActiveTab(typeof newValue === 'number' ? newValue : 0)}
          sx={{ bgcolor: 'transparent' }}
        >
          <TabList sx={{ bgcolor: 'transparent' }}>
            {tabs.map((tab, index) => (
              <Tab key={index} value={index} sx={{ bgcolor: 'transparent' }}>
                {tab.label}
              </Tab>
            ))}
          </TabList>
          
          {tabs.map((tab, index) => (
            <TabPanel key={index} value={index} sx={{ p: 0, pt: 3, bgcolor: 'transparent' }}>
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
      
      <Tabs 
        value={activeTab} 
        onChange={(event, newValue) => setActiveTab(typeof newValue === 'number' ? newValue : 0)}
        sx={{ bgcolor: 'transparent' }}
      >
        <TabList sx={{ bgcolor: 'transparent' }}>
          {tabs.map((tab, index) => (
            <Tab key={index} value={index} sx={{ bgcolor: 'transparent' }}>
              {tab.label}
            </Tab>
          ))}
        </TabList>
        
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={index} sx={{ p: 0, pt: 3, bgcolor: 'transparent' }}>
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
