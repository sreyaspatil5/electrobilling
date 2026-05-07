import React, { useEffect, useState } from 'react';
import {
  Grid, Box, Card, CardContent, Typography, Button,
  Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Avatar, Divider, Skeleton
} from '@mui/material';
import {
  TrendingUp, Receipt, People, Inventory2,
  AddCircle, PersonAdd, InventoryOutlined, ArrowForward
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import { useBusiness } from '../context/BusinessContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { fetchBusiness } = useBusiness();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusiness();
    const load = async () => {
      try {
        const { data } = await api.get('/invoices/stats');
        setStats(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const quickActions = [
    { label: 'Create Bill', icon: <AddCircle />, path: '/bill/new', color: '#1565c0' },
    { label: 'Add Customer', icon: <PersonAdd />, path: '/customers', color: '#2e7d32' },
    { label: 'Add Product', icon: <InventoryOutlined />, path: '/products', color: '#e65100' },
    { label: 'View Reports', icon: <TrendingUp />, path: '/reports', color: '#6a1b9a' },
  ];

  const getStatusChip = (status) => {
    const map = {
      paid: { label: 'Paid', color: 'success' },
      unpaid: { label: 'Unpaid', color: 'warning' },
      partial: { label: 'Partial', color: 'info' },
    };
    const cfg = map[status] || { label: status, color: 'default' };
    return <Chip label={cfg.label} color={cfg.color} size="small" />;
  };

  return (
    <Box>
      {/* Stat Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          {
            title: "Today's Sales",
            value: loading ? '...' : formatCurrency(stats?.daily?.total || 0),
            subtitle: `${stats?.daily?.count || 0} invoice(s) today`,
            icon: <TrendingUp />, color: '#1565c0',
          },
          {
            title: 'Weekly Sales',
            value: loading ? '...' : formatCurrency(stats?.weekly?.total || 0),
            subtitle: `${stats?.weekly?.count || 0} invoice(s) this week`,
            icon: <Receipt />, color: '#2e7d32',
          },
          {
            title: 'Monthly Sales',
            value: loading ? '...' : formatCurrency(stats?.monthly?.total || 0),
            subtitle: `${stats?.monthly?.count || 0} invoice(s) this month`,
            icon: <TrendingUp />, color: '#e65100',
          },
          {
            title: 'Total Invoices',
            value: loading ? '...' : (stats?.totalInvoices || 0).toString(),
            subtitle: 'All time',
            icon: <Receipt />, color: '#6a1b9a',
          },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} lg={3} key={i}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Recent Invoices */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>Recent Invoices</Typography>
                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/invoices')}>
                  View All
                </Button>
              </Box>
              <Divider />
              {loading ? (
                <Box sx={{ p: 2 }}>
                  {[1, 2, 3].map((k) => <Skeleton key={k} height={50} sx={{ mb: 1 }} />)}
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 600 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Invoice #</TableCell>
                        <TableCell>Customer</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(stats?.recentInvoices || []).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                            No invoices yet. Create your first bill!
                          </TableCell>
                        </TableRow>
                      ) : (
                        (stats?.recentInvoices || []).map((inv) => (
                          <TableRow
                            key={inv._id}
                            hover
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate('/invoices')}
                          >
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Typography variant="body2" fontWeight={700} color="primary.main">
                                {inv.invoiceNumber}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 26, height: 26, fontSize: '0.7rem', bgcolor: 'primary.light' }}>
                                  {inv.customer?.name?.[0] || '?'}
                                </Avatar>
                                {inv.customer?.name || '—'}
                              </Box>
                            </TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(inv.invoiceDate)}</TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}><strong>{formatCurrency(inv.finalTotal)}</strong></TableCell>
                            <TableCell sx={{ whiteSpace: 'nowrap' }}>{getStatusChip(inv.paymentStatus)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} mb={2}>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {quickActions.map(({ label, icon, path, color }) => (
                  <Button
                    key={path}
                    variant="outlined"
                    startIcon={React.cloneElement(icon, { sx: { color } })}
                    onClick={() => navigate(path)}
                    fullWidth
                    sx={{
                      justifyContent: 'flex-start', py: 1.5, borderRadius: 2,
                      borderColor: `${color}40`, color: 'text.primary',
                      '&:hover': { borderColor: color, background: `${color}08` },
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
