import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, TextField, Button,
  Typography, Divider, Avatar, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { Save, CloudUpload, Business, AccountBalance } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../services/api';
import { useBusiness } from '../context/BusinessContext';
import { GST_RATES } from '../utils/formatters';
import PageHeader from '../components/common/PageHeader';

const SectionTitle = ({ icon, title }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    {React.cloneElement(icon, { color: 'primary', fontSize: 'small' })}
    <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
  </Box>
);

const Settings = () => {
  const { business, fetchBusiness, updateBusiness } = useBusiness();
  const [saving, setSaving] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [sigUploading, setSigUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [signatureUrl, setSignatureUrl] = useState('');

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm();

  useEffect(() => {
    fetchBusiness();
  }, []);

  useEffect(() => {
    if (business) {
      reset(business);
      setLogoUrl(business.logoUrl || '');
      setSignatureUrl(business.signatureUrl || '');
    }
  }, [business, reset]);

  const handleFileUpload = async (file, folder, setUrl, setLoading) => {
    if (!file) return;
    setLoading(true);
    try {
      // 1. Get pre-signed URL
      const { data } = await api.post('/upload/presign', {
        fileName: file.name,
        fileType: file.type,
        folder,
      });
      const { uploadUrl, publicUrl } = data.data;

      // 2. Upload directly to S3
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
      });

      setUrl(publicUrl);
      toast.success(`${folder === 'logos' ? 'Logo' : 'Signature'} uploaded!`);
    } catch (e) {
      toast.error(e.displayMessage || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await updateBusiness({ ...values, logoUrl, signatureUrl });
      toast.success('Settings saved!');
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <PageHeader title="Settings" subtitle="Manage your business profile and invoice defaults" />

      <Grid container spacing={2.5}>
        {/* Business Info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <SectionTitle icon={<Business />} title="Business Information" />
              <Grid container spacing={2}>
                {[
                  { name: 'businessName', label: 'Business Name *', xs: 12 },
                  { name: 'address', label: 'Address', xs: 12 },
                  { name: 'city', label: 'City', xs: 4 },
                  { name: 'state', label: 'State', xs: 4 },
                  { name: 'pincode', label: 'Pincode', xs: 4 },
                  { name: 'phone', label: 'Phone', xs: 6 },
                  { name: 'email', label: 'Email', xs: 6 },
                  { name: 'website', label: 'Website', xs: 12 },
                  { name: 'gstNumber', label: 'GST Number', xs: 6 },
                  { name: 'panNumber', label: 'PAN Number', xs: 6 },
                  { name: 'invoicePrefix', label: 'Invoice Prefix (e.g. INV)', xs: 6 },
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
                <Grid item xs={6}>
                  <Controller name="defaultTaxRate" control={control} render={({ field }) => (
                    <FormControl fullWidth size="small">
                      <InputLabel>Default GST %</InputLabel>
                      <Select {...field} label="Default GST %" value={field.value || 18}>
                        {GST_RATES.map((r) => <MenuItem key={r} value={r}>{r}%</MenuItem>)}
                      </Select>
                    </FormControl>
                  )} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Bank + Uploads */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5} direction="column">
            {/* Bank Details */}
            <Grid item>
              <Card>
                <CardContent>
                  <SectionTitle icon={<AccountBalance />} title="Bank Details" />
                  <Grid container spacing={2}>
                    {[
                      { name: 'bankName', label: 'Bank Name', xs: 12 },
                      { name: 'accountNumber', label: 'Account Number', xs: 6 },
                      { name: 'ifscCode', label: 'IFSC Code', xs: 6 },
                      { name: 'upiId', label: 'UPI ID', xs: 12 },
                    ].map(({ name, label, xs }) => (
                      <Grid item xs={xs} key={name}>
                        <TextField {...register(name)} label={label} fullWidth />
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Logo Upload */}
            <Grid item>
              <Card>
                <CardContent>
                  <SectionTitle icon={<CloudUpload />} title="Logo & Signature" />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" fontWeight={600} mb={1}>Business Logo</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {logoUrl ? (
                          <Box component="img" src={logoUrl} alt="Logo"
                            sx={{ height: 56, maxWidth: 120, objectFit: 'contain', border: '1px solid #e0e0e0', borderRadius: 2, p: 0.5 }} />
                        ) : (
                          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.4rem' }}>L</Avatar>
                        )}
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={logoUploading}
                          startIcon={logoUploading ? <CircularProgress size={16} /> : <CloudUpload />}
                        >
                          {logoUploading ? 'Uploading...' : 'Upload Logo'}
                          <input hidden accept="image/*" type="file"
                            onChange={(e) => handleFileUpload(e.target.files[0], 'logos', setLogoUrl, setLogoUploading)} />
                        </Button>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" fontWeight={600} mb={1}>Signature</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {signatureUrl ? (
                          <Box component="img" src={signatureUrl} alt="Signature"
                            sx={{ height: 48, maxWidth: 120, objectFit: 'contain', border: '1px solid #e0e0e0', borderRadius: 2, p: 0.5 }} />
                        ) : (
                          <Avatar sx={{ width: 48, height: 48, bgcolor: '#546e7a', fontSize: '1rem' }}>S</Avatar>
                        )}
                        <Button
                          variant="outlined"
                          component="label"
                          disabled={sigUploading}
                          startIcon={sigUploading ? <CircularProgress size={16} /> : <CloudUpload />}
                        >
                          {sigUploading ? 'Uploading...' : 'Upload Signature'}
                          <input hidden accept="image/*" type="file"
                            onChange={(e) => handleFileUpload(e.target.files[0], 'signatures', setSignatureUrl, setSigUploading)} />
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Default Notes */}
            <Grid item>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={700} mb={1.5}>Default Invoice Notes</Typography>
                  <TextField
                    {...register('defaultNotes')}
                    placeholder="E.g. Payment due within 15 days. Thank you for your business!"
                    multiline rows={3} fullWidth
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit" variant="contained" size="large"
              disabled={saving} startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              sx={{ minWidth: 160 }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
