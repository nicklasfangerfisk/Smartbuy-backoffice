import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import IconButton from '@mui/joy/IconButton';
import Chip from '@mui/joy/Chip';
import Table from '@mui/joy/Table';
import Stack from '@mui/joy/Stack';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import MessageIcon from '@mui/icons-material/Message';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DraftsIcon from '@mui/icons-material/Drafts';

// Local imports
import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';
import PageLayout from '../layouts/PageLayout';
import fonts from '../theme/fonts';
import { format } from 'date-fns';

// Types
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

export interface SmsCampaignItem {
  id: string;
  CampaignNumber: string;
  name: string;
  message: string;
  recipients: string[];
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
}

// Status order for sorting
const statusOrder = { draft: 0, scheduled: 1, sent: 2, failed: 3 };

// Typography styles for consistency
const typographyStyles = { fontSize: fonts.sizes.small };
const headerStyles = { ...typographyStyles, fontWeight: 600, borderBottom: '1.5px solid #e0e0e0', background: 'inherit' };

// Helper functions
const getStatusColor = (status: CampaignStatus) => {
  switch (status) {
    case 'draft': return 'neutral';
    case 'scheduled': return 'warning';
    case 'sent': return 'success';
    case 'failed': return 'danger';
    default: return 'neutral';
  }
};

const getStatusIcon = (status: CampaignStatus) => {
  switch (status) {
    case 'draft': return <DraftsIcon />;
    case 'scheduled': return <ScheduleIcon />;
    case 'sent': return <CheckCircleIcon />;
    case 'failed': return <ErrorIcon />;
    default: return <MessageIcon />;
  }
};

const PageSmsCampaigns = () => {
  const { isMobile } = useResponsive();
  
  // Data states
  const [campaigns, setCampaigns] = useState<SmsCampaignItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setCampaigns(data);
      }
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.message || 'Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = 
      campaign.name.toLowerCase().includes(search.toLowerCase()) ||
      campaign.CampaignNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? campaign.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    const statusA = statusOrder[a.status] ?? 99;
    const statusB = statusOrder[b.status] ?? 99;
    if (statusA !== statusB) return statusA - statusB;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Initial fetch
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Mobile View Component
  const MobileView = () => (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>
      {/* Header */}
      <ResponsiveContainer padding="medium">
        <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
          SMS Campaigns
        </Typography>
        
        {/* Search and Filter */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Input
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startDecorator={<SearchIcon />}
            sx={{ flex: 1 }}
          />
          <Select
            placeholder="Status"
            value={statusFilter}
            onChange={(_, value) => setStatusFilter(value ?? '')}
            sx={{ minWidth: 120 }}
          >
            <Option value="">All</Option>
            <Option value="draft">Draft</Option>
            <Option value="scheduled">Scheduled</Option>
            <Option value="sent">Sent</Option>
            <Option value="failed">Failed</Option>
          </Select>
        </Box>

        <Button
          variant="solid"
          startDecorator={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ width: '100%', mb: 2 }}
        >
          Create Campaign
        </Button>
      </ResponsiveContainer>

      {/* Loading and Error States */}
      {loading && <LinearProgress />}
      {error && (
        <Box sx={{ p: 2 }}>
          <Typography color="danger">Error: {error}</Typography>
        </Box>
      )}

      {/* Campaign List */}
      <Box>
        {sortedCampaigns.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="neutral">
              No SMS campaigns found
            </Typography>
          </Box>
        ) : (
          sortedCampaigns.map((campaign) => (
            <Box 
              key={campaign.id} 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'background.level1'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Status Icon */}
                <Box 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    bgcolor: `${getStatusColor(campaign.status)}.100`,
                    color: `${getStatusColor(campaign.status)}.600`,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}
                >
                  {getStatusIcon(campaign.status)}
                </Box>

                {/* Main Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography 
                      level="title-sm" 
                      sx={{ 
                        fontWeight: 'bold',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '60%'
                      }}
                    >
                      {campaign.name}
                    </Typography>
                    
                    {/* Status Chip */}
                    <Chip 
                      size="sm"
                      color={getStatusColor(campaign.status)}
                      variant="soft"
                      sx={{ fontWeight: 'bold', minWidth: 'fit-content', textTransform: 'capitalize' }}
                    >
                      {campaign.status}
                    </Chip>
                  </Box>
                  
                  <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
                    Campaign #{campaign.CampaignNumber} • {new Date(campaign.created_at).toLocaleDateString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mb: 0.5 }}>
                    <Typography level="body-xs" color="neutral">
                      Recipients: {campaign.recipients?.length ?? 0}
                    </Typography>
                    {campaign.scheduled_at && (
                      <Typography level="body-xs" color="neutral">
                        Scheduled: {format(new Date(campaign.scheduled_at), 'MMM dd, HH:mm')}
                      </Typography>
                    )}
                  </Box>

                  {campaign.message && (
                    <Typography 
                      level="body-xs" 
                      color="neutral" 
                      sx={{ 
                        fontStyle: 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                    >
                      "{campaign.message}"
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );

  // Desktop View Component
  const DesktopView = () => (
    <ResponsiveContainer>
      <Typography level="h2" sx={{ mb: 2, fontSize: fonts.sizes.xlarge }}>
        SMS Campaigns
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Input
          placeholder="Search campaigns..."
          sx={{ flex: 1 }}
          value={search}
          onChange={e => setSearch(e.target.value)}
          startDecorator={<SearchIcon />}
        />
        <Select
          placeholder="Filter status"
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value ?? '')}
          sx={{ minWidth: 160 }}
        >
          <Option value="">All Statuses</Option>
          <Option value="draft">Draft</Option>
          <Option value="scheduled">Scheduled</Option>
          <Option value="sent">Sent</Option>
          <Option value="failed">Failed</Option>
        </Select>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="solid"
          startDecorator={<AddIcon />}
        >
          Create Campaign
        </Button>
      </Box>

      <Card>
        {loading && <LinearProgress />}
        {error && <Typography color="danger">Error: {error}</Typography>}
        
        <Table aria-label="SMS Campaigns" sx={{ minWidth: 800 }}>
          <thead>
            <tr>
              <th style={headerStyles}>Campaign #</th>
              <th style={headerStyles}>Name</th>
              <th style={headerStyles}>Status</th>
              <th style={headerStyles}>Scheduled</th>
              <th style={headerStyles}>Sent</th>
              <th style={headerStyles}>Recipients</th>
              <th style={headerStyles}>Message</th>
            </tr>
          </thead>
          <tbody>
            {sortedCampaigns.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>
                  No campaigns found.
                </td>
              </tr>
            )}
            {sortedCampaigns.map((campaign) => (
              <tr key={campaign.id} style={{ cursor: 'pointer', height: 48 }}>
                <td style={typographyStyles}>{campaign.CampaignNumber}</td>
                <td style={typographyStyles}>{campaign.name}</td>
                <td style={typographyStyles}>
                  <Chip
                    size="sm"
                    color={getStatusColor(campaign.status)}
                    variant="soft"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {campaign.status}
                  </Chip>
                </td>
                <td style={typographyStyles}>
                  {campaign.scheduled_at ? format(new Date(campaign.scheduled_at), 'yyyy-MM-dd HH:mm') : '-'}
                </td>
                <td style={typographyStyles}>
                  {campaign.sent_at ? format(new Date(campaign.sent_at), 'yyyy-MM-dd HH:mm') : '-'}
                </td>
                <td style={typographyStyles}>{campaign.recipients?.length ?? 0}</td>
                <td style={typographyStyles}>
                  <Typography 
                    level="body-sm" 
                    sx={{ 
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {campaign.message || '-'}
                  </Typography>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </ResponsiveContainer>
  );

  return (
    <PageLayout>
      {isMobile ? <MobileView /> : <DesktopView />}
      
      {/* Create Campaign Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalDialog>
          <ModalClose />
          <Typography level="h4">Create New Campaign</Typography>
          <Typography level="body-sm" sx={{ mt: 1, mb: 2 }}>
            Campaign creation functionality will be implemented here.
          </Typography>
          <Button onClick={() => setIsModalOpen(false)} variant="outlined">
            Close
          </Button>
        </ModalDialog>
      </Modal>
    </PageLayout>
  );
};

export default PageSmsCampaigns;
