import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, Typography, Avatar, Tooltip, IconButton, Chip
} from '@mui/material';
import { Delete, PersonOutline } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { getInitials } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a', '#00838f', '#c62828'];

const AdminsList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/admins');
      setUsers(data.users);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleDelete = async () => {
    try {
      // In case you add an endpoint to delete active users later
      // For now, this could just call the reject endpoint if it also handles active users, 
      // but let's implement a clean delete endpoint or just block deletion for now if not supported.
      toast.error('Deleting active admins requires additional data migration. Feature coming soon.');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to delete user');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Admin Accounts"
        subtitle={`Managing ${users.length} active admin(s)`}
      />

      <Card>
        <CardContent sx={{ p: 2 }}>
          {loading ? <LoadingSpinner message="Loading admins..." /> : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Admin</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <PersonOutline sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No admins found.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u, idx) => (
                      <TableRow key={u._id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', bgcolor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}>
                              {getInitials(u.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                                {u.name} {currentUser?._id === u._id && '(You)'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{u.email}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip 
                            label={u.role.toUpperCase()} 
                            size="small" 
                            color={u.role === 'superadmin' ? 'secondary' : 'default'} 
                            variant="outlined" 
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip label="Active" size="small" color="success" />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {currentUser?._id !== u._id && u.role !== 'superadmin' ? (
                            <Tooltip title="Delete Admin">
                              <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Admin Account"
        message={`Do you want to delete the admin "${deleteTarget?.name}"? This action is currently restricted to prevent data loss.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default AdminsList;
