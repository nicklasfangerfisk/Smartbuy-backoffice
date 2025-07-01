import * as React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import { supabase } from '../../utils/supabaseClient';

// Props interface
interface TicketFormProps {
  open: boolean; // Whether the modal is open
  onClose: () => void; // Function to close the modal
  onCreated?: () => void; // Callback function after a ticket is successfully created
}

/**
 * TicketForm Component
 * 
 * A modal form for creating new tickets.
 * 
 * Props:
 * - open: Whether the modal is open.
 * - onClose: Function to close the modal.
 * - onCreated: Optional callback function after a ticket is successfully created.
 */
export default function TicketForm({ open, onClose, onCreated }: TicketFormProps) {
  const [newSubject, setNewSubject] = React.useState('');
  const [newRequester, setNewRequester] = React.useState('');
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    const payload = { subject: newSubject, requester_name: newRequester, status: 'Open' };
    console.log('[TicketForm] Creating ticket with payload:', payload);
    const { error, data } = await supabase.from('tickets').insert(payload);
    if (error) {
      setError(error.message || JSON.stringify(error));
      console.error('[TicketForm] Error creating ticket:', error);
    }
    setCreating(false);
    if (!error) {
      setNewSubject('');
      setNewRequester('');
      onClose();
      if (onCreated) onCreated();
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 400 }}>
        <Typography level="title-md" sx={{ mb: 2 }}>Create Ticket</Typography>
        <form onSubmit={handleCreateTicket}>
          <Input
            placeholder="Subject"
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <Input
            placeholder="Requester Name"
            value={newRequester}
            onChange={e => setNewRequester(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          {error && <Typography color="danger" sx={{ mb: 1 }}>{error}</Typography>}
          <Button
            type="submit"
            loading={creating}
            disabled={creating || !newSubject || !newRequester}
            variant="solid"
          >
            Create
          </Button>
        </form>
      </ModalDialog>
    </Modal>
  );
}
