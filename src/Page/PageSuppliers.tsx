/**
 * PageSuppliers - Supplier management with contact details
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout + ResponsiveContainer(table-page) - 16px padding
 * Responsive: Mobile/Desktop views, useResponsive() hook
 * Dialogs: DialogSupplier for CRUD operations
 * Data: Supabase Suppliers table
 */

import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import CardContent from '@mui/joy/CardContent';
import LinearProgress from '@mui/joy/LinearProgress';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Avatar from '@mui/joy/Avatar';
import Stack from '@mui/joy/Stack';
import Grid from '@mui/joy/Grid';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PageLayout from '../layouts/PageLayout';
import DialogSupplier from '../Dialog/DialogSupplier';
import fonts from '../theme/fonts';

// Types
export interface SupplierItem {
  id: string | number;
  name: string;
  email?: string;
  contact_name?: string;
  phone?: string;
  address?: string;
  image_url?: string;
}

// Typography styles for consistency
const typographyStyles = { fontSize: fonts.sizes.small };

// Generate avatar color and initials based on supplier name
const getSupplierColor = (name: string): 'primary' | 'success' | 'warning' | 'danger' | 'neutral' => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors: ('primary' | 'success' | 'warning' | 'danger' | 'neutral')[] = ['primary', 'success', 'warning', 'danger', 'neutral'];
  return colors[Math.abs(hash) % colors.length];
};

const getSupplierInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Mobile Menu Component - Removed since cards are now clickable

const PageSuppliers = () => {
  const { isMobile } = useResponsive();
  
  // Data states
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  
  // Dialog states
  const [isOpen, setIsOpen] = useState(false);
  const [editedSupplier, setEditedSupplier] = useState<SupplierItem | null>(null);
  const [mode, setMode] = useState<'view' | 'edit' | 'add'>('view');

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.from('Suppliers').select('*');
      
      if (error) throw error;
      
      if (data) {
        setSuppliers(data);
      }
    } catch (err: any) {
      console.error('Error fetching suppliers:', err);
      setError(err.message || 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  // Handle supplier operations
  const handleView = (supplier: SupplierItem) => {
    setEditedSupplier(supplier);
    setMode('view');
    setIsOpen(true);
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleDelete = async (id: string | number) => {
    // This will be called from the form dialog
    await fetchSuppliers();
  };

  const handleSave = async () => {
    setIsOpen(false);
    await fetchSuppliers();
  };

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(search.toLowerCase()) ||
    supplier.address?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort suppliers alphabetically
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  // Initial fetch
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ pb: 2 }}>
      {/* Header */}
      <ResponsiveContainer padding="medium">
        <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
          Suppliers
        </Typography>
        
        {/* Search */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startDecorator={<SearchIcon />}
            sx={{ flex: 1 }}
          />
        </Box>

        <Button
          variant="solid"
          startDecorator={<AddIcon />}
          onClick={() => {
            setEditedSupplier(null);
            setMode('add');
            setIsOpen(true);
          }}
          sx={{ width: '100%', mb: 2 }}
        >
          Add Supplier
        </Button>
      </ResponsiveContainer>

      {/* Loading and Error States */}
      {loading && <LinearProgress />}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="danger">Error: {error}</Typography>
        </Box>
      )}

      {/* Supplier List */}
      <Box>
        {sortedSuppliers.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="neutral">
              No suppliers found
            </Typography>
          </Box>
        ) : (
          sortedSuppliers.map((supplier) => (
            <Card 
              key={supplier.id} 
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
              onClick={() => handleView(supplier)}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  {/* Avatar */}
                  <Avatar
                    size="md"
                    src={supplier.image_url}
                    color={getSupplierColor(supplier.name)}
                    sx={{ flexShrink: 0 }}
                  >
                    {!supplier.image_url && getSupplierInitials(supplier.name)}
                  </Avatar>

                  {/* Main Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {/* Header with name */}
                    <Box sx={{ mb: 1 }}>
                      <Typography 
                        level="title-md" 
                        sx={{ 
                          fontWeight: 'bold',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {supplier.name}
                      </Typography>
                    </Box>
                    
                    {/* Contact Information */}
                    <Stack spacing={0.5}>
                      {supplier.contact_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.tertiary' }} />
                          <Typography level="body-sm" color="neutral">
                            {supplier.contact_name}
                          </Typography>
                        </Box>
                      )}
                      
                      {supplier.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.tertiary' }} />
                          <Typography 
                            level="body-sm" 
                            color="neutral"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {supplier.email}
                          </Typography>
                        </Box>
                      )}
                      
                      {supplier.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.tertiary' }} />
                          <Typography level="body-sm" color="neutral">
                            {supplier.phone}
                          </Typography>
                        </Box>
                      )}
                      
                      {supplier.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mt: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: 'text.tertiary', mt: 0.25 }} />
                          <Typography 
                            level="body-sm" 
                            color="neutral"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.2
                            }}
                          >
                            {supplier.address}
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
        Suppliers
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <Input
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startDecorator={<SearchIcon />}
          sx={{ flex: 1 }}
        />
        <Button
          variant="solid"
          startDecorator={<AddIcon />}
          onClick={() => {
            setEditedSupplier(null);
            setMode('add');
            setIsOpen(true);
          }}
          sx={{ minWidth: 140, flexShrink: 0 }}
        >
          Add Supplier
        </Button>
      </Box>

      {/* Loading and Error States */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && (
        <Typography color="danger" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}

      {/* Suppliers Grid */}
      <Grid 
        container 
        spacing={2} 
        sx={{ 
          width: 'calc(100% + 16px)', 
          ml: '-8px',
          mt: '-8px'
        }}
      >
          {sortedSuppliers.length === 0 ? (
            <Grid xs={12} sx={{ width: '100%' }}>
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="neutral">
                  No suppliers found
                </Typography>
              </Box>
            </Grid>
          ) : (
            sortedSuppliers.map((supplier) => (
              <Grid 
                key={supplier.id} 
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
                    minHeight: '200px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 'md',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handleView(supplier)}
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
                        src={supplier.image_url}
                        color={getSupplierColor(supplier.name)}
                        sx={{ flexShrink: 0 }}
                      >
                        {!supplier.image_url && getSupplierInitials(supplier.name)}
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
                        {supplier.name}
                      </Typography>
                    </Box>

                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      {supplier.contact_name && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <PersonIcon sx={{ fontSize: 16, color: 'text.tertiary', flexShrink: 0 }} />
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
                            {supplier.contact_name}
                          </Typography>
                        </Box>
                      )}
                      
                      {supplier.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <EmailIcon sx={{ fontSize: 16, color: 'text.tertiary', flexShrink: 0 }} />
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
                            {supplier.email}
                          </Typography>
                        </Box>
                      )}
                      
                      {supplier.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: 'text.tertiary', flexShrink: 0 }} />
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
                            {supplier.phone}
                          </Typography>
                        </Box>
                      )}
                      
                      {supplier.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <LocationOnIcon sx={{ fontSize: 16, color: 'text.tertiary', flexShrink: 0, mt: 0.25 }} />
                          <Typography 
                            level="body-sm" 
                            color="neutral"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              lineHeight: 1.3,
                              flex: 1,
                              minWidth: 0
                            }}
                          >
                            {supplier.address}
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
      
      {/* Supplier Form Dialog */}
      <DialogSupplier
        open={isOpen}
        onClose={() => setIsOpen(false)}
        supplier={editedSupplier as any}
        onSaved={handleSave}
        mode={mode === 'edit' || mode === 'add' || mode === 'view' ? mode : undefined}
        onDelete={mode === 'edit' ? handleDelete : undefined}
        onEdit={handleEdit}
      />
    </PageLayout>
  );
};

export default PageSuppliers;
