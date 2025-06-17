import React from 'react';
import Dialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import Button from '@mui/joy/Button';

interface TicketResFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (resolution: string, comment: string) => void;
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

const TicketResForm: React.FC<TicketResFormProps> = ({ open, onClose, onSubmit }) => {
  console.debug('TicketResForm rendered, open:', open);

  const [resolution, setResolution] = React.useState('');
  const [resolutionComment, setResolutionComment] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setResolution('');
      setResolutionComment('');
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose}>
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
            onSubmit(resolution, resolutionComment);
            onClose();
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketResForm;
