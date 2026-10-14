import React, { useState } from 'react';
import { Box, Breadcrumbs, Typography, Link } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const BREADCRUMB_LABELS = {
  dashboard: 'Dashboard',
  invoices: 'Invoice history',
  new: 'New invoice',
  customers: 'Customers',
  products: 'Products and stock',
  reports: 'Sales reports',
  settings: 'Business settings',
  admins: 'Admin accounts',
  'pending-users': 'Pending approvals',
};

const WorkspaceBreadcrumbs = () => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 1 && segments[0] === 'dashboard') {
    return (
      <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
        <Typography color="text.secondary" fontSize="inherit">Dashboard</Typography>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 1.5, fontSize: '0.8rem' }}>
      <Link component={RouterLink} underline="hover" color="text.secondary" to="/dashboard">
        Dashboard
      </Link>
      {segments.map((segment, index) => {
        const to = `/${segments.slice(0, index + 1).join('/')}`;
        const label = BREADCRUMB_LABELS[segment] || segment.replace(/-/g, ' ');
        return index === segments.length - 1 ? (
          <Typography key={to} color="text.primary" fontSize="inherit" sx={{ textTransform: 'capitalize' }}>
            {label}
          </Typography>
        ) : (
          <Link key={to} component={RouterLink} underline="hover" color="text.secondary" to={to} sx={{ textTransform: 'capitalize' }}>
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'background.default' }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          minHeight: '100vh',
        }}
      >
        <TopBar mobileOpen={mobileOpen} onMobileMenuOpen={() => setMobileOpen(true)} />
        <Box sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2, lg: 3 }, overflowX: 'hidden' }}>
          <WorkspaceBreadcrumbs />
          {children}
        </Box>
        <Box 
          component="footer" 
          sx={{ 
            py: 2, 
            px: { xs: 2, md: 3 }, 
            mt: 'auto', 
            textAlign: 'center', 
            borderTop: '1px solid', 
            borderColor: 'divider',
            backgroundColor: 'background.paper'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Built by{' '}
            <Link href="https://www.vops.digital" target="_blank" rel="noopener noreferrer" color="primary" sx={{ fontWeight: 600 }}>
              VardhamanOps
            </Link>
            {' '} | Contact:{' '}
            <Link href="mailto:hello@vops.digital" color="primary" sx={{ fontWeight: 600 }}>
              hello@vops.digital
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
