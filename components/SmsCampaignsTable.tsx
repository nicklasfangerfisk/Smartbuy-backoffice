import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Table from '@mui/joy/Table';
import Card from '@mui/joy/Card';
import Button from '@mui/joy/Button';

// Dummy data for now
const campaigns = [
  { id: 1, name: 'June Promo', sent: 1200, status: 'Completed', date: '2025-06-01' },
  { id: 2, name: 'Flash Sale', sent: 800, status: 'Scheduled', date: '2025-06-15' },
];

export default function SmsCampaignsTable() {
  return (
    <Card sx={{ p: 2, m: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="h4">SMS Campaigns</Typography>
        <Button variant="solid" color="primary">New Campaign</Button>
      </Box>
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Sent</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.sent}</td>
              <td>{c.status}</td>
              <td>{c.date}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
}
