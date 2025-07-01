import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
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
import CircleIcon from '@mui/icons-material/Circle';

/**
 * TicketPage component is the main entry point for the ticketing system.
 * It sets up the layout with a ticket list on the left and a communication area on the right.
 *
 * @returns {JSX.Element} The rendered TicketPage component.
 */
export default function TicketPage() {
  const [messages, setMessages] = React.useState([
    { id: 1, content: 'Hello, how can I help you?' },
    { id: 2, content: 'I have an issue with my order.' },
  ]);
  const [newMessage, setNewMessage] = React.useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, content: newMessage }]);
      setNewMessage('');
    }
  };

  // Sample data following the Joy UI template types
  const chats = [
    {
      id: '1',
      name: 'Steve E.',
      username: '@steveEberger',
      avatar: 'https://via.placeholder.com/40',
      online: true,
      lastMessage: 'Hi Olivia, I am currently working on the project.',
      timestamp: '5 mins ago',
      unread: 0,
    },
    {
      id: '2',
      name: 'Katherine Moss',
      username: '@kathy',
      avatar: 'https://via.placeholder.com/40',
      online: false,
      lastMessage: 'Hi Olivia, I am thinking about taking a vacation.',
      timestamp: '5 mins ago',
      unread: 0,
    },
    {
      id: '3',
      name: 'Phoenix Baker',
      username: '@phoenix',
      avatar: 'https://via.placeholder.com/40',
      online: true,
      lastMessage: 'Hey!',
      timestamp: '5 mins ago',
      unread: 1,
    },
  ];

  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
        <Box sx={{ display: 'flex', flex: 1 }}>
          {/* Ticket List */}
          <Box sx={{ width: 300, borderRight: '1px solid', borderColor: 'divider', overflowY: 'auto' }}>
            <Box sx={{ fontWeight: 'lg', fontSize: 'lg', px: 2, py: 1 }}>Messages</Box>
            <List size="sm" sx={{ gap: 1 }}>
              {chats.map((chat) => (
                <React.Fragment key={chat.id}>
                  <ListItem>
                    <ListItemButton>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ position: 'relative' }}>
                          <Avatar src={chat.avatar} />
                          {chat.online && (
                            <CircleIcon
                              color="success"
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                fontSize: 12,
                              }}
                            />
                          )}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography level="body-md" noWrap>
                              {chat.name}
                            </Typography>
                            <Typography level="body-xs" noWrap sx={{ display: { xs: 'none', md: 'block' } }}>
                              {chat.timestamp}
                            </Typography>
                          </Stack>
                          <Typography
                            level="body-sm"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {chat.lastMessage}
                          </Typography>
                        </Box>
                        {chat.unread > 0 && <Chip size="sm" color="primary">{chat.unread}</Chip>}
                      </Stack>
                    </ListItemButton>
                  </ListItem>
                  <ListDivider component="li" sx={{ margin: 0 }} />
                </React.Fragment>
              ))}
            </List>
          </Box>

          {/* Communication Area */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ fontWeight: 'bold', fontSize: '1.25rem', mb: 2 }}>
              Messages
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
              {messages.map((message) => (
                <Box key={message.id} sx={{ mb: 1 }}>
                  {message.content}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{ flex: 1, mr: 2 }}
              />
              <Button onClick={handleSend}>Send</Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </CssVarsProvider>
  );
}
