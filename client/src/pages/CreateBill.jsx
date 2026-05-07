import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Grid, TextField, Button, Typography,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton,
  Select, MenuItem, FormControl, InputLabel, Divider, Autocomplete,
  Chip, ToggleButtonGroup, ToggleButton, CircularProgress, Alert,
  Paper
} from '@mui/material';
import { Add, Delete, Send, Receipt, EmailOutlined } from '@mui/icons-material';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import api from '../services/api';
import { formatCurrency, calcInvoiceTotals, GST_RATES } from '../utils/formatters';
import { useBusiness } from '../context/BusinessContext';
import PageHeader from '../components/common/PageHeader';

const itemSchema = yup.object({
  name: yup.string().required('Product name required'),
  quantity: yup.number().min(1).required(),
  price: yup.number().min(0).required(),
  taxRate: yup.number().min(0).required(),
});

const schema = yup.object({
  customerId: yup.string().required('Customer is required'),
  items: yup.array().of(itemSchema).min(1),
  taxType: yup.string().oneOf(['CGST_SGST', 'IGST']),
  discountPercent: yup.number().min(0).max(100).default(0),
  notes: yup.string().optional(),
  invoiceDate: yup.string().required(),
  dueDate: yup.string().optional(),
});

const CreateBill = () => {
  const { business, fetchBusiness } = useBusiness();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [taxType, setTaxType] = useState('CGST_SGST');
  const [paymentStatus, setPaymentStatus] = useState('unpaid');
  const [submitting, setSubmitting] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState(null);
  const [emailTo, setEmailTo] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      taxType: 'CGST_SGST',
      discountPercent: 0,
      invoiceDate: dayjs().format('YYYY-MM-DD'),
      items: [{ name: '', quantity: 1, price: 0, taxRate: 18, productId: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchItems = watch('items');
  const watchDiscount = watch('discountPercent') || 0;

  const totals = calcInvoiceTotals(watchItems, watchDiscount, taxType);

  useEffect(() => {
    fetchBusiness();
    const loadData = async () => {
      try {
        const [cust, prod] = await Promise.all([
          api.get('/customers', { params: { limit: 500 } }),
          api.get('/products', { params: { limit: 500 } }),
        ]);
        setCustomers(cust.data.data);
        setProducts(prod.data.data);
      } catch (e) {
        toast.error('Failed to load customers/products');
      }
    };
    loadData();
  }, []);

  const handleProductSelect = (index, product) => {
    if (!product) return;
    setValue(`items.${index}.name`, product.name);
    setValue(`items.${index}.price`, product.price);
    setValue(`items.${index}.taxRate`, product.taxRate || 18);
    setValue(`items.${index}.productId`, product._id);
  };

  const addRow = () => append({ name: '', quantity: 1, price: 0, taxRate: 18, productId: null });

  const onSubmit = async (values) => {
    if (!selectedCustomer) { toast.error('Select a customer'); return; }
    setSubmitting(true);
    try {
      let finalCustomerId = selectedCustomer._id;

      if (selectedCustomer.isNew) {
        const { data: custData } = await api.post('/customers', { name: selectedCustomer.name });
        finalCustomerId = custData.data._id;
      }

      const items = values.items.map((item) => ({
        product: item.productId || null,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate,
        taxAmount: +((item.quantity * item.price * item.taxRate) / 100).toFixed(2),
        total: +((item.quantity * item.price) * (1 + item.taxRate / 100)).toFixed(2),
      }));

      const payload = {
        customerId: finalCustomerId,
        items,
        subtotal: totals.subtotal,
        discountPercent: values.discountPercent,
        discountAmount: totals.discountAmount,
        taxType,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        taxTotal: totals.taxTotal,
        finalTotal: totals.finalTotal,
        notes: values.notes,
        invoiceDate: values.invoiceDate,
        dueDate: values.dueDate || null,
        paymentStatus,
      };

      const { data } = await api.post('/invoices', payload);
      setCreatedInvoice(data.data);
      toast.success(`Invoice ${data.data.invoiceNumber} created!`);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailTo && !selectedCustomer?.email) { toast.error('No email address'); return; }
    setSendingEmail(true);
    try {
      await api.post('/email/send', { invoiceId: createdInvoice._id, recipientEmail: emailTo || undefined });
      toast.success('Invoice sent via email!');
    } catch (e) {
      toast.error(e.displayMessage || 'Email failed');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleNewBill = () => {
    setCreatedInvoice(null);
    setSelectedCustomer(null);
    setPaymentStatus('unpaid');
    reset({
      taxType: 'CGST_SGST', discountPercent: 0,
      invoiceDate: dayjs().format('YYYY-MM-DD'),
      items: [{ name: '', quantity: 1, price: 0, taxRate: 18, productId: null }],
    });
  };

  if (createdInvoice) {
    return (
      <Box>
        <PageHeader title="Invoice Created!" subtitle={`Invoice #${createdInvoice.invoiceNumber} generated & uploaded to S3`} />
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Receipt sx={{ fontSize: 64, color: 'success.main', mb: 1 }} />
                  <Typography variant="h5" fontWeight={800} color="success.main">
                    {createdInvoice.invoiceNumber}
                  </Typography>
                  <Typography variant="h6" mt={1}>{formatCurrency(createdInvoice.finalTotal)}</Typography>
                  <Typography color="text.secondary" variant="body2" mt={0.5}>
                    Customer: {createdInvoice.customerSnapshot?.name}
                  </Typography>
                  <Chip
                    label={createdInvoice.paymentStatus?.toUpperCase()}
                    color={createdInvoice.paymentStatus === 'paid' ? 'success' : createdInvoice.paymentStatus === 'partial' ? 'info' : 'warning'}
                    sx={{ mt: 1, fontWeight: 700 }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {createdInvoice.fileUrl && (
                    <Button
                      variant="contained" startIcon={<Receipt />}
                      href={createdInvoice.fileUrl} target="_blank" rel="noopener"
                    >
                      Download PDF
                    </Button>
                  )}
                  <Button variant="outlined" onClick={handleNewBill} startIcon={<Add />}>
                    New Bill
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  <EmailOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Send Invoice via Email
                </Typography>
                <TextField
                  label="Recipient Email"
                  fullWidth
                  value={emailTo || selectedCustomer?.email || ''}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder={selectedCustomer?.email || 'customer@email.com'}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleSendEmail}
                  disabled={sendingEmail}
                  startIcon={sendingEmail ? <CircularProgress size={16} /> : <Send />}
                >
                  {sendingEmail ? 'Sending...' : 'Send Email'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <PageHeader title="Create Bill" subtitle="Fill in the details to generate an invoice" />

      <Grid container spacing={2.5}>
        {/* Business Info Banner */}
        {business && (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2, background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)',
                color: '#fff', borderRadius: 2, display: 'flex', gap: 3, flexWrap: 'wrap',
              }}
            >
              {business.logoUrl && (
                <Box component="img" src={business.logoUrl} alt="logo"
                  sx={{ height: 48, objectFit: 'contain', borderRadius: 1 }} />
              )}
              <Box>
                <Typography fontWeight={800} fontSize="1.1rem">{business.businessName}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.85 }}>{business.address}{business.city ? `, ${business.city}` : ''}</Typography>
                {business.gstNumber && <Chip label={`GSTIN: ${business.gstNumber}`} size="small" sx={{ mt: 0.5, background: 'rgba(255,255,255,0.2)', color: '#fff' }} />}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Customer Selection */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1.5}>Customer *</Typography>
              <Autocomplete
                freeSolo
                options={customers}
                getOptionLabel={(c) => typeof c === 'string' ? c : (c.name || '')}
                value={selectedCustomer}
                onChange={(_, val) => {
                  if (typeof val === 'string') {
                    setSelectedCustomer({ name: val, isNew: true });
                    setValue('customerId', val, { shouldValidate: true });
                  } else if (val) {
                    setSelectedCustomer(val);
                    setValue('customerId', val._id, { shouldValidate: true });
                  } else {
                    setSelectedCustomer(null);
                    setValue('customerId', '', { shouldValidate: true });
                  }
                }}
                onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'input') {
                    if (newInputValue) {
                      setSelectedCustomer({ name: newInputValue, isNew: true });
                      setValue('customerId', newInputValue, { shouldValidate: true });
                    } else {
                      setSelectedCustomer(null);
                      setValue('customerId', '', { shouldValidate: true });
                    }
                  }
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Select or type new customer"
                    error={!!errors.customerId} helperText={errors.customerId?.message} />
                )}
                renderOption={(props, c) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                      {c.phone && <Typography variant="caption" color="text.secondary">{c.phone}</Typography>}
                    </Box>
                  </Box>
                )}
              />
              {selectedCustomer && (
                <Box sx={{ mt: 1.5, p: 1.5, background: '#f8fbff', borderRadius: 2, fontSize: '0.82rem' }}>
                  <Typography variant="body2">{selectedCustomer.address}{selectedCustomer.city ? `, ${selectedCustomer.city}` : ''}</Typography>
                  {selectedCustomer.gstNumber && <Chip label={`GSTIN: ${selectedCustomer.gstNumber}`} size="small" color="primary" variant="outlined" sx={{ mt: 0.5 }} />}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={1.5}>Invoice Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    {...register('invoiceDate')}
                    label="Invoice Date *"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.invoiceDate}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    {...register('dueDate')}
                    label="Due Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Tax Type</Typography>
                  <ToggleButtonGroup
                    value={taxType}
                    exclusive
                    onChange={(_, v) => { if (v) setTaxType(v); }}
                    size="small"
                    sx={{ mt: 0.5, display: 'flex' }}
                  >
                    <ToggleButton value="CGST_SGST" sx={{ flex: 1 }}>CGST + SGST</ToggleButton>
                    <ToggleButton value="IGST" sx={{ flex: 1 }}>IGST</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Payment Status</Typography>
                  <ToggleButtonGroup
                    value={paymentStatus}
                    exclusive
                    onChange={(_, v) => { if (v) setPaymentStatus(v); }}
                    size="small"
                    sx={{ mt: 0.5, display: 'flex' }}
                  >
                    <ToggleButton value="unpaid"
                      sx={{ flex: 1, '&.Mui-selected': { background: '#fff3e0', color: '#e65100', borderColor: '#e65100' } }}
                    >
                      Unpaid
                    </ToggleButton>
                    <ToggleButton value="partial"
                      sx={{ flex: 1, '&.Mui-selected': { background: '#e3f2fd', color: '#1565c0', borderColor: '#1565c0' } }}
                    >
                      Partial
                    </ToggleButton>
                    <ToggleButton value="paid"
                      sx={{ flex: 1, '&.Mui-selected': { background: '#e8f5e9', color: '#2e7d32', borderColor: '#2e7d32' } }}
                    >
                      Paid
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Product Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ px: 2.5, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={700}>Line Items</Typography>
                <Button variant="outlined" size="small" startIcon={<Add />} onClick={addRow}>Add Row</Button>
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ minWidth: 220 }}>Product / Description</TableCell>
                      <TableCell sx={{ width: 90 }}>Qty</TableCell>
                      <TableCell sx={{ width: 110 }}>Rate (₹)</TableCell>
                      <TableCell sx={{ width: 90 }}>GST %</TableCell>
                      <TableCell sx={{ width: 110 }}>Tax Amt</TableCell>
                      <TableCell sx={{ width: 110 }}>Total</TableCell>
                      <TableCell sx={{ width: 44 }}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fields.map((field, index) => {
                      const qty = Number(watchItems?.[index]?.quantity) || 0;
                      const price = Number(watchItems?.[index]?.price) || 0;
                      const taxRateVal = watchItems?.[index]?.taxRate;
                      const tax = taxRateVal !== undefined ? Number(taxRateVal) : 18;
                      const taxAmt = (qty * price * tax) / 100;
                      const lineTotal = qty * price + taxAmt;
                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <Autocomplete
                              options={products}
                              getOptionLabel={(p) => p.name || ''}
                              onChange={(_, val) => handleProductSelect(index, val)}
                              freeSolo
                              size="small"
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  {...register(`items.${index}.name`)}
                                  placeholder="Type or select product"
                                  error={!!errors.items?.[index]?.name}
                                  size="small"
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              {...register(`items.${index}.quantity`)}
                              type="number"
                              size="small"
                              inputProps={{ min: 1, style: { textAlign: 'center' } }}
                              error={!!errors.items?.[index]?.quantity}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              {...register(`items.${index}.price`)}
                              type="number"
                              size="small"
                              inputProps={{ min: 0, step: 0.01 }}
                              error={!!errors.items?.[index]?.price}
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name={`items.${index}.taxRate`}
                              control={control}
                              render={({ field }) => (
                                <Select {...field} size="small" sx={{ width: 80 }}>
                                  {GST_RATES.map((r) => <MenuItem key={r} value={r}>{r}%</MenuItem>)}
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{formatCurrency(taxAmt)}</TableCell>
                          <TableCell><strong>{formatCurrency(lineTotal)}</strong></TableCell>
                          <TableCell>
                            {fields.length > 1 && (
                              <IconButton size="small" color="error" onClick={() => remove(index)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Totals + Notes */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Notes</Typography>
              <TextField
                {...register('notes')}
                placeholder="Payment terms, thank you note, etc."
                multiline rows={4} fullWidth
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Summary</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[
                  { label: 'Subtotal', value: formatCurrency(totals.subtotal) },
                  taxType === 'CGST_SGST'
                    ? { label: 'CGST', value: formatCurrency(totals.cgst) }
                    : { label: 'IGST', value: formatCurrency(totals.igst) },
                  taxType === 'CGST_SGST'
                    ? { label: 'SGST', value: formatCurrency(totals.sgst) }
                    : null,
                ].filter(Boolean).map(({ label, value }) => (
                  <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary" variant="body2">{label}</Typography>
                    <Typography variant="body2">{value}</Typography>
                  </Box>
                ))}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary" variant="body2">Discount (%)</Typography>
                  <TextField
                    {...register('discountPercent')}
                    type="number"
                    size="small"
                    sx={{ width: 80 }}
                    inputProps={{ min: 0, max: 100, step: 0.5, style: { textAlign: 'right' } }}
                  />
                </Box>
                {totals.discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="error.main" variant="body2">Discount Amt</Typography>
                    <Typography color="error.main" variant="body2">- {formatCurrency(totals.discountAmount)}</Typography>
                  </Box>
                )}

                <Divider sx={{ my: 0.5 }} />
                <Box
                  sx={{
                    display: 'flex', justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #0d47a1, #1565c0)',
                    borderRadius: 2, px: 2, py: 1.5,
                  }}
                >
                  <Typography fontWeight={800} color="#fff">Total Amount</Typography>
                  <Typography fontWeight={800} color="#fff" fontSize="1.1rem">
                    {formatCurrency(totals.finalTotal)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Submit */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" size="large" onClick={() => reset()}>Clear</Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <Receipt />}
              sx={{ minWidth: 200 }}
            >
              {submitting ? 'Generating Invoice...' : 'Generate Invoice'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateBill;
