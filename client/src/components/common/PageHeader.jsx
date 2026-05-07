import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

const PageHeader = ({ title, subtitle, action, actionLabel, actionIcon = <Add /> }) => (
  <Box
    sx={{
      display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' },
      flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 3,
    }}
  >
    <Box>
      <Typography variant="h5" fontWeight={800} color="text.primary">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mt={0.5}>{subtitle}</Typography>
      )}
    </Box>
    {action && (
      <Button variant="contained" startIcon={actionIcon} onClick={action} size="large">
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default PageHeader;
