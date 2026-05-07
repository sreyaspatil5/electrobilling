import React, { useState } from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, IconButton, useMediaQuery, Tooltip, Divider
} from '@mui/material';
import {
  Dashboard, People, Inventory2, Receipt, BarChart, Settings,
  AddCircle, MenuOpen, ElectricBolt, AdminPanelSettings, ManageAccounts
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED = 68;

const navItems = [
  { label: 'Dashboard', icon: <Dashboard />, path: '/' },
  { label: 'Create Bill', icon: <AddCircle />, path: '/bill/new' },
  { label: 'Invoices', icon: <Receipt />, path: '/invoices' },
  { label: 'Customers', icon: <People />, path: '/customers' },
  { label: 'Products', icon: <Inventory2 />, path: '/products' },
  { label: 'Reports', icon: <BarChart />, path: '/reports' },
  { label: 'Settings', icon: <Settings />, path: '/settings' },
];

const Sidebar = ({ mobileOpen, onMobileClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = useMediaQuery('(max-width:900px)');
  const [collapsed, setCollapsed] = useState(false);

  const width = isMobile ? SIDEBAR_WIDTH : collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH;

  const dynamicNavItems = [...navItems];
  if (user?.role === 'superadmin') {
    dynamicNavItems.push({ label: 'All Admins', icon: <ManageAccounts />, path: '/admins' });
    dynamicNavItems.push({ label: 'Pending Users', icon: <AdminPanelSettings />, path: '/pending-users' });
  }

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) onMobileClose();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 1 }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 2,
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Box
          sx={{
            width: 38, height: 38, borderRadius: 2,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ElectricBolt sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        {(!collapsed || isMobile) && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.2, fontSize: '1rem' }}>
                ElectroBill
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', fontWeight: 500 }}>
                Billing Manager
              </Typography>
            </Box>
            <Box
              component="a"
              href="https://www.vops.digital"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '0.65rem',
                fontWeight: 600,
                display: 'inline-block',
                mt: 0.5,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transformOrigin: 'left center',
                '&:hover': {
                  color: '#fff',
                  transform: 'scale(1.05) translateX(2px)',
                  textShadow: '0 0 10px rgba(255,255,255,0.6)',
                }
              }}
            >
              By VardhamanOps
            </Box>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            size="small"
            onClick={() => setCollapsed((c) => !c)}
            sx={{ ml: 'auto', color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }}
          >
            <MenuOpen sx={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
          </IconButton>
        )}
      </Box>

      {/* Nav Items */}
      <List sx={{ flex: 1, pt: 1.5, px: 1 }}>
        {dynamicNavItems.map(({ label, icon, path }) => {
          const active = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <Tooltip key={path} title={collapsed && !isMobile ? label : ''} placement="right">
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNav(path)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 46,
                    px: collapsed && !isMobile ? 1.5 : 2,
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
                    '&:hover': { background: 'rgba(255,255,255,0.12)' },
                    transition: 'all 0.2s',
                    position: 'relative',
                    '&::before': active ? {
                      content: '""', position: 'absolute', left: 0, top: '50%',
                      transform: 'translateY(-50%)', width: 3, height: '60%',
                      background: '#fff', borderRadius: 2,
                    } : {},
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed && !isMobile ? 0 : 36,
                      color: active ? '#fff' : 'rgba(255,255,255,0.7)',
                      '& svg': { fontSize: 22 },
                    }}
                  >
                    {React.cloneElement(icon)}
                  </ListItemIcon>
                  {(!collapsed || isMobile) && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontSize: '0.875rem',
                        fontWeight: active ? 700 : 500,
                        color: active ? '#fff' : 'rgba(255,255,255,0.8)',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      {/* Bottom version */}
      {!collapsed && (
        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
            v1.0.0 · ElectroBill
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {/* Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width,
            flexShrink: 0,
            transition: 'width 0.3s',
            '& .MuiDrawer-paper': {
              width, overflow: 'hidden',
              transition: 'width 0.3s',
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onMobileClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, border: 'none' },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
