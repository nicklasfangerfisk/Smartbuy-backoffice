import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import GeneralTableMobile from '../general/GeneralTableMobile';

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
  id: number;
  name: string;
  sent: number;
  status: string;
  date: string;
}

const PageSmsCampaignsMobile: React.FC<{ campaigns: PageSmsCampaignsMobileItem[] }> = ({ campaigns }) => {
  return (
    <GeneralTableMobile
      items={campaigns}
      renderItem={(campaign) => (
        <Box>
          <Typography fontWeight="bold">Name: {campaign.name}</Typography>
          <Typography>Sent: {campaign.sent}</Typography>
          <Typography>Status: {campaign.status}</Typography>
          <Typography>Date: {campaign.date}</Typography>
        </Box>
      )}
      ariaLabel="SMS Campaigns Mobile View"
    />
  );
};

export default PageSmsCampaignsMobile;
