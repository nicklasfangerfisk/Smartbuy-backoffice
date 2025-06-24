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
import { supabase } from '../../utils/supabaseClient';
import OrderTableCreate from '../Dialog/OrderTableCreate';
import OrderTableDetails from '../Dialog/OrderTableDetails';
import useMediaQuery from '@mui/material/useMediaQuery';
import PageOrderMobile, { PageOrderMobileItem } from './PageOrderMobile';
import Card from '@mui/joy/Card';
import LinearProgress from '@mui/joy/LinearProgress';
import { handleOrderClick } from '../../utils';
import fonts from '../../theme/fonts';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

const API_BASE_URL = typeof process !== 'undefined' ? process.env.REACT_APP_API_BASE_URL || '/api' : '/api';

export type CampaignStatus = 'Active' | 'Paused' | 'Completed';

type CampaignRow = {
  id: string;
  name: string;
  sent: number;
  status: CampaignStatus;
  date: string;
};

const typographyStyles = { fontSize: fonts.sizes.medium };

/**
 * Desktop view for managing SMS campaigns.
 * Displays a table of campaigns and includes a button to send a test SMS campaign.
 *
 * @param {PageSmsCampaignsDesktopProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
export default function PageSmsCampaignsDesktop({ campaigns }: PageSmsCampaignsDesktopProps) {
  const [rows, setRows] = React.useState<CampaignRow[]>([]);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');
  const [filteredCampaigns, setFilteredCampaigns] = React.useState(campaigns);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const isMobile = useMediaQuery('(max-width: 600px)');

  React.useEffect(() => {
    async function fetchCampaigns() {
      try {
        const { data, error } = await supabase.from('Campaigns').select('*');
        if (error) throw error;
        setRows(data.map((campaign) => ({
          id: campaign.id,
          name: campaign.name,
          sent: campaign.sent,
          status: campaign.status,
          date: campaign.date,
        })));
      } catch (err) {
        console.error('Error fetching campaigns:', err);
      }
    }
    fetchCampaigns();
  }, []);

  React.useEffect(() => {
    setFilteredCampaigns(
      campaigns.filter((campaign) =>
        campaign.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, campaigns]);

  /**
   * Sends a test SMS campaign to the backend API.
   * Updates the UI with success or error messages based on the response.
   */
  async function handleSendCampaign() {
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await fetch(`${API_BASE_URL}/send-sms-campaign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'This is a test SMS campaign!' })
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || 'Failed to send SMS');
      setSuccess(`Sent to ${result.sent} recipients!`);
    } catch (err) {
      console.error('Error sending SMS campaign:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setSending(false);
    }
  }

  const filteredRows = rows.filter(row => {
    const matchesSearch = row.name.toLowerCase().includes(search.toLowerCase());
    const statusMatch = !statusFilter || row.status === statusFilter;
    return matchesSearch && statusMatch;
  });

  if (isMobile) {
    return <div>Mobile view coming soon...</div>;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.body', borderRadius: 2, boxShadow: 2, p: 4 }}>
      <Typography level="h2" sx={{ ...typographyStyles, mb: 2, textAlign: 'left' }}>SMS Campaigns</Typography>
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
          <Option value="Active">Active</Option>
          <Option value="Paused">Paused</Option>
          <Option value="Completed">Completed</Option>
        </Select>
        <Button
          onClick={() => setIsModalOpen(true)}
          variant="solid"
        >
          Create Campaign
        </Button>
      </Box>
      <Card>
        {sending && <LinearProgress />}
        <Table aria-label="Campaigns" sx={{ ...typographyStyles, minWidth: 800 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Sent</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#888' }}>No campaigns found.</td>
              </tr>
            )}
            {filteredRows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.sent}</td>
                <td>
                  <Chip
                    variant="soft"
                    color={
                      row.status === 'Active'
                        ? 'success'
                        : row.status === 'Paused'
                        ? 'warning'
                        : 'neutral'
                    }
                    size="sm"
                    sx={{ textTransform: 'capitalize' }}
                  >
                    {row.status}
                  </Chip>
                </td>
                <td>{new Date(row.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      {error && <Typography color="danger">Error: {error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalDialog>
          <Typography level="h4">Create New Campaign</Typography>
          <Button onClick={() => setIsModalOpen(false)}>Close</Button>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

// To configure the backend API endpoint in production, set REACT_APP_API_BASE_URL in your build environment (e.g., in GitHub Pages or Netlify).
