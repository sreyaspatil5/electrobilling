import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Table, TableHead, TableRow,
  TableCell, TableBody, Typography, Avatar, Tooltip, IconButton
} from '@mui/material';
import { Check, Close, PersonOutline } from '@mui/icons-material';
import toast from 'react-hot-toast';
import api from '../services/api';
import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { getInitials } from '../utils/formatters';

const AVATAR_COLORS = ['#1565c0', '#2e7d32', '#e65100', '#6a1b9a', '#00838f', '#c62828'];

const PendingUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/pending-users');
      setUsers(data.users);
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to load pending users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleApprove = async (userId) => {
    try {
      await api.put(`/auth/approve/${userId}`);
      toast.success('User approved successfully');
      fetchPendingUsers();
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to approve user');
    }
  };

  const handleReject = async () => {
    try {
      await api.delete(`/auth/reject/${deleteTarget._id}`);
      toast.success('User application rejected');
      setDeleteTarget(null);
      fetchPendingUsers();
    } catch (e) {
      toast.error(e.displayMessage || 'Failed to reject user');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Pending Approvals"
        subtitle={`${users.length} admin(s) waiting for approval`}
      />

      <Card>
        <CardContent sx={{ p: 2 }}>
          {loading ? <LoadingSpinner message="Loading pending users..." /> : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Registration Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <PersonOutline sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary">No pending users.</Typography>
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
                            <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>{u.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{u.email}</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Tooltip title="Approve">
                            <IconButton size="small" color="success" onClick={() => handleApprove(u._id)} sx={{ mr: 1 }}>
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(u)}>
                              <Close fontSize="small" />
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Reject Application"
        message={`Do you want to delete the application for "${deleteTarget?.name}"?`}
        onConfirm={handleReject}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
};

export default PendingUsers;
