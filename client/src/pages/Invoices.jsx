import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Table, TableHead, TableRow, TableCell,
  TableBody, Typography, Chip, IconButton, Button, TextField,
  InputAdornment, Grid, Dialog, DialogTitle, DialogContent,
  DialogActions, Select, MenuItem, FormControl, InputLabel,
  Tooltip, Avatar, Divider, CircularProgress
} from '@mui/material';
import {
  Download, Delete, Visibility, Search, Receipt,
  FilterList, Send, Email, Close
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';



const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState([]);
  const [filters, setFilters] = useState({ customer: '', startDate: '', endDate: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [emailDialog, setEmailDialog] = useState(null); // invoice object
  const [emailTo, setEmailTo] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (filters.customer) params.customer = filters.customer;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const { data } = await api.get('/invoices', { params });
      setInvoices(data.data);
      setTotal(data.total);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  useEffect(() => {
    api.get('/customers', { params: { limit: 500 } })
      .then(({ data }) => setCustomers(data.data))
      .catch(() => {});
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/invoices/${deleteTarget._id}`);
      toast.success('Invoice deleted');
      setDeleteTarget(null);
      fetchInvoices();
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to delete');
    }
  };

  // Cycle: unpaid → partial → paid → unpaid
  const NEXT_STATUS = { unpaid: 'partial', partial: 'paid', paid: 'unpaid' };
  const STATUS_LABEL = { unpaid: 'Unpaid', partial: 'Partial', paid: 'Paid' };
  const STATUS_COLOR = { unpaid: 'warning', partial: 'info', paid: 'success' };

  const handleToggleStatus = async (inv) => {
    const next = NEXT_STATUS[inv.paymentStatus] || 'unpaid';
    try {
      const { data } = await api.patch(`/invoices/${inv._id}/payment-status`, { paymentStatus: next });
      // Update locally without full refetch
      setInvoices((prev) =>
        prev.map((i) => i._id === inv._id ? { ...i, paymentStatus: data.data.paymentStatus } : i)
      );
      toast.success(`Marked as ${next}`);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to update status');
    }
  };

  const openEmail = (inv) => {
    setEmailDialog(inv);
    setEmailTo(inv.customerSnapshot?.email || inv.customer?.email || '');
  };

  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      await api.post('/email/send', { invoiceId: emailDialog._id, recipientEmail: emailTo || undefined });
      toast.success('Invoice sent!');
      setEmailDialog(null);
    } catch (e) {
      toast.error(e.displayMessage || 'Email failed');
    } finally {
      setSendingEmail(false);
    }
  };

  const clearFilters = () => setFilters({ customer: '', startDate: '', endDate: '' });

  return (
    <Box>
      <PageHeader
        title="Invoice History"
        subtitle={`${total} invoice(s) found`}
      />

      {/* Filters */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Customer</InputLabel>
                <Select
                  value={filters.customer}
                  label="Filter by Customer"
                  onChange={(e) => setFilters((f) => ({ ...f, customer: e.target.value }))}
                >
                  <MenuItem value="">All Customers</MenuItem>
                  {customers.map((c) => (
                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="From Date" type="date" size="small" fullWidth
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="To Date" type="date" size="small" fullWidth
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button variant="outlined" onClick={clearFilters} startIcon={<Close />} fullWidth>
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Invoice Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {loading ? (
            <LoadingSpinner message="Loading invoices..." />
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">PDF</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Receipt sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No invoices found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((inv) => (
                      <TableRow key={inv._id}>
                        <TableCell>
                          <Typography fontWeight={700} color="primary.main" variant="body2">
                            {inv.invoiceNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                              {(inv.customerSnapshot?.name || inv.customer?.name || '?')[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {inv.customerSnapshot?.name || inv.customer?.name || '—'}
                              </Typography>
                              {inv.customerSnapshot?.phone && (
                                <Typography variant="caption" color="text.secondary">
                                  {inv.customerSnapshot.phone}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(inv.invoiceDate)}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {inv.dueDate ? (
                            <Typography
                              variant="body2"
                              color={new Date(inv.dueDate) < new Date() && inv.paymentStatus !== 'paid' ? 'error' : 'text.primary'}
                            >
                              {formatDate(inv.dueDate)}
                            </Typography>
                          ) : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700}>{formatCurrency(inv.finalTotal)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Click to toggle payment status">
                            <Chip
                              label={STATUS_LABEL[inv.paymentStatus] || inv.paymentStatus}
                              color={STATUS_COLOR[inv.paymentStatus] || 'default'}
                              size="small"
                              onClick={() => handleToggleStatus(inv)}
                              sx={{ fontWeight: 700, textTransform: 'capitalize', cursor: 'pointer',
                                '&:hover': { opacity: 0.8, transform: 'scale(1.05)' },
                                transition: 'all 0.15s',
                              }}
                            />
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          {inv.fileUrl ? (
                            <Tooltip title="Download PDF">
                              <IconButton
                                size="small" color="primary"
                                href={inv.fileUrl} target="_blank" rel="noopener"
                                component="a"
                              >
                                <Download fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled">N/A</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Send Email">
                            <IconButton size="small" color="info" onClick={() => openEmail(inv)}>
                              <Email fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(inv)}>
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

      {/* Email Dialog */}
      <Dialog open={!!emailDialog} onClose={() => setEmailDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Invoice {emailDialog?.invoiceNumber}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Customer: <strong>{emailDialog?.customerSnapshot?.name}</strong> | Amount: <strong>{formatCurrency(emailDialog?.finalTotal)}</strong>
          </Typography>
          <TextField
            label="Recipient Email"
            value={emailTo}
            onChange={(e) => setEmailTo(e.target.value)}
            fullWidth
            type="email"
            placeholder="customer@email.com"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSendEmail}
            disabled={sendingEmail}
            startIcon={sendingEmail ? <CircularProgress size={16} /> : <Send />}
          >
            {sendingEmail ? 'Sending...' : 'Send Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Invoice"
        message={`Do you want to delete the invoice "${deleteTarget?.invoiceNumber}"? It will be hidden from the list.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default Invoices;
