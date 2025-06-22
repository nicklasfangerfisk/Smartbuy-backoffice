import * as React from 'react';
import { supabase } from '../../utils/supabaseClient';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';

interface SupplierFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: (newSupplierId?: number) => void;
  mode?: 'add' | 'edit';
  supplier?: any; // for edit mode
}

export default function SupplierForm({ open, onClose, onSaved, mode = 'add', supplier }: SupplierFormProps) {
  const [name, setName] = React.useState(supplier?.name || '');
  const [contactName, setContactName] = React.useState(supplier?.contact_name || '');
  const [email, setEmail] = React.useState(supplier?.email || '');
  const [phone, setPhone] = React.useState(supplier?.phone || '');
  const [address, setAddress] = React.useState(supplier?.address || '');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open && mode === 'edit' && supplier) {
      setName(supplier.name || '');
      setContactName(supplier.contact_name || '');
      setEmail(supplier.email || '');
      setPhone(supplier.phone || '');
      setAddress(supplier.address || '');
    } else if (open && mode === 'add') {
      setName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setAddress('');
    }
  }, [open, mode, supplier]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const payload: any = {
      name,
      contact_name: contactName,
      email,
      phone,
      address,
    };
    let result;
    if (mode === 'add') {
      result = await supabase.from('Suppliers').insert([payload]).select();
      setSaving(false);
      if (result.error) {
        setError(result.error.message);
      } else {
        // Pass the new supplier's id to the parent
        onSaved(result.data?.[0]?.id);
      }
      return;
    } else {
      result = await supabase.from('Suppliers').update(payload).eq('id', supplier.id);
    }
    setSaving(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      onSaved();
      // Do not call onClose() here; let parent handle closing the modal
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ minWidth: 400 }}>
        <ModalClose />
        <Typography level="title-md" sx={{ mb: 2 }}>{mode === 'edit' ? 'Edit' : 'Add'} Supplier</Typography>
        <form onSubmit={e => { e.preventDefault(); e.stopPropagation(); handleSave(); }}>
          <Input
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            sx={{ mb: 2 }}
            required
          />
          <Input
            placeholder="Contact Name"
            value={contactName}
            onChange={e => setContactName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
            type="email"
          />
          <Input
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            sx={{ mb: 2 }}
            type="tel"
          />
          <Input
            placeholder="Address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            sx={{ mb: 2 }}
          />
          {error && <Typography color="danger" sx={{ mb: 1 }}>{error}</Typography>}
          <Button type="submit" loading={saving} disabled={saving} variant="solid">
            Save
          </Button>
        </form>
      </ModalDialog>
    </Modal>
  );
}
