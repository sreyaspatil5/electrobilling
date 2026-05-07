import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Chip, Typography, InputAdornment,
  Grid, Avatar, Tooltip
} from '@mui/material';
import { Add, Edit, Delete, Search, PersonOutline } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getInitials } from '../utils/formatters';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  phone: yup.string().optional(),
  email: yup.string().email('Invalid email').optional().nullable().transform(v => v || null),
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  gstNumber: yup.string().optional(),
});

const AVATAR_COLORS = ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a', '#00838f', '#c62828'];

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const fetchCustomers = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: { search: q, limit: 100 } });
      setCustomers(data.data);
      setTotal(data.total);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCustomers(search), 300);
    return () => clearTimeout(timer);
  }, [search, fetchCustomers]);

  const openAdd = () => { setEditing(null); reset({}); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); reset(c); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/customers/${editing._id}`, values);
        toast.success('Customer updated');
      } else {
        await api.post('/customers', values);
        toast.success('Customer added');
      }
      closeDialog();
      fetchCustomers(search);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/customers/${deleteTarget._id}`);
      toast.success('Customer deleted');
      setDeleteTarget(null);
      fetchCustomers(search);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to delete');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Customers"
        subtitle={`${total} customer(s) total`}
        action={openAdd}
        actionLabel="Add Customer"
      />

      <Card>
        <CardContent sx={{ p: 2 }}>
          <TextField
            placeholder="Search by name, phone, email, GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
          />

          {loading ? <LoadingSpinner message="Loading customers..." /> : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>GST Number</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <PersonOutline sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No customers yet. Add your first customer!</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((c, idx) => (
                      <TableRow key={c._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', bgcolor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                              {getInitials(c.name)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>{c.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.phone || '—'}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.email || '—'}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{c.city || '—'}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {c.gstNumber
                            ? <Chip label={c.gstNumber} size="small" variant="outlined" color="primary" />
                            : '—'}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => openEdit(c)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(c)}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            {[
              { name: 'name', label: 'Full Name *', xs: 12 },
              { name: 'phone', label: 'Phone', xs: 6 },
              { name: 'email', label: 'Email', xs: 6 },
              { name: 'address', label: 'Address', xs: 12 },
              { name: 'city', label: 'City', xs: 4 },
              { name: 'state', label: 'State', xs: 4 },
              { name: 'pincode', label: 'Pincode', xs: 4 },
              { name: 'gstNumber', label: 'GST Number', xs: 12 },
            ].map(({ name, label, xs }) => (
              <Grid item xs={xs} key={name}>
                <TextField
                  {...register(name)}
                  label={label}
                  fullWidth
                  error={!!errors[name]}
                  helperText={errors[name]?.message}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Add Customer'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer"
        message={`Do you want to delete the customer "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default Customers;
