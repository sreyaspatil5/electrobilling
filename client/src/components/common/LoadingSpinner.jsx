import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => (
  <Box
    sx={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      py: 8, gap: 2,
    }}
  >
    <CircularProgress size={40} thickness={4} />
    <Typography variant="body2" color="text.secondary">{message}</Typography>
  </Box>
);

export default LoadingSpinner;
