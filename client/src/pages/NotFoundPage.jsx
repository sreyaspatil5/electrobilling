import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowBack, ElectricBolt, HomeOutlined } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

const NotFoundPage = () => (
  <Box
    component="main"
    sx={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      p: 3,
      color: 'text.primary',
      backgroundColor: '#f0f5f0',
      backgroundImage: 'linear-gradient(rgba(40,79,67,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(40,79,67,.035) 1px, transparent 1px)',
      backgroundSize: '36px 36px',
    }}
  >
    <Box sx={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
      <Link to="/" aria-label="ElectroBill home" style={{ color: 'inherit', textDecoration: 'none' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 5 }}>
          <Box sx={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 1, color: '#fff', backgroundColor: 'primary.main' }}>
            <ElectricBolt fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>ElectroBill</Typography>
        </Box>
      </Link>
      <Typography sx={{ color: 'secondary.main', fontFamily: 'monospace', fontSize: '0.875rem', fontWeight: 700 }}>
        ERROR 404
      </Typography>
      <Typography variant="h2" sx={{ mt: 1, mb: 1.5, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
        This page is not on the bill.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
        The address may be outdated or mistyped. Head back to ElectroBill or sign in to your workspace.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Button component={Link} to="/" variant="contained" startIcon={<HomeOutlined />}>
          Product home
        </Button>
        <Button component={Link} to="/login" variant="outlined" startIcon={<ArrowBack />}>
          Sign in
        </Button>
      </Box>
    </Box>
  </Box>
);

export default NotFoundPage;