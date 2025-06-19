import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Table from '@mui/joy/Table';
import Card from '@mui/joy/Card';
import Button from '@mui/joy/Button';
import { supabase } from '../utils/supabaseClient';

// Dummy data for now
const campaigns = [
  { id: 1, name: 'June Promo', sent: 1200, status: 'Completed', date: '2025-06-01' },
  { id: 2, name: 'Flash Sale', sent: 800, status: 'Scheduled', date: '2025-06-15' },
];

// Get API base URL from environment variable or default to local
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

export default function SmsCampaignsTable() {
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <Card sx={{ p: 2, m: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography level="h4">SMS Campaigns</Typography>
        <Button variant="solid" color="primary" onClick={handleSendCampaign} loading={sending}>
          Send Test Campaign
        </Button>
      </Box>
      {error && <Typography color="danger">{error}</Typography>}
      {success && <Typography color="success">{success}</Typography>}
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

// To configure the backend API endpoint in production, set REACT_APP_API_BASE_URL in your build environment (e.g., in GitHub Pages or Netlify).
