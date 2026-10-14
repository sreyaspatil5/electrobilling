import React from 'react';
import { Box, Grid, Skeleton, Typography } from '@mui/material';

const PageSkeleton = ({ message = 'Loading page...' }) => (
  <Box
    role="status"
    aria-live="polite"
    aria-busy="true"
    sx={{ width: '100%', maxWidth: 1320, mx: 'auto', p: { xs: 2, sm: 3 } }}
  >
    <Typography
      component="span"
      sx={{ position: 'absolute', width: 1, height: 1, p: 0, m: -1, overflow: 'hidden', clipPath: 'inset(50%)', whiteSpace: 'nowrap', border: 0 }}
    >
      {message}
    </Typography>
    <Box sx={{ mb: 3 }}>
      <Skeleton animation="wave" variant="text" width={230} height={38} />
      <Skeleton animation="wave" variant="text" width={320} height={23} />
    </Box>
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {[1, 2, 3, 4].map((item) => (
        <Grid item xs={12} sm={6} lg={3} key={item}>
          <Skeleton animation="wave" variant="rounded" height={118} sx={{ borderRadius: 1 }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2}>
      <Grid item xs={12} lg={8}>
        <Skeleton animation="wave" variant="rounded" height={340} sx={{ borderRadius: 1 }} />
      </Grid>
      <Grid item xs={12} lg={4}>
        <Skeleton animation="wave" variant="rounded" height={340} sx={{ borderRadius: 1 }} />
      </Grid>
    </Grid>
  </Box>
);

export default PageSkeleton;