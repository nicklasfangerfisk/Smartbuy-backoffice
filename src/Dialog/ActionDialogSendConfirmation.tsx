import * as React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Typography from '@mui/joy/Typography';
import Alert from '@mui/joy/Alert';
import CircularProgress from '@mui/joy/CircularProgress';
import Divider from '@mui/joy/Divider';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export interface ActionDialogSendConfirmationProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  customerEmail: string;
  orderNumber: string;
  customerName?: string;
}

/**
 * ActionDialogSendConfirmation Component
 * 
 * A confirmation dialog that warns the user before sending an order confirmation email.
 * Shows customer email and order details, and handles the sending process with loading states.
 */
export default function ActionDialogSendConfirmation({
  open,
  onClose,
  onConfirm,
  customerEmail,
  orderNumber,
  customerName
}: ActionDialogSendConfirmationProps) {
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<{ success: boolean; message: string } | null>(null);

  // Reset state when dialog opens
  React.useEffect(() => {
    if (open) {
      setSending(false);
      setResult(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    setSending(true);
    setResult(null);

    try {
      await onConfirm();
      setResult({
        success: true,
        message: 'Order confirmation email sent successfully!'
      });
      
      // Auto-close after successful send
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error sending confirmation email:', error);
      setResult({
        success: false,
        message: error.message || 'Failed to send order confirmation email. Please try again.'
      });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (!sending) {
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        size="md"
        sx={{
          maxWidth: 500,
          borderRadius: 'md',
          p: 3,
          boxShadow: 'lg'
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon color="primary" />
            Send Order Confirmation
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ gap: 2 }}>
          {!result && (
            <>
              <Alert 
                color="warning" 
                variant="soft"
                startDecorator={<WarningIcon />}
                sx={{ mb: 2 }}
              >
                <Typography level="title-sm">
                  Confirm Email Sending
                </Typography>
                <Typography level="body-sm">
                  This action will send an order confirmation email to the customer. 
                  Please verify the email address is correct.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography level="title-sm" color="neutral">
                  Order Details:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography level="body-sm">
                    <strong>Order Number:</strong> {orderNumber}
                  </Typography>
                  {customerName && (
                    <Typography level="body-sm">
                      <strong>Customer:</strong> {customerName}
                    </Typography>
                  )}
                  <Typography level="body-sm">
                    <strong>Email Address:</strong> {customerEmail}
                  </Typography>
                </Box>
              </Box>

              <Alert 
                color="primary" 
                variant="soft"
                sx={{ mt: 2 }}
              >
                <Typography level="body-sm">
                  <strong>Note:</strong> After sending the confirmation email, the order status 
                  will automatically change from "Paid" to "Confirmed".
                </Typography>
              </Alert>
            </>
          )}

          {result && (
            <Alert 
              color={result.success ? "success" : "danger"}
              variant="soft"
              startDecorator={result.success ? <CheckCircleIcon /> : <ErrorIcon />}
            >
              <Typography level="title-sm">
                {result.success ? 'Email Sent Successfully!' : 'Email Sending Failed'}
              </Typography>
              <Typography level="body-sm">
                {result.message}
              </Typography>
            </Alert>
          )}

          {sending && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', py: 2 }}>
              <CircularProgress size="sm" />
              <Typography level="body-sm" color="neutral">
                Sending order confirmation email...
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="neutral"
            onClick={handleClose}
            disabled={sending}
          >
            {result?.success ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button
              variant="solid"
              color="primary"
              onClick={handleConfirm}
              disabled={sending}
              startDecorator={sending ? <CircularProgress size="sm" /> : <EmailIcon />}
            >
              {sending ? 'Sending...' : 'Send Confirmation Email'}
            </Button>
          )}
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
