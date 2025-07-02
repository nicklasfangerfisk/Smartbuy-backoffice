/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';
import { supabase } from '../utils/supabaseClient';
import OrderTableCreate from '../Dialog/OrderTableCreate';
import OrderTableDetails from '../Dialog/OrderTableDetails';
import useMediaQuery from '@mui/material/useMediaQuery';
import PageOrderMobile, { PageOrderMobileItem } from './PageOrderMobile';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
// No handleOrderClick utility found. If needed, define locally or use inline logic.
import fonts from '../theme/fonts';
import { format } from 'date-fns';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import PageLayout from '../layouts/PageLayout';

const API_BASE_URL = typeof process !== 'undefined' ? process.env.REACT_APP_API_BASE_URL || '/api' : '/api';

export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'failed';

type CampaignRow = {
  id: string;
  CampaignNumber: string;
  name: string;
  message: string;
  recipients: string[];
  status: CampaignStatus;
  scheduled_at: string | null;
  sent_at: string | null;
  created_at: string;
};

const typographyStyles = { fontSize: fonts.sizes.small };
const headerStyles = { ...typographyStyles, fontWeight: 600, borderBottom: '1.5px solid #e0e0e0', background: 'inherit' };

/**
 * Desktop view for managing SMS campaigns.
 * Displays a table of campaigns and includes a button to send a test SMS campaign.
 *
 * @param {PageSmsCampaignsDesktopProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function PageSmsCampaignsDesktop({ campaigns }: { campaigns: CampaignRow[] }) {
  const [rows, setRows] = React.useState<CampaignRow[]>(campaigns);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');

  React.useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        setError(error.message);
        setRows([]);
      } else if (data) {
        setRows(data);
      }
      setLoading(false);
    }
    fetchCampaigns();
  }, []);

  const filteredRows = rows.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase()) || (row.CampaignNumber?.toLowerCase().includes(search.toLowerCase()));
    const statusMatch = !statusFilter || row.status === statusFilter;
    return matchesSearch && statusMatch;
  });

  if (isMobile) {
    return <div>Mobile view coming soon...</div>;
  }

  return (
    <PageLayout>
      <Box sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 0, boxShadow: 'none', pl: 0, pr: 0, pt: 3, pb: 0 }}>
        <Typography level="h2" sx={{ ...typographyStyles, mb: 2, textAlign: 'left', fontSize: fonts.sizes.xlarge }}>SMS Campaigns</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Input
            placeholder="Search campaigns..."
            sx={{ ...typographyStyles, flex: 1 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Select
            placeholder="Filter status"
            value={statusFilter}
            onChange={(_, value) => setStatusFilter(value ?? '')}
            sx={{ ...typographyStyles, minWidth: 160 }}
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
            sx={typographyStyles}
          >
            Create Campaign
          </Button>
        </Box>
        <Card>
          {loading && <LinearProgress />}
          <Table aria-label="Campaigns" sx={{ minWidth: 800 }}>
            <thead>
              <tr>
                <th style={headerStyles}>Campaign #</th>
                <th style={headerStyles}>Name</th>
                <th style={headerStyles}>Status</th>
                <th style={headerStyles}>Scheduled</th>
                <th style={headerStyles}>Recipients</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#888', ...typographyStyles }}>No campaigns found.</td>
                </tr>
              )}
              {filteredRows.map((row) => (
                <tr key={row.id} style={{ height: 48 }}>
                  <td style={typographyStyles}>{row.CampaignNumber}</td>
                  <td style={typographyStyles}>{row.name}</td>
                  <td style={typographyStyles}>
                    <Chip
                      variant="soft"
                      color={
                        row.status === 'sent'
                          ? 'success'
                          : row.status === 'failed'
                          ? 'danger'
                          : row.status === 'scheduled'
                          ? 'warning'
                          : 'neutral'
                      }
                      size="sm"
                      sx={{ textTransform: 'capitalize', ...typographyStyles }}
                    >
                      {row.status}
                    </Chip>
                  </td>
                  <td style={typographyStyles}>{row.scheduled_at ? format(new Date(row.scheduled_at), 'yyyy-MM-dd HH:mm') : '-'}</td>
                  <td style={typographyStyles}>{row.recipients?.length ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
        {error && <Typography color="danger">Error: {error}</Typography>}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalDialog>
            <Typography level="h4">Create New Campaign</Typography>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </ModalDialog>
        </Modal>
      </Box>
    </PageLayout>
  );
}

// To configure the backend API endpoint in production, set REACT_APP_API_BASE_URL in your build environment (e.g., in GitHub Pages or Netlify).
