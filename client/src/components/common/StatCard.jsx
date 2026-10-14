import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';

const StatCard = ({ title, value, subtitle, icon, color = '#284f43' }) => (
  <Card
    sx={{
      height: '100%',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:hover': { borderColor: `${color}70`, boxShadow: '0 5px 18px rgba(34,49,43,0.09)' },
    }}
  >
    <CardContent sx={{ p: 2.25 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.75, lineHeight: 1.15, overflowWrap: 'anywhere' }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ width: 42, height: 42, borderRadius: 1, background: `${color}18`, color, flexShrink: 0 }}>
          {icon}
        </Avatar>
      </Box>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
