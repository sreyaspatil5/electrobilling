import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography,
  Select, MenuItem, FormControl, InputLabel, Table, TableHead, TableRow,
  TableCell, TableBody, Avatar, Chip
} from '@mui/material';
import { TrendingUp, EmojiEvents } from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#1565c0','#2e7d32','#e65100','#6a1b9a','#00838f','#c62828'];

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get('/invoices/reports', { params: { year } });
        setData(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [year]);

  const monthlySalesData = MONTHS.map((month, i) => {
    const found = data?.monthlySales?.find((m) => m._id.month === i + 1);
    return { month, total: found?.total || 0, count: found?.count || 0 };
  });

  const totalRevenue = monthlySalesData.reduce((s, m) => s + m.total, 0);
  const bestMonth = monthlySalesData.reduce((best, m) => m.total > best.total ? m : best, { month: '—', total: 0 });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>Reports & Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Sales performance overview</Typography>
        </Box>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
          <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
            {[year, year-1, year-2].map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {loading ? <LoadingSpinner message="Loading reports..." /> : (
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={4}>
            <StatCard title={`Total Revenue (${year})`} value={formatCurrency(totalRevenue)}
              subtitle={`${monthlySalesData.reduce((s,m)=>s+m.count,0)} invoices`}
              icon={<TrendingUp />} color="#1565c0" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Best Month" value={bestMonth.month}
              subtitle={formatCurrency(bestMonth.total)} icon={<EmojiEvents />} color="#e65100" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard title="Avg Monthly" value={formatCurrency(totalRevenue / 12)}
              subtitle="Per month average" icon={<TrendingUp />} color="#2e7d32" />
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>Monthly Revenue — {year}</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlySalesData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => `₹${v>=1000?(v/1000).toFixed(0)+'k':v}`} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: 8 }} />
                    <Bar dataKey="total" fill="#1565c0" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>Invoice Count per Month</Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 8 }} />
                    <Line type="monotone" dataKey="count" stroke="#e65100" strokeWidth={2.5}
                      dot={{ r: 4, fill: '#e65100' }} name="Invoices" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>Top Customers</Typography>
                {!(data?.topCustomers?.length) ? (
                  <Typography color="text.secondary" variant="body2">No data yet</Typography>
                ) : (
                  <Box sx={{ display:'flex', flexDirection:'column', gap:1.5 }}>
                    {data.topCustomers.map((c, i) => (
                      <Box key={c._id} sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                        <Avatar sx={{ width:32, height:32, fontSize:'0.8rem', bgcolor: COLORS[i%COLORS.length] }}>{i+1}</Avatar>
                        <Box sx={{ flex:1, minWidth:0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>{c.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{c.count} invoices</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight={700} color="primary.main">{formatCurrency(c.total)}</Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>Top Products by Revenue</Typography>
                {!(data?.topProducts?.length) ? (
                  <Typography color="text.secondary" variant="body2">No product data yet</Typography>
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                      <Box sx={{ overflowX: 'auto' }}>
                        <Table size="small" sx={{ minWidth: 400 }}>
                          <TableHead>
                            <TableRow>
                              <TableCell>#</TableCell>
                              <TableCell>Product</TableCell>
                              <TableCell align="center">Qty Sold</TableCell>
                              <TableCell align="right">Revenue</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {data.topProducts.map((p, i) => (
                              <TableRow key={p._id}>
                                <TableCell>
                                  <Chip label={i+1} size="small"
                                    sx={{ bgcolor: COLORS[i%COLORS.length], color:'#fff', fontWeight:700, minWidth:28 }} />
                                </TableCell>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}><Typography variant="body2" fontWeight={600}>{p._id}</Typography></TableCell>
                                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>{p.qty}</TableCell>
                                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}><strong>{formatCurrency(p.total)}</strong></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={data.topProducts.map((p) => ({ name: p._id, value: p.total }))}
                            cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value">
                            {data.topProducts.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v) => formatCurrency(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Grid>
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reports;
