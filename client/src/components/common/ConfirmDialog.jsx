import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button
} from '@mui/material';
import { WarningAmber } from '@mui/icons-material';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmText = 'Delete', danger = true }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {danger && <WarningAmber color="error" />}
      {title || 'Confirm Action'}
    </DialogTitle>
    <DialogContent>
      <DialogContentText>{message || 'Are you sure?'}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onCancel} variant="outlined">No</Button>
      <Button onClick={onConfirm} variant="contained" color={danger ? 'error' : 'primary'}>
        Yes
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
