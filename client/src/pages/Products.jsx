import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Chip, Typography, InputAdornment,
  Grid, Select, MenuItem, FormControl, InputLabel, Tooltip, Alert
} from '@mui/material';
import { Add, Edit, Delete, Search, Inventory2 } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatCurrency, PRODUCT_CATEGORIES, PRODUCT_UNITS, GST_RATES } from '../utils/formatters';

const schema = yup.object({
  name: yup.string().required('Product name required'),
  category: yup.string().required('Category required'),
  price: yup.number().typeError('Enter a valid price').min(0).required('Price required'),
  stock: yup.number().typeError('Enter valid stock').min(0).required('Stock required'),
  unit: yup.string().required('Unit required'),
  taxRate: yup.number().min(0).max(100).required(),
  hsn: yup.string().optional(),
  description: yup.string().optional(),
});

const CATEGORY_COLORS = {
  wire: '#c62828', switch: '#1565c0', bulb: '#e65100', socket: '#2e7d32',
  MCB: '#4527a0', cable: '#00695c', conduit: '#4e342e', fan: '#1565c0',
  panel: '#6a1b9a', other: '#546e7a',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { taxRate: 18, unit: 'pcs', category: 'wire' },
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/products', { params: { search, category: catFilter, limit: 200 } });
      setProducts(data.data);
      setTotal(data.total);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, catFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const openAdd = () => { setEditing(null); reset({ taxRate: 18, unit: 'pcs', category: 'wire', stock: 0 }); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); reset(p); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, values);
        toast.success('Product updated');
      } else {
        await api.post('/products', values);
        toast.success('Product added');
      }
      closeDialog();
      fetchProducts();
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to delete');
    }
  };

  const stockColor = (stock) => stock === 0 ? 'error' : stock < 10 ? 'warning' : 'success';

  return (
    <Box>
      <PageHeader
        title="Products"
        subtitle={`${total} product(s) in inventory`}
        action={openAdd}
        actionLabel="Add Product"
      />

      <Card>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 200 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Category</InputLabel>
              <Select value={catFilter} label="Category" onChange={(e) => setCatFilter(e.target.value)}>
                <MenuItem value="all">All Categories</MenuItem>
                {PRODUCT_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading ? <LoadingSpinner message="Loading products..." /> : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell align="center">GST %</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Inventory2 sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No products found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((p) => (
                      <TableRow key={p._id}>
                        <TableCell sx={{ minWidth: 200 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>{p.name}</Typography>
                          {p.hsn && <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>HSN: {p.hsn}</Typography>}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={p.category}
                            size="small"
                            sx={{
                              background: `${CATEGORY_COLORS[p.category] || '#546e7a'}18`,
                              color: CATEGORY_COLORS[p.category] || '#546e7a',
                              fontWeight: 600, textTransform: 'capitalize',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>{formatCurrency(p.price)}</strong></TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={p.stock}
                            size="small"
                            color={stockColor(p.stock)}
                            variant={p.stock === 0 ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{p.unit}</TableCell>
                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{p.taxRate}%</TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => openEdit(p)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(p)}>
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
        <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}><TextField {...register('name')} label="Product Name *" fullWidth error={!!errors.name} helperText={errors.name?.message} /></Grid>
            <Grid item xs={6}>
              <Controller name="category" control={control} render={({ field }) => (
                <FormControl fullWidth size="small" error={!!errors.category}>
                  <InputLabel>Category *</InputLabel>
                  <Select {...field} label="Category *">
                    {PRODUCT_CATEGORIES.map((c) => <MenuItem key={c} value={c} sx={{ textTransform: 'capitalize' }}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
            </Grid>
            <Grid item xs={6}>
              <Controller name="unit" control={control} render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>Unit *</InputLabel>
                  <Select {...field} label="Unit *">
                    {PRODUCT_UNITS.map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
            </Grid>
            <Grid item xs={4}><TextField {...register('price')} label="Price (₹) *" type="number" fullWidth error={!!errors.price} helperText={errors.price?.message} /></Grid>
            <Grid item xs={4}><TextField {...register('stock')} label="Stock *" type="number" fullWidth error={!!errors.stock} helperText={errors.stock?.message} /></Grid>
            <Grid item xs={4}>
              <Controller name="taxRate" control={control} render={({ field }) => (
                <FormControl fullWidth size="small">
                  <InputLabel>GST %</InputLabel>
                  <Select {...field} label="GST %">
                    {GST_RATES.map((r) => <MenuItem key={r} value={r}>{r}%</MenuItem>)}
                  </Select>
                </FormControl>
              )} />
            </Grid>
            <Grid item xs={6}><TextField {...register('hsn')} label="HSN Code" fullWidth /></Grid>
            <Grid item xs={6}><TextField {...register('description')} label="Description" fullWidth /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Product"
        message={`Do you want to delete the product "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default Products;
