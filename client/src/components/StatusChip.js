import React from 'react';
import { Chip } from '@mui/material';

const statusColors = {
  // Pod statuses
  Running: { bg: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' },
  Pending: { bg: 'rgba(210, 153, 34, 0.15)', color: '#d29922' },
  Succeeded: { bg: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff' },
  Failed: { bg: 'rgba(248, 81, 73, 0.15)', color: '#f85149' },
  Unknown: { bg: 'rgba(139, 148, 158, 0.15)', color: '#8b949e' },
  Terminating: { bg: 'rgba(248, 81, 73, 0.15)', color: '#f85149' },
  
  // Node conditions
  Ready: { bg: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' },
  NotReady: { bg: 'rgba(248, 81, 73, 0.15)', color: '#f85149' },
  
  // General
  Active: { bg: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' },
  Bound: { bg: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' },
  Available: { bg: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' },
  Released: { bg: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff' },
  Complete: { bg: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' },
  
  // Default
  default: { bg: 'rgba(139, 148, 158, 0.15)', color: '#8b949e' },
};

function StatusChip({ status, size = 'small' }) {
  const colors = statusColors[status] || statusColors.default;
  
  return (
    <Chip
      label={status}
      size={size}
      sx={{
        backgroundColor: colors.bg,
        color: colors.color,
        fontWeight: 500,
        fontSize: '0.75rem',
      }}
    />
  );
}

export default StatusChip;
