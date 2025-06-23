import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';

// Props interface
interface TicketResFormProps {
  open: boolean; // Whether the modal is open
  onClose: () => void; // Function to close the modal
  onSubmit: (resolution: string, comment: string) => void; // Callback function to handle form submission
}

const resolutionOptions = [
  'Refund issued',
  'Replacement sent',
  'Order cancelled',
  'Technical support provided',
  'Information provided',
  'Awaiting customer response',
  'Other',
];

/**
 * TicketResForm Component
 *
 * A modal form for resolving tickets.
 *
 * Props:
 * - open: Whether the modal is open.
 * - onClose: Function to close the modal.
 * - onSubmit: Callback function to handle form submission with resolution and comment.
 */
const TicketResForm: React.FC<TicketResFormProps> = ({ open, onClose, onSubmit }) => {
  const [resolution, setResolution] = React.useState('');
  const [resolutionComment, setResolutionComment] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setResolution('');
      setResolutionComment('');
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <DialogTitle>Resolve Ticket</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
          <Select
            value={resolution}
            onChange={(_, value) => setResolution(value || '')}
            placeholder="Select resolution"
            required
          >
            {resolutionOptions.map(opt => (
              <Option key={opt} value={opt}>{opt}</Option>
            ))}
          </Select>
          <Textarea
            minRows={3}
            placeholder="Resolution comment to customer..."
            value={resolutionComment}
            onChange={e => setResolutionComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="plain" onClick={onClose}>Cancel</Button>
          <Button
            variant="solid"
            color="primary"
            disabled={!resolution}
            onClick={() => {
              try {
                onSubmit(resolution, resolutionComment);
                onClose();
              } catch (error) {
                console.error('Error during form submission:', error);
              }
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
};

export default TicketResForm;
