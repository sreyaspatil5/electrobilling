import React from 'react';
import {
  AppBar as MuiAppBar, Toolbar, IconButton, Typography,
  Box, Avatar, Menu, MenuItem, ListItemIcon, Divider, Chip
} from '@mui/material';
import { Menu as MenuIcon, Logout, Person, ElectricBolt } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useBusiness } from '../../context/BusinessContext';
import { getInitials } from '../../utils/formatters';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/bill/new': 'Create Bill',
  '/invoices': 'Invoice History',
  '/customers': 'Customers',
  '/products': 'Products',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const TopBar = ({ onMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const { business } = useBusiness();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith('/bill') ? 'Create Bill' : 'ElectroBill');

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/login');
  };

  return (
    <MuiAppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          edge="start"
          onClick={onMobileMenuOpen}
          sx={{ display: { md: 'none' }, mr: 1 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            {title}
          </Typography>
          {business?.businessName && (
            <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1 }}>
              {business.businessName}
            </Typography>
          )}
        </Box>

        {/* User Avatar */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          <Avatar
            sx={{
              width: 36, height: 36,
              background: 'linear-gradient(135deg, #1565c0 0%, #1e88e5 100%)',
              fontSize: '0.8rem', fontWeight: 700,
            }}
          >
            {getInitials(user?.name || 'A')}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name || 'Admin'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.role || 'admin'}
            </Typography>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1, minWidth: 180, borderRadius: 2 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={700}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
            <ListItemIcon><Person fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
            <ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
};

export default TopBar;
