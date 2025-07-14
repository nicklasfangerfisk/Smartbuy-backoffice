import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Input,
  Card,
  CardContent,
  Avatar,
  Stack,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/joy';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Language as WebIcon,
  Circle as StatusIcon,
} from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';
import PageLayout from '../layouts/PageLayout';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import fonts from '../theme/fonts';
import DialogStorefront from '../Dialog/DialogStorefront';

// Storefront interface
interface StorefrontItem {
  id: string;
  name: string;
  url?: string;
  logo_url?: string;
  is_online: boolean;
  created_at?: string;
  updated_at?: string;
}

// Helper function to get storefront color
const getStorefrontColor = (name: string): 'primary' | 'danger' | 'success' | 'warning' | 'neutral' => {
  const colors: ('primary' | 'danger' | 'success' | 'warning' | 'neutral')[] = ['primary', 'danger', 'success', 'warning', 'neutral'];
  const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

// Helper function to get storefront initials
const getStorefrontInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const PageStorefronts: React.FC = () => {
  const [storefronts, setStorefronts] = useState<StorefrontItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editedStorefront, setEditedStorefront] = useState<StorefrontItem | null>(null);
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('add');

  const { isMobile } = useResponsive();

  // Fetch storefronts from database
  const fetchStorefronts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('storefronts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setStorefronts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStorefronts();
  }, []);

  // Filter storefronts based on search
  const filteredStorefronts = storefronts.filter(storefront =>
    storefront.name.toLowerCase().includes(search.toLowerCase()) ||
    (storefront.url && storefront.url.toLowerCase().includes(search.toLowerCase()))
  );

  // Sort storefronts
  const sortedStorefronts = [...filteredStorefronts].sort((a, b) => {
    // Online storefronts first
    if (a.is_online !== b.is_online) {
      return a.is_online ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  // Handle view/edit storefront
  const handleView = (storefront: StorefrontItem) => {
    setEditedStorefront(storefront);
    setMode('view');
    setIsOpen(true);
  };

  // Handle edit mode
  const handleEdit = () => {
    setMode('edit');
  };

  // Handle save (create or update)
  const handleSave = () => {
    fetchStorefronts();
    setIsOpen(false);
  };

  // Handle delete
  const handleDelete = () => {
    fetchStorefronts();
    setIsOpen(false);
  };

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ p: 2 }}>
      <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
        Storefronts
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Input
          placeholder="Search storefronts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startDecorator={<SearchIcon />}
          sx={{ flex: 1 }}
        />
        <Button
          variant="solid"
          startDecorator={<AddIcon />}
          onClick={() => {
            setEditedStorefront(null);
            setMode('add');
            setIsOpen(true);
          }}
          sx={{ minWidth: 100, flexShrink: 0 }}
        >
          Add
        </Button>
      </Box>

      {/* Loading and Error States */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Typography color="danger" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {/* Storefronts List */}
      <Box>
        {sortedStorefronts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="neutral">
              No storefronts found
            </Typography>
          </Box>
        ) : (
          sortedStorefronts.map((storefront) => (
            <Card 
              key={storefront.id} 
              variant="outlined"
              sx={{ 
                mx: 2, 
                mb: 2,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 'md',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
              onClick={() => handleView(storefront)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Avatar */}
                  <Avatar
                    size="md"
                    src={storefront.logo_url}
                    color={getStorefrontColor(storefront.name)}
                    sx={{ flexShrink: 0 }}
                  >
                    {!storefront.logo_url && getStorefrontInitials(storefront.name)}
                  </Avatar>

                  {/* Main Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Header with name and status */}
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        level="title-md" 
                        sx={{ 
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}
                      >
                        {storefront.name}
                      </Typography>
                      <Chip
                        size="sm"
                        color={storefront.is_online ? 'success' : 'neutral'}
                        startDecorator={<StatusIcon sx={{ fontSize: 12 }} />}
                      >
                        {storefront.is_online ? 'Online' : 'Offline'}
                      </Chip>
                    </Box>
                    
                    {/* URL Information */}
                    <Stack spacing={0.5}>
                      {storefront.url && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <WebIcon sx={{ fontSize: 16, color: 'text.tertiary' }} />
                          <Typography 
                            level="body-sm" 
                            color="neutral"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {storefront.url}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );

  // Desktop View Component
  const DesktopView = () => (
    <ResponsiveContainer variant="table-page">
      <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
        Storefronts
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Input
          placeholder="Search storefronts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startDecorator={<SearchIcon />}
          sx={{ flex: 1 }}
        />
        <Button
          variant="solid"
          startDecorator={<AddIcon />}
          onClick={() => {
            setEditedStorefront(null);
            setMode('add');
            setIsOpen(true);
          }}
          sx={{ minWidth: 140, flexShrink: 0 }}
        >
          Add Storefront
        </Button>
      </Box>

      {/* Loading and Error States */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Typography color="danger" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {/* Storefronts Grid */}
      <Grid 
        container 
        spacing={2} 
        sx={{ 
          width: 'calc(100% + 16px)', 
          ml: '-8px',
          mt: '-8px'
        }}
      >
          {sortedStorefronts.length === 0 ? (
            <Grid xs={12} sx={{ width: '100%' }}>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="neutral">
                  No storefronts found
                </Typography>
              </Box>
            </Grid>
          ) : (
            sortedStorefronts.map((storefront) => (
              <Grid 
                key={storefront.id} 
                xs={12} 
                sm={6} 
                lg={4} 
                xl={3}
                sx={{ 
                  display: 'flex',
                  width: '100%'
                }}
              >
                <Card 
                  variant="outlined" 
                  sx={{ 
                    width: '100%',
                    minHeight: '160px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 'md',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handleView(storefront)}
                >
                  <CardContent sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        size="md"
                        src={storefront.logo_url}
                        color={getStorefrontColor(storefront.name)}
                        sx={{ flexShrink: 0 }}
                      >
                        {!storefront.logo_url && getStorefrontInitials(storefront.name)}
                      </Avatar>
                      <Typography 
                        level="title-md" 
                        fontWeight="bold"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1,
                          minWidth: 0
                        }}
                      >
                        {storefront.name}
                      </Typography>
                    </Box>

                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      {/* Status */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <StatusIcon sx={{ fontSize: 16, color: storefront.is_online ? 'success.main' : 'neutral.main', flexShrink: 0 }} />
                        <Chip
                          size="sm"
                          color={storefront.is_online ? 'success' : 'neutral'}
                        >
                          {storefront.is_online ? 'Online' : 'Offline'}
                        </Chip>
                      </Box>
                      
                      {/* URL */}
                      {storefront.url && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <WebIcon sx={{ fontSize: 16, color: 'text.tertiary', flexShrink: 0 }} />
                          <Typography 
                            level="body-sm" 
                            color="neutral"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                              minWidth: 0
                            }}
                          >
                            {storefront.url}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
      </Grid>
    </ResponsiveContainer>
  );

  return (
    <PageLayout>
      {isMobile ? <MobileView /> : <DesktopView />}
      
      {/* Storefront Form Dialog */}
      <DialogStorefront
        open={isOpen}
        onClose={() => setIsOpen(false)}
        storefront={editedStorefront as any}
        onSaved={handleSave}
        mode={mode === 'edit' || mode === 'add' || mode === 'view' ? mode : undefined}
        onDelete={mode === 'edit' ? handleDelete : undefined}
        onEdit={handleEdit}
      />
    </PageLayout>
  );
};

export default PageStorefronts;
