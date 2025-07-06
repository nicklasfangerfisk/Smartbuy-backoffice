/**
 * PageTickets - Support ticket system with real-time messaging
 * 
 * HOCs: ProtectedRoute (route-level auth guard)
 * Layout: PageLayout (no ResponsiveContainer - custom layout)
 * Responsive: useResponsive() hook for mobile detection
 * Dialogs: DialogTicketCreate, DialogTicketResolve
 * Data: Supabase tickets and ticket_messages tables with real-time
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Database } from '../general/supabase.types';
import Box from '@mui/joy/Box';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';
import Stack from '@mui/joy/Stack';
import Avatar from '@mui/joy/Avatar';
import Chip from '@mui/joy/Chip';
import ListDivider from '@mui/joy/ListDivider';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/joy/IconButton';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import DialogTicketCreate from '../Dialog/DialogTicketCreate';
import DialogTicketResolve from '../Dialog/DialogTicketResolve';
import PageLayout from '../layouts/PageLayout';
import { useResponsive } from '../hooks/useResponsive';
import Divider from '@mui/joy/Divider';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import { ColorPaletteProp } from '@mui/joy/styles';

// Helper function to format relative time
const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
};

const statusColors: Record<string, { color: ColorPaletteProp; label: string }> = {
  Open: { color: 'success', label: 'Open' },
  Pending: { color: 'warning', label: 'Pending' },
  Closed: { color: 'neutral', label: 'Closed' },
};

/**
 * PageTickets component - unified responsive ticket management system.
 * On desktop: Split view with ticket list on left and messaging on right.
 * On mobile: Card-based list view with navigation to detail view.
 */
export default function PageTickets() {
  const { isMobile } = useResponsive();
  const [tickets, setTickets] = useState<Database['public']['Tables']['tickets']['Row'][]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [ticketActivities, setTicketActivities] = useState<Database['public']['Tables']['ticketactivities']['Row'][]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Open');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [showMobileCommunication, setShowMobileCommunication] = useState(false);

  // Fetch tickets from supabase
  useEffect(() => {
    const fetchTickets = async () => {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setTickets(data || []);
    };
    fetchTickets();
  }, []);

  // Fetch ticket activities for selected ticket
  useEffect(() => {
    if (!selectedTicketId) {
      setTicketActivities([]);
      return;
    }
    const fetchActivities = async () => {
      const { data, error } = await supabase
        .from('ticketactivities')
        .select('*')
        .eq('ticket_id', selectedTicketId)
        .order('timestamp', { ascending: true });
      if (!error) setTicketActivities(data || []);
    };
    fetchActivities();
  }, [selectedTicketId]);

  // Refresh tickets from supabase
  const refreshTickets = async () => {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setTickets(data || []);
  };

  const handleSend = async () => {
    if (newMessage.trim() && selectedTicketId) {
      console.log('Sending message:', { 
        ticket_id: selectedTicketId, 
        message: newMessage,
        activity_type: 'chat',
        sender_name: 'You'
      });
      
      const { error, data } = await supabase
        .from('ticketactivities')
        .insert({ 
          ticket_id: selectedTicketId, 
          message: newMessage,
          activity_type: 'chat',
          sender_name: 'You'
        })
        .select();
        
      if (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message: ' + error.message);
        return;
      }
      
      console.log('Message sent successfully:', data);
      setNewMessage('');
      
      // Refresh activities
      const { data: activitiesData, error: fetchError } = await supabase
        .from('ticketactivities')
        .select('*')
        .eq('ticket_id', selectedTicketId)
        .order('timestamp', { ascending: true });
        
      if (fetchError) {
        console.error('Error fetching activities:', fetchError);
      } else {
        console.log('Refreshed activities:', activitiesData);
        setTicketActivities(activitiesData || []);
      }
    }
  };

  const handleResolve = async (resolution: string, comment: string) => {
    if (!selectedTicketId) return;
    
    try {
      // Update ticket status to 'Closed'
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({ status: 'Closed' })
        .eq('id', selectedTicketId);
      
      if (ticketError) {
        console.error('Error updating ticket status:', ticketError);
        alert('Failed to resolve ticket: ' + ticketError.message);
        return;
      }
      
      // Add resolution activity
      const { error: activityError } = await supabase
        .from('ticketactivities')
        .insert({
          ticket_id: selectedTicketId,
          message: `Ticket resolved: ${resolution}${comment ? ` - ${comment}` : ''}`,
          activity_type: 'chat',
          sender_name: 'You'
        });
      
      if (activityError) {
        console.error('Error adding resolution activity:', activityError);
      }
      
      // Refresh both tickets and activities
      await refreshTickets();
      const { data: activitiesData } = await supabase
        .from('ticketactivities')
        .select('*')
        .eq('ticket_id', selectedTicketId)
        .order('timestamp', { ascending: true });
      setTicketActivities(activitiesData || []);
      
    } catch (error) {
      console.error('Error resolving ticket:', error);
      alert('Failed to resolve ticket');
    }
  };

  const handleMobileTicketSelect = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    setShowMobileCommunication(true);
  };

  const handleMobileBackToList = () => {
    setShowMobileCommunication(false);
    setSelectedTicketId(null);
  };

  // Filter tickets based on search query and status
  const filteredTickets = tickets.filter((ticket) => {
    // Status filter
    if (statusFilter !== 'All' && ticket.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.subject?.toLowerCase().includes(query) ||
      ticket.requester_name?.toLowerCase().includes(query) ||
      ticket.status?.toLowerCase().includes(query)
    );
  });

  // Mobile view with card layout
  if (isMobile) {
    // Show beach splash if all tickets are closed and filtering for open
    const allClosedSplash = tickets.length > 0 && tickets.every(t => t.status === 'Closed') && (statusFilter === 'Open');

    // Show communication view when a ticket is selected
    if (showMobileCommunication && selectedTicketId) {
      const selectedTicket = tickets.find(t => t.id === selectedTicketId);
      
      return (
        <PageLayout>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
            {/* Mobile Communication Header */}
            <Box sx={{ 
              px: 2, 
              py: 1.5, 
              borderBottom: '1px solid', 
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'background.surface'
            }}>
              <IconButton
                size="sm"
                variant="plain"
                onClick={handleMobileBackToList}
              >
                <ArrowBackIcon />
              </IconButton>
              <Avatar 
                size="sm" 
                sx={{ 
                  bgcolor: 'primary.100', 
                  color: 'primary.700', 
                  fontWeight: 600 
                }}
              >
                {selectedTicket?.requester_name?.[0]?.toUpperCase() || '?'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography level="title-sm" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedTicket?.subject || 'Untitled'}
                </Typography>
                <Typography level="body-xs" color="neutral">
                  {selectedTicket?.requester_name}
                </Typography>
              </Box>
              <Chip
                variant="soft"
                size="sm"
                color={statusColors[selectedTicket?.status || 'Open']?.color}
                sx={{ fontWeight: 600 }}
              >
                {statusColors[selectedTicket?.status || 'Open']?.label}
              </Chip>
              {selectedTicket?.status !== 'Closed' && (
                <Button 
                  variant="solid" 
                  color="primary" 
                  size="sm" 
                  onClick={() => setIsResolveDialogOpen(true)}
                >
                  Resolve
                </Button>
              )}
            </Box>

            {/* Mobile Messages Area */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
              <Stack spacing={3}>
                {ticketActivities.map((activity, index) => {
                  const isCurrentUser = activity.sender_name === 'You';
                  return (
                    <Box key={activity.id}>
                      {/* Show date separator if this is a new day */}
                      {index === 0 || new Date(activity.timestamp || '').toDateString() !== new Date(ticketActivities[index - 1]?.timestamp || '').toDateString() ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                          <Typography level="body-xs" sx={{ mx: 2, color: 'text.secondary' }}>
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long', 
                              day: 'numeric'
                            }) : ''}
                          </Typography>
                          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                        </Box>
                      ) : null}
                      
                      {/* Message bubble */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                        {!isCurrentUser && (
                          <Avatar size="sm" sx={{ bgcolor: 'primary.100', color: 'primary.700', fontWeight: 600 }}>
                            {activity.sender_name?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                        )}
                        <Box sx={{ 
                          flex: 1,
                          display: 'flex',
                          flexDirection: isCurrentUser ? 'row-reverse' : 'row'
                        }}>
                          <Box sx={{ 
                            maxWidth: '85%',
                            bgcolor: isCurrentUser ? 'primary.500' : 'neutral.50',
                            color: isCurrentUser ? 'white' : 'text.primary',
                            borderRadius: isCurrentUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            px: 2,
                            py: 1.5,
                            position: 'relative',
                            boxShadow: 'sm'
                          }}>
                            {!isCurrentUser && (
                              <Typography level="body-xs" sx={{ 
                                fontWeight: 600, 
                                mb: 0.5,
                                color: isCurrentUser ? 'white' : 'text.primary'
                              }}>
                                {activity.sender_name}
                              </Typography>
                            )}
                            <Typography level="body-sm" sx={{ 
                              lineHeight: 1.4,
                              color: isCurrentUser ? 'white' : 'text.primary'
                            }}>
                              {activity.message}
                            </Typography>
                          </Box>
                        </Box>
                        {isCurrentUser && (
                          <Avatar size="sm" sx={{ bgcolor: 'primary.100', color: 'primary.700', fontWeight: 600 }}>
                            {activity.sender_name?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                        )}
                      </Stack>
                      
                      {/* Timestamp */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        mt: 0.5,
                        ml: isCurrentUser ? 0 : 5
                      }}>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString('en-US', { 
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : ''}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            {/* Mobile Message Input */}
            <Box sx={{ 
              px: 2, 
              py: 1.5, 
              borderTop: '1px solid', 
              borderColor: 'divider',
              bgcolor: 'background.surface'
            }}>
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <Box sx={{ flex: 1 }}>
                  <Textarea
                    placeholder="Type something here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    minRows={1}
                    maxRows={3}
                    sx={{ 
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: 'neutral.300',
                      '&:focus-within': {
                        borderColor: 'primary.500'
                      },
                      '& textarea': {
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        px: 2,
                        py: 1
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                </Box>
                <Button 
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  variant="solid"
                  color="primary"
                  size="sm"
                  sx={{ 
                    borderRadius: '20px',
                    minWidth: 50,
                    height: 36,
                    fontWeight: 600
                  }}
                >
                  Send
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Dialogs */}
          <DialogTicketCreate
            open={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onCreated={refreshTickets}
          />
          
          <DialogTicketResolve
            open={isResolveDialogOpen}
            onClose={() => setIsResolveDialogOpen(false)}
            onSubmit={handleResolve}
          />
        </PageLayout>
      );
    }

    // Show ticket list view
    return (
      <PageLayout>
        <Box sx={{ p: 2 }}>
          {/* Page Title */}
          <Typography level="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Tickets
          </Typography>
          {/* Search and Filter Controls */}
          <Stack spacing={2} sx={{ mb: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Input
                placeholder="Search tickets..."
                startDecorator={<SearchIcon />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="sm"
                sx={{ flex: 1 }}
              />
              <IconButton 
                size="sm" 
                variant="soft" 
                color="primary"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <AddIcon />
              </IconButton>
            </Stack>
            <Select
              value={statusFilter}
              onChange={(_, newValue) => setStatusFilter(newValue as string)}
              size="sm"
              placeholder="Filter by status"
            >
              <Option value="All">All Tickets</Option>
              <Option value="Open">Open</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Closed">Closed</Option>
            </Select>
          </Stack>

          {allClosedSplash ? (
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '60vh',
              gap: 2,
            }}>
              <BeachAccessIcon sx={{ fontSize: 80, color: 'primary.500' }} />
              <Typography level="h3" sx={{ fontWeight: 700, textAlign: 'center' }}>
                All done, you can now go to the beach
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filteredTickets.map((ticket, idx) => (
                <React.Fragment key={ticket.id}>
                  <Box
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      cursor: 'pointer',
                      background: 'transparent',
                      borderRadius: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: 'neutral.50'
                      }
                    }}
                    onClick={() => handleMobileTicketSelect(ticket.id)}
                  >
                    <Avatar 
                      size="sm" 
                      sx={{ 
                        bgcolor: 'primary.100', 
                        color: 'primary.700', 
                        fontWeight: 600,
                        mt: 0.5 
                      }}
                    >
                      {ticket.requester_name?.[0]?.toUpperCase() || '?'}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography level="title-sm" sx={{ fontWeight: 600, mb: 0.5, wordBreak: 'break-word' }}>
                        {ticket.subject || 'Untitled'}
                      </Typography>
                      <Typography level="body-xs" color="neutral" sx={{ mb: 0.5, wordBreak: 'break-word' }}>
                        {ticket.requester_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography level="body-xs" color="neutral">
                          {formatRelativeTime(ticket.updated_at)}
                        </Typography>
                        <Typography level="body-xs" color="neutral">&bull;</Typography>
                        <Typography level="body-xs" color="neutral" sx={{ wordBreak: 'break-all' }}>
                          {ticket.id?.slice(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      variant="soft"
                      size="sm"
                      color={statusColors[ticket.status || 'Open']?.color}
                      sx={{ fontWeight: 600, px: 1.5, py: 0.5, ml: 1 }}
                    >
                      {statusColors[ticket.status || 'Open']?.label}
                    </Chip>
                  </Box>
                  {idx < filteredTickets.length - 1 && <Divider sx={{ my: 0.5 }} />}
                </React.Fragment>
              ))}
              {filteredTickets.length === 0 && (
                <Typography color="neutral" sx={{ textAlign: 'center', mt: 4 }}>
                  No tickets found.
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Dialogs */}
        <DialogTicketCreate
          open={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onCreated={refreshTickets}
        />
        
        <DialogTicketResolve
          open={isResolveDialogOpen}
          onClose={() => setIsResolveDialogOpen(false)}
          onSubmit={handleResolve}
        />
      </PageLayout>
    );
  }

  // Desktop view with split layout
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Ticket List */}
        <Box sx={{ 
          width: 390, 
          borderRight: '1px solid', 
          borderColor: 'divider', 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden' 
        }}>
          {/* Header with title, count, and create button */}
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography level="title-lg">Messages</Typography>
                <Chip size="sm" variant="soft" color="neutral">
                  {filteredTickets.length}
                </Chip>
              </Stack>
              <IconButton 
                size="sm" 
                variant="soft" 
                color="primary"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <AddIcon />
              </IconButton>
            </Stack>
            {/* Search box */}
            <Input
              placeholder="Search"
              startDecorator={<SearchIcon />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
              sx={{ width: '100%', mb: 1 }}
            />
            {/* Status filter */}
            <Select
              value={statusFilter}
              onChange={(_, newValue) => setStatusFilter(newValue as string)}
              size="sm"
              sx={{ width: '100%' }}
              placeholder="Filter by status"
            >
              <Option value="All">All Tickets</Option>
              <Option value="Open">Open</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Closed">Closed</Option>
            </Select>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', pt: 1 }}>
            <List size="sm" sx={{ gap: 0 }}>
            {filteredTickets.map((ticket) => (
              <React.Fragment key={ticket.id}>
                <ListItem sx={{ p: 0 }}>
                  <ListItemButton
                    selected={selectedTicketId === ticket.id}
                    onClick={() => setSelectedTicketId(ticket.id)}
                    sx={{ py: 1, px: 2 }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: '100%' }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar size="sm" sx={{ bgcolor: 'primary.100', color: 'primary.700', fontWeight: 600 }}>
                          {ticket.requester_name?.[0]?.toUpperCase() || '?'}
                        </Avatar>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 0.5 }}>
                          <Typography level="body-md" noWrap sx={{ flex: 1, pr: 1 }}>
                            {ticket.subject || 'Untitled'}
                          </Typography>
                          {ticket.status && (
                            <Chip size="sm" color={statusColors[ticket.status]?.color} variant="soft" sx={{ flexShrink: 0 }}>
                              {ticket.status}
                            </Chip>
                          )}
                        </Stack>
                        <Typography
                          level="body-sm"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            mb: 0.5,
                          }}
                        >
                          {ticket.requester_name || ''}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                            {formatRelativeTime(ticket.updated_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </ListItemButton>
                </ListItem>
                <ListDivider component="li" sx={{ margin: 0 }} />
              </React.Fragment>
            ))}
            </List>
          </Box>
        </Box>

        {/* Communication Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          {selectedTicketId && (
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar size="sm" sx={{ bgcolor: 'primary.100', color: 'primary.700', fontWeight: 600 }}>
                  {tickets.find(t => t.id === selectedTicketId)?.requester_name?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography level="title-sm" sx={{ fontWeight: 600 }}>
                    {tickets.find(t => t.id === selectedTicketId)?.requester_name || 'Unknown User'}
                  </Typography>
                  <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                    {tickets.find(t => t.id === selectedTicketId)?.status || 'Unknown Status'}
                  </Typography>
                </Box>
                <Button variant="outlined" size="sm" sx={{ borderRadius: '16px' }}>
                  View profile
                </Button>
                {tickets.find(t => t.id === selectedTicketId)?.status !== 'Closed' && (
                  <Button 
                    variant="solid" 
                    color="primary" 
                    size="sm" 
                    sx={{ borderRadius: '16px' }}
                    onClick={() => setIsResolveDialogOpen(true)}
                  >
                    Resolve
                  </Button>
                )}
              </Stack>
            </Box>
          )}
          
          {/* Messages Area */}
          <Box sx={{ flex: 1, overflowY: 'auto', px: 3, py: 2 }}>
            {!selectedTicketId ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography level="body-md" sx={{ color: 'text.secondary' }}>
                  Select a ticket to view messages
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {ticketActivities.map((activity, index) => {
                  const isCurrentUser = activity.sender_name === 'You';
                  return (
                    <Box key={activity.id}>
                      {/* Show date separator if this is a new day */}
                      {index === 0 || new Date(activity.timestamp || '').toDateString() !== new Date(ticketActivities[index - 1]?.timestamp || '').toDateString() ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                          <Typography level="body-xs" sx={{ mx: 2, color: 'text.secondary' }}>
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'long', 
                              day: 'numeric'
                            }) : ''}
                          </Typography>
                          <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                        </Box>
                      ) : null}
                      
                      {/* Message bubble */}
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                        {!isCurrentUser && (
                          <Avatar size="sm" sx={{ bgcolor: 'primary.100', color: 'primary.700', fontWeight: 600 }}>
                            {activity.sender_name?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                        )}
                        <Box sx={{ 
                          flex: 1,
                          display: 'flex',
                          flexDirection: isCurrentUser ? 'row-reverse' : 'row'
                        }}>
                          <Box sx={{ 
                            maxWidth: '70%',
                            bgcolor: isCurrentUser ? 'primary.500' : 'neutral.50',
                            color: isCurrentUser ? 'white' : 'text.primary',
                            borderRadius: isCurrentUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            px: 2,
                            py: 1.5,
                            position: 'relative',
                            boxShadow: 'sm'
                          }}>
                            {!isCurrentUser && (
                              <Typography level="body-xs" sx={{ 
                                fontWeight: 600, 
                                mb: 0.5,
                                color: isCurrentUser ? 'white' : 'text.primary'
                              }}>
                                {activity.sender_name}
                              </Typography>
                            )}
                            <Typography level="body-sm" sx={{ 
                              lineHeight: 1.4,
                              color: isCurrentUser ? 'white' : 'text.primary'
                            }}>
                              {activity.message}
                            </Typography>
                          </Box>
                        </Box>
                        {isCurrentUser && (
                          <Avatar size="sm" sx={{ bgcolor: 'primary.100', color: 'primary.700', fontWeight: 600 }}>
                            {activity.sender_name?.[0]?.toUpperCase() || '?'}
                          </Avatar>
                        )}
                      </Stack>
                      
                      {/* Timestamp */}
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                        mt: 0.5,
                        ml: isCurrentUser ? 0 : 5
                      }}>
                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString('en-US', { 
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : ''}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
          
          {/* Message Input */}
          {selectedTicketId && (
            <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <Box sx={{ flex: 1 }}>
                  <Textarea
                    placeholder="Type something here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    minRows={1}
                    maxRows={4}
                    sx={{ 
                      borderRadius: '20px',
                      border: '1px solid',
                      borderColor: 'neutral.300',
                      '&:focus-within': {
                        borderColor: 'primary.500'
                      },
                      '& textarea': {
                        border: 'none',
                        outline: 'none',
                        resize: 'none',
                        px: 2,
                        py: 1
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                </Box>
                <Button 
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  variant="solid"
                  color="primary"
                  sx={{ 
                    borderRadius: '20px',
                    minWidth: 60,
                    height: 40,
                    fontWeight: 600
                  }}
                >
                  Send
                </Button>
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Dialogs */}
      <DialogTicketCreate
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreated={refreshTickets}
      />
      
      <DialogTicketResolve
        open={isResolveDialogOpen}
        onClose={() => setIsResolveDialogOpen(false)}
        onSubmit={handleResolve}
      />
    </Box>
  );
}
