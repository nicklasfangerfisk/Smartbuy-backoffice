import React from 'react';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import { useResponsiveModal } from '../hooks/useResponsive';

interface ResponsiveModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  showCloseButton?: boolean;
  actions?: React.ReactNode;
}

/**
 * Responsive modal component that adapts to mobile and desktop viewports
 */
export function ResponsiveModal({
  open,
  onClose,
  children,
  title,
  size = 'medium',
  showCloseButton = true,
  actions
}: ResponsiveModalProps) {
  const { getModalSize } = useResponsiveModal();
  
  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={getModalSize(size)}>
        {showCloseButton && <ModalClose />}
        {title && <DialogTitle>{title}</DialogTitle>}
        <DialogContent>
          {children}
        </DialogContent>
        {actions && (
          <DialogActions>
            {actions}
          </DialogActions>
        )}
      </ModalDialog>
    </Modal>
  );
}

export default ResponsiveModal;
