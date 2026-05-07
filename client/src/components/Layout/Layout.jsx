import React, { useState } from 'react';
import { Box, Typography, Link } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

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
        <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, overflowX: 'hidden' }}>
          {children}
        </Box>
        <Box 
          component="footer" 
          sx={{ 
            py: 3, 
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
