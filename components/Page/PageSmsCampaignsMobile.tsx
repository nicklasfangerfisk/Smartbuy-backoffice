import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import GeneralTableMobile from '../general/GeneralTableMobile';

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
