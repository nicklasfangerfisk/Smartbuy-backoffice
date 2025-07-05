import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import GeneralTableMobile from '../general/GeneralTableMobile';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import LinearProgress from '@mui/joy/LinearProgress';
import { format } from 'date-fns';

/**
 * Mobile-friendly view for displaying SMS campaigns.
 * Uses the GeneralTableMobile component to render a list of campaigns.
 *
 * @param {Object} props - The props for the component.
 * @param {PageSmsCampaignsMobileItem[]} props.campaigns - The list of SMS campaigns to display.
 * @returns {JSX.Element} The rendered component.
 */

/**
 * Represents a single SMS campaign item.
 * @property {number} id - The unique identifier for the campaign.
 * @property {string} name - The name of the campaign.
 * @property {number} sent - The number of messages sent in the campaign.
 * @property {string} status - The status of the campaign (e.g., "Completed", "Pending").
 * @property {string} date - The date the campaign was created or sent.
 */
export interface PageSmsCampaignsMobileItem {
  id: string;
  CampaignNumber: string;
  name: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  recipients: string[];
  created_at: string;
}

const PageSmsCampaignsMobile: React.FC = () => {
  const [campaigns, setCampaigns] = React.useState<PageSmsCampaignsMobileItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    async function fetchCampaigns() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching campaigns:', error.message, error.details, error.hint); // Log detailed error information
        setError(error.message);
        setCampaigns([]);
      } else if (data) {
        setCampaigns(data);
      }
      setLoading(false);
    }
    fetchCampaigns();
  }, []);

  return (
    <>
      {loading && <LinearProgress />}
      {error && <Typography color="danger">Error: {error}</Typography>}
      <GeneralTableMobile
        items={campaigns}
        renderItem={(campaign) => (
          <Box>
            <Typography fontWeight="bold">Campaign #: {campaign.CampaignNumber}</Typography>
            <Typography>Name: {campaign.name}</Typography>
            <Typography>Status: {campaign.status}</Typography>
            <Typography>Scheduled: {campaign.scheduled_at ? format(new Date(campaign.scheduled_at), 'yyyy-MM-dd HH:mm') : '-'}</Typography>
            <Typography>Sent: {campaign.sent_at ? format(new Date(campaign.sent_at), 'yyyy-MM-dd HH:mm') : '-'}</Typography>
            <Typography>Recipients: {campaign.recipients?.length ?? 0}</Typography>
          </Box>
        )}
        ariaLabel="SMS Campaigns Mobile View"
      />
    </>
  );
};

export default PageSmsCampaignsMobile;
