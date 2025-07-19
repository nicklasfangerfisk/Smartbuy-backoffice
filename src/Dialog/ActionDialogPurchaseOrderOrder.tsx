/**
 * ActionDialogPurchaseOrderOrder - Dialog for submitting purchase orders to suppliers via email
 * 
 * This dialog displays supplier contact information and provides options for sending
 * purchase orders via email with additional CC recipients.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { formatCurrencyWithSymbol } from '../utils/currencyUtils';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Checkbox from '@mui/joy/Checkbox';
import Divider from '@mui/joy/Divider';
import Alert from '@mui/joy/Alert';
import Card from '@mui/joy/Card';
import Stack from '@mui/joy/Stack';

// Icons
import WarningIcon from '@mui/icons-material/Warning';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';

// Types
interface Supplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  order_date: string;
  total: number;
}

interface ActionDialogPurchaseOrderOrderProps {
  open: boolean;
  onClose: () => void;
  order: PurchaseOrder | null;
  onConfirm: () => void;
}

export default function ActionDialogPurchaseOrderOrder({
  open,
  onClose,
  order,
  onConfirm
}: ActionDialogPurchaseOrderOrderProps) {
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [ccMe, setCcMe] = useState(false);
  const [additionalCc, setAdditionalCc] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Fetch current user email and supplier data when dialog opens
  useEffect(() => {
    if (open && order?.supplier_id) {
      fetchSupplierAndUserData();
    }
  }, [open, order]);

  const fetchSupplierAndUserData = async () => {
    if (!order?.supplier_id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch supplier details
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', order.supplier_id)
        .single();

      if (supplierError) throw supplierError;
      setSupplier(supplierData);

      // Fetch current user email
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch supplier information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!order || !supplier) return;
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Update purchase order status to 'Ordered'
      const { error: updateError } = await supabase
        .from('purchaseorders')
        .update({ status: 'Ordered' })
        .eq('id', order.id);

      if (updateError) throw updateError;

      // Here you would typically send an email to the supplier
      // For now, we'll just log the email details that would be sent
      console.log('Purchase order would be emailed to:', {
        to: supplier.email,
        cc: buildCcList(),
        subject: `Purchase Order ${order.order_number}`,
        orderDetails: order
      });

      // Call the onConfirm callback to refresh the parent component
      onConfirm();
      onClose();
    } catch (err: any) {
      console.error('Error submitting order:', err);
      setError(err.message || 'Failed to submit purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const buildCcList = () => {
    const ccList = [];
    if (ccMe && userEmail) {
      ccList.push(userEmail);
    }
    if (additionalCc.trim()) {
      // Split by comma and clean up emails
      const additionalEmails = additionalCc
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);
      ccList.push(...additionalEmails);
    }
    return ccList;
  };

  const handleClose = () => {
    // Reset form state
    setCcMe(false);
    setAdditionalCc('');
    setSupplier(null);
    setError(null);
    onClose();
  };

  if (!order) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog 
        size="md"
        sx={{
          maxWidth: 600,
          width: '100%'
        }}
      >
        <ModalClose />
        <Typography level="h3" sx={{ mb: 2 }}>
          Submit Purchase Order
        </Typography>

        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography>Loading supplier information...</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Warning Alert */}
            <Alert
              startDecorator={<WarningIcon />}
              variant="soft"
              color="warning"
            >
              <Typography level="title-sm">
                Email Submission
              </Typography>
              <Typography level="body-sm">
                This will submit the purchase order via email to the supplier. 
                Make sure all order details are correct before proceeding.
              </Typography>
            </Alert>

            {/* Supplier Information */}
            {supplier && (
              <Card variant="soft">
                <Typography level="title-md" sx={{ mb: 2 }}>
                  Supplier Information
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BusinessIcon sx={{ color: 'text.tertiary' }} />
                    <Box>
                      <Typography level="body-sm" color="neutral">Company</Typography>
                      <Typography level="title-sm">{supplier.name}</Typography>
                    </Box>
                  </Box>

                  {supplier.contact_name && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PersonIcon sx={{ color: 'text.tertiary' }} />
                      <Box>
                        <Typography level="body-sm" color="neutral">Contact Person</Typography>
                        <Typography level="title-sm">{supplier.contact_name}</Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon sx={{ color: 'text.tertiary' }} />
                    <Box>
                      <Typography level="body-sm" color="neutral">Email</Typography>
                      <Typography 
                        level="title-sm"
                        color={supplier.email ? undefined : 'danger'}
                      >
                        {supplier.email || 'No email address on file'}
                      </Typography>
                    </Box>
                  </Box>

                  {supplier.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PhoneIcon sx={{ color: 'text.tertiary' }} />
                      <Box>
                        <Typography level="body-sm" color="neutral">Phone</Typography>
                        <Typography level="title-sm">{supplier.phone}</Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Card>
            )}

            <Divider />

            {/* Order Information */}
            <Box>
              <Typography level="title-md" sx={{ mb: 2 }}>
                Order Details
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography level="body-sm" color="neutral">Order Number:</Typography>
                  <Typography level="body-sm">{order.order_number}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography level="body-sm" color="neutral">Order Date:</Typography>
                  <Typography level="body-sm">
                    {new Date(order.order_date).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography level="body-sm" color="neutral">Total:</Typography>
                  <Typography level="body-sm" sx={{ fontWeight: 'bold' }}>
                    {formatCurrencyWithSymbol(order.total)}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Email Options */}
            <Box>
              <Typography level="title-md" sx={{ mb: 2 }}>
                Email Options
              </Typography>
              <Stack spacing={2}>
                {userEmail && (
                  <Checkbox
                    checked={ccMe}
                    onChange={(event) => setCcMe(event.target.checked)}
                    label={`CC me (${userEmail})`}
                  />
                )}

                <FormControl>
                  <FormLabel>Additional CC Recipients</FormLabel>
                  <Input
                    placeholder="email1@example.com, email2@example.com"
                    value={additionalCc}
                    onChange={(e) => setAdditionalCc(e.target.value)}
                    sx={{ width: '100%' }}
                  />
                  <Typography level="body-xs" color="neutral" sx={{ mt: 0.5 }}>
                    Separate multiple email addresses with commas
                  </Typography>
                </FormControl>
              </Stack>
            </Box>

            {/* Error Display */}
            {error && (
              <Alert variant="soft" color="danger">
                <Typography level="body-sm">{error}</Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button 
                variant="plain" 
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                variant="solid"
                color="primary"
                onClick={handleSubmit}
                loading={submitting}
                disabled={submitting || !supplier?.email}
                startDecorator={<EmailIcon />}
              >
                Submit Order
              </Button>
            </Box>
          </Stack>
        )}
      </ModalDialog>
    </Modal>
  );
}
