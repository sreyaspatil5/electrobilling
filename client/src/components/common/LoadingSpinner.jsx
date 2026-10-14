import React from 'react';
import { Box, Skeleton, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex', flexDirection: 'column', gap: 1.5, py: 2,
    }}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <Typography variant="body2" color="text.secondary">{message}</Typography>
    <Skeleton animation="wave" variant="rounded" height={40} sx={{ borderRadius: 1 }} />
    {[1, 2, 3, 4, 5].map((row) => (
      <Box key={row} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
        <Skeleton animation="wave" variant="circular" width={32} height={32} />
        <Skeleton animation="wave" variant="text" width={`${38 + (row % 3) * 12}%`} height={28} />
        <Skeleton animation="wave" variant="text" width="16%" height={28} sx={{ ml: 'auto' }} />
      </Box>
    ))}
  </Box>
);

export default LoadingSpinner;
