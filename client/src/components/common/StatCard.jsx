import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const StatCard = ({ title, value, subtitle, icon, color = '#1565c0', trend }) => (
  <Card
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}12 0%, ${color}06 100%)`,
      border: `1px solid ${color}22`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${color}22` },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: color, mt: 0.5, lineHeight: 1 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ width: 44, height: 44, background: `${color}18`, color }}>
          {icon}
        </Avatar>
      </Box>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
