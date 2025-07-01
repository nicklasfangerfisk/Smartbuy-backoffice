import * as React from 'react';
import Box from '@mui/joy/Box';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import Typography from '@mui/joy/Typography';
import Divider from '@mui/joy/Divider';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { ColorPaletteProp } from '@mui/joy/styles';
import { useNavigate } from 'react-router-dom';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';

/**
 * Represents a single ticket item in the mobile ticket list.
 * @property {string} id - The unique identifier for the ticket.
 * @property {string} subject - The subject or title of the ticket.
 * @property {'Open' | 'Pending' | 'Closed'} status - The current status of the ticket.
 * @property {string} requester_name - The name of the person who requested the ticket.
 * @property {string} [updated_at] - The last updated timestamp for the ticket.
 */
export interface TicketListMobileItem {
  id: string;
  subject: string;
  status: 'Open' | 'Pending' | 'Closed';
  requester_name: string;
  updated_at?: string;
}

/**
 * Props for the TicketListMobile component.
 * @property {TicketListMobileItem[]} tickets - The list of tickets to display.
 * @property {(ticketId: string) => void} [onRowClick] - Callback for when a ticket row is clicked.
 * @property {string | null} [selectedId] - The ID of the currently selected ticket.
 * @property {'Open' | 'Pending' | 'Closed' | 'All'} [status] - The filter status for tickets.
 */
interface TicketListMobileProps {
  tickets: TicketListMobileItem[];
  onRowClick?: (ticketId: string) => void;
  selectedId?: string | null;
  status?: 'Open' | 'Pending' | 'Closed' | 'All';
}

const statusColors: Record<string, { color: ColorPaletteProp; label: string }> = {
  Open: { color: 'success', label: 'Open' },
  Pending: { color: 'warning', label: 'Pending' },
  Closed: { color: 'neutral', label: 'Closed' },
};

/**
 * TicketListMobile component displays a list of tickets in a mobile-friendly layout.
 * It supports filtering by status and highlights the selected ticket.
 *
 * @param {TicketListMobileProps} props - Props for the component.
 * @returns {JSX.Element} The rendered TicketListMobile component.
 */
export default function TicketListMobile({ tickets, onRowClick, selectedId, status }: TicketListMobileProps) {
  const navigate = useNavigate();

  // Only show the beach splash if there are tickets, all are closed, and the filter is not set to 'Closed' or 'All'
  const allClosedSplash = tickets.length > 0 && tickets.every(t => t.status === 'Closed') && (status === 'Open');

  return (
    <Box sx={{ p: 0, background: '#fff', minHeight: '100vh' }}>
      {allClosedSplash ? (
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
        }}>
          <BeachAccessIcon sx={{ fontSize: 80, color: '#1976d2' }} />
          <Typography level="h3" sx={{ fontWeight: 700, textAlign: 'center' }}>
            All done, you can now go to the beach
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {tickets.map((ticket, idx) => (
            <React.Fragment key={ticket.id}>
              <Box
                sx={{
                  px: 2,
                  pt: 2,
                  pb: 1.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  cursor: onRowClick ? 'pointer' : undefined,
                  background: selectedId === ticket.id ? '#f0f4ff' : 'transparent',
                  transition: 'background 0.2s',
                }}
                onClick={() => onRowClick?.(ticket.id)}
              >
                <Avatar size="sm" sx={{ bgcolor: '#e3e3e3', color: '#333', fontWeight: 700, mt: 0.5 }}>
                  {ticket.requester_name?.[0] || '?'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography level="title-sm" sx={{ fontWeight: 600, mb: 0.5, wordBreak: 'break-word' }}>
                    {ticket.subject}
                  </Typography>
                  <Typography level="body-xs" color="neutral" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                    {ticket.requester_name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography level="body-xs" color="neutral">
                      {ticket.updated_at ? new Date(ticket.updated_at).toISOString().slice(0, 10) : ''}
                    </Typography>
                    <Typography level="body-xs" color="neutral">&bull;</Typography>
                    <Typography level="body-xs" color="neutral" sx={{ wordBreak: 'break-all' }}>{ticket.id}</Typography>
                  </Box>
                </Box>
                <Chip
                  variant="soft"
                  size="sm"
                  color={statusColors[ticket.status]?.color}
                  sx={{ fontWeight: 600, px: 1.5, py: 0.5, ml: 1 }}
                >
                  {statusColors[ticket.status]?.label}
                </Chip>
              </Box>
              <Box sx={{ pl: 7, pt: 1, pb: 0.5, color: 'text.secondary', fontSize: 18, fontWeight: 400 }}>...</Box>
              {idx < tickets.length - 1 && <Divider sx={{ mx: 2, my: 0.5 }} />}
            </React.Fragment>
          ))}
          {tickets.length === 0 && (
            <Typography color="neutral" sx={{ textAlign: 'center', mt: 4 }}>
              No tickets found.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
