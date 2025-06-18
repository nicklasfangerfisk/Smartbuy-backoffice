import * as React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Avatar from '@mui/joy/Avatar';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import ListItemContent from '@mui/joy/ListItemContent';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import IconButton from '@mui/joy/IconButton';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import { useTickets, useTicketActivities } from './useTickets';
import { supabase } from '../utils/supabaseClient';
import TicketForm from './TicketForm';
import { FormControl, Textarea } from '@mui/joy';
import { Stack } from '@mui/system';
import { Sheet } from '@mui/joy';

export default function TicketList() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<'Open' | 'Pending' | 'Closed' | 'All'>('Open');
  const [createOpen, setCreateOpen] = React.useState(false);
  const { tickets, loading, error, refresh } = useTickets();
  const filtered = tickets.filter(ticket => {
    const statusMatch = (status === 'All' || ticket.status === status);
    const subjectMatch = ticket.subject?.toLowerCase().includes(search.toLowerCase());
    const requesterMatch = ticket.requester_name?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && (subjectMatch || requesterMatch);
  });
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);
  const selectedTicket = filtered.find(t => t.id === selectedId) || filtered[0];
  const { activities, refresh: refreshActivities } = useTicketActivities(selectedTicket?.id || null);
  const [activityMessage, setActivityMessage] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [sendError, setSendError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  async function handleSendActivity() {
    if (!activityMessage.trim() || !selectedTicket) return;
    setSending(true);
    setSendError(null);
    const payload = {
      ticket_id: selectedTicket.id,
      activity_type: 'chat',
      message: activityMessage,
      direction: 'outbound',
      timestamp: new Date().toISOString(),
    };
    const { error } = await supabase.from('ticketactivities').insert(payload);
    if (error) {
      setSendError(error.message || JSON.stringify(error));
      setSending(false);
      return;
    }
    setActivityMessage('');
    setSending(false);
    refreshActivities();
  }

  // Formatting helpers for message input
  function insertAtCursor(before: string, after: string = before) {
    const textarea = document.querySelector('textarea[aria-label="Message"]') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = activityMessage;
    const selected = value.substring(start, end);
    let newValue = value.substring(0, start) + before + selected + after + value.substring(end);
    setActivityMessage(newValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length + selected.length);
    }, 0);
  }
  function handleBold() { insertAtCursor('**', '**'); }
  function handleItalic() { insertAtCursor('_', '_'); }
  function handleStrike() { insertAtCursor('~~', '~~'); }
  function handleBullet() { insertAtCursor('\n- ', ''); }

  return (
    <Box sx={{ display: 'flex', height: '100%', minHeight: 0, background: '#f7f8fa', borderRadius: 2, overflow: 'hidden', boxShadow: 1, width: '100%', maxWidth: '100vw' }}>
      {/* Left: Ticket List */}
      <Box sx={{ width: 340, minWidth: 0, maxWidth: 340, borderRight: '1px solid #e0e0e0', background: '#fff', display: 'flex', flexDirection: 'column', overflowX: 'hidden', overflowY: 'auto' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography level="h4">Tickets</Typography>
            <Button size="sm" onClick={() => setCreateOpen(true)} variant="solid">New</Button>
          </Box>
          <Input
            placeholder="Search tickets..."
            startDecorator={<SearchRoundedIcon />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: '100%' }}
          />
        </Box>
        <List sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', p: 0, minWidth: 0 }}>
          {filtered.map(ticket => (
            <ListItem key={ticket.id} sx={{ p: 0 }}>
              <ListItemButton selected={selectedId === ticket.id} onClick={() => setSelectedId(ticket.id)} sx={{ alignItems: 'center', py: 2, px: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 48, mr: 2 }}>
                  <Avatar size="sm" src={''} />
                </Box>
                <ListItemContent sx={{ minWidth: 0 }}>
                  <Typography level="title-sm" noWrap>{ticket.subject}</Typography>
                  <Typography level="body-xs" color="neutral" noWrap>{ticket.status}</Typography>
                </ListItemContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 80 }}>
                  <Chip size="sm" color={ticket.status === 'Open' ? 'primary' : ticket.status === 'Pending' ? 'warning' : 'neutral'} variant="soft" sx={{ mb: 0.5 }}>
                    {ticket.status}
                  </Chip>
                  <Typography level="body-xs" color="neutral">{ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : ''}</Typography>
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
          {filtered.length === 0 && (
            <ListItem>
              <Typography color="neutral">No tickets found.</Typography>
            </ListItem>
          )}
        </List>
        <TicketForm open={createOpen} onClose={() => setCreateOpen(false)} onCreated={refresh} />
      </Box>
      {/* Right: Ticket Conversation */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f7f8fa', minWidth: 0, overflowX: 'hidden' }}>
        {selectedTicket && (
          <>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'background.body',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar size="lg" src={''} />
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography level="title-md" sx={{ fontWeight: 'lg' }}>{selectedTicket.requester_name || 'User'}</Typography>
                    <Chip
                      variant="outlined"
                      size="sm"
                      color="neutral"
                      sx={{ borderRadius: 'sm', fontSize: 'xs', px: 0.75 }}
                      startDecorator={<Box component="span" sx={{ width: 8, height: 8, bgcolor: 'success.500', borderRadius: '50%', display: 'inline-block' }} />}
                    >
                      Online
                    </Chip>
                  </Box>
                  <Typography level="body-xs" color="neutral">@{selectedTicket.requester_name || 'user'}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<PhoneInTalkRoundedIcon />}
                  component="a"
                  href={selectedTicket.requester_name ? `tel:${selectedTicket.requester_name}` : undefined}
                  target="_self"
                  rel="noopener"
                  disabled={!selectedTicket.requester_name}
                >
                  Call
                </Button>
                <Button size="sm" variant="outlined" color="neutral">
                  View profile
                </Button>
                <Button
                  size="sm"
                  variant="solid"
                  color="primary"
                  onClick={() => {
                    // Do nothing for now
                  }}
                >
                  Resolve
                </Button>
              </Box>
            </Box>
            <Box sx={{ flex: 1, overflow: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f7f8fa' }}>
              {activities.map((act, idx) => {
                const isOutbound = act.direction === 'outbound';
                return (
                  <Box key={act.id || idx} sx={{ display: 'flex', flexDirection: isOutbound ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: 1.5 }}>
                    {!isOutbound && (
                      <Avatar size="sm" src={''} sx={{ mb: 'auto' }} />
                    )}
                    <Box sx={{ maxWidth: '60%', minWidth: 'auto', display: 'flex', flexDirection: 'column', alignItems: isOutbound ? 'flex-end' : 'flex-start' }}>
                      <Sheet
                        variant={isOutbound ? 'solid' : 'soft'}
                        color={isOutbound ? 'primary' : 'neutral'}
                        sx={{
                          p: 1.25,
                          borderRadius: 'lg',
                          boxShadow: 'sm',
                          mb: 0.5,
                          ...(isOutbound
                            ? {
                                borderTopRightRadius: 0,
                                borderTopLeftRadius: 'lg',
                                backgroundColor: 'var(--joy-palette-primary-solidBg)',
                              }
                            : {
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 'lg',
                                backgroundColor: 'background.body',
                              }),
                        }}
                      >
                        <Typography
                          level="body-sm"
                          sx={{
                            color: isOutbound ? 'var(--joy-palette-common-white)' : 'var(--joy-palette-text-primary)',
                          }}
                        >
                          {act.message}
                        </Typography>
                      </Sheet>
                      <Stack direction="row" spacing={2} sx={{ justifyContent: isOutbound ? 'flex-end' : 'flex-start', mb: 0.25 }}>
                        <Typography level="body-xs">
                          {act.sender_name || (isOutbound ? 'You' : 'User')}
                        </Typography>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                          {act.timestamp ? new Date(act.timestamp).toLocaleString() : ''}
                        </Typography>
                      </Stack>
                    </Box>
                    {isOutbound && (
                      <Avatar size="sm" src={''} sx={{ mb: 'auto' }} />
                    )}
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
              {activities.length === 0 && (
                <Typography color="neutral">No communication yet.</Typography>
              )}
            </Box>
            <Divider sx={{ m: 0 }} />
            <Box
              sx={{
                p: 2,
                background: '#fff',
                borderTop: '1px solid #e0e0e0',
                borderRadius: 0,
                boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Box sx={{ px: 0, pb: 0, background: 'transparent', boxShadow: 'none', borderRadius: 0 }}>
                <FormControl sx={{ m: 0 }}>
                  <Textarea
                    placeholder="Type something here…"
                    aria-label="Message"
                    value={activityMessage}
                    minRows={3}
                    maxRows={10}
                    onChange={e => setActivityMessage(e.target.value)}
                    onKeyDown={event => {
                      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                        handleSendActivity();
                      }
                    }}
                    endDecorator={
                      <Stack
                        direction="row"
                        sx={{
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexGrow: 1,
                          py: 1,
                          pr: 1,
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          background: 'transparent',
                        }}
                      >
                        <Box>
                          <IconButton size="sm" variant="plain" color="neutral" onClick={handleBold}><FormatBoldRoundedIcon /></IconButton>
                          <IconButton size="sm" variant="plain" color="neutral" onClick={handleItalic}><FormatItalicRoundedIcon /></IconButton>
                          <IconButton size="sm" variant="plain" color="neutral" onClick={handleStrike}><StrikethroughSRoundedIcon /></IconButton>
                          <IconButton size="sm" variant="plain" color="neutral" onClick={handleBullet}><FormatListBulletedRoundedIcon /></IconButton>
                        </Box>
                        <Button
                          size="sm"
                          color="primary"
                          sx={{ alignSelf: 'center', borderRadius: 'sm' }}
                          endDecorator={<SendRoundedIcon />}
                          onClick={handleSendActivity}
                          disabled={sending || !activityMessage.trim()}
                        >
                          Send
                        </Button>
                      </Stack>
                    }
                    sx={{
                      '& textarea:first-of-type': {
                        minHeight: 72,
                        background: '#f7f8fa',
                      },
                      background: '#f7f8fa',
                      borderRadius: 'md',
                      boxShadow: 'xs',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                </FormControl>
              </Box>
              {sendError && <Typography color="danger" sx={{ px: 3, pb: 1 }}>{sendError}</Typography>}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
