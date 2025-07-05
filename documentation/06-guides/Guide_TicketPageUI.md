# Guide: Creating the Ticket Page UI

This guide explains how to create a ticket page UI similar to the design shown in the provided image. The layout includes a ticket list on the left and a communication area on the right.

## Prerequisites

- Familiarity with React and Material-UI.
- Installed dependencies for Material-UI Joy.

## Steps to Achieve the Design

### 1. Install Material-UI Joy

Ensure you have Material-UI Joy installed in your project. Run the following command:

```bash
npm install @mui/joy
```

### 2. Create the Layout

The layout consists of two main sections:

- **Ticket List**: Displayed on the left side.
- **Communication Area**: Displayed on the right side.

Use the following code snippet to structure the layout:

```tsx
import { Box, Typography, Button, FormControl, Textarea } from '@mui/joy';
import { useState, useEffect, useRef } from 'react';

export default function TicketPage() {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activityMessage, setActivityMessage] = useState('');
  const messagesEndRef = useRef(null);

  const tickets = [
    { id: 1, subject: 'Ticket 1', requester_name: 'User 1' },
    { id: 2, subject: 'Ticket 2', requester_name: 'User 2' },
  ];

  const activities = [
    { id: 1, message: 'Hello, how can I help you?' },
    { id: 2, message: 'I need assistance with my account.' },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activities]);

  return (
    <Box sx={{ display: 'flex', height: '100vh', background: '#f7f8fa' }}>
      {/* Left: Ticket List */}
      <Box sx={{ width: 340, borderRight: '1px solid #e0e0e0', background: '#fff', p: 2 }}>
        <Typography level="h4">Tickets</Typography>
        {tickets.map(ticket => (
          <Box
            key={ticket.id}
            sx={{ p: 2, cursor: 'pointer', backgroundColor: selectedTicket?.id === ticket.id ? '#f0f0f0' : 'transparent' }}
            onClick={() => setSelectedTicket(ticket)}
          >
            <Typography level="body-md" sx={{ fontWeight: 'bold' }}>{ticket.subject}</Typography>
            <Typography level="body-sm" color="neutral">{ticket.requester_name}</Typography>
          </Box>
        ))}
      </Box>

      {/* Right: Communication Area */}
      <Box sx={{ flex: 1, p: 2 }}>
        {selectedTicket ? (
          <>
            <Typography level="h5" sx={{ fontWeight: 'bold' }}>{selectedTicket.subject}</Typography>
            <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
              {activities.map(activity => (
                <Box key={activity.id} sx={{ mb: 1 }}>
                  <Typography level="body-sm" color="neutral">{activity.message}</Typography>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>
            <FormControl>
              <Textarea
                placeholder="Type something here…"
                value={activityMessage}
                onChange={e => setActivityMessage(e.target.value)}
                sx={{ background: '#f7f8fa', borderRadius: 'md', boxShadow: 'xs', border: '1px solid', borderColor: 'divider' }}
              />
            </FormControl>
          </>
        ) : (
          <Typography level="body-md" color="neutral">Select a ticket to view details</Typography>
        )}
      </Box>
    </Box>
  );
}
```

### 3. Styling

Use Material-UI Joy's `sx` prop to style the components. Adjust colors, spacing, and borders as needed.

### 4. Reference

For more advanced examples and templates, refer to the Material-UI Joy documentation:

[Material-UI Joy Templates](https://github.com/mui/material-ui/tree/master/docs/data/joy/getting-started/templates/messages)

## Notes

- Ensure the `selectedTicket` state is updated when a ticket is clicked.
- Use `messagesEndRef` to scroll the communication area automatically.

This guide provides the basic structure and styling for the ticket page UI. Customize further based on your requirements.
