import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, CircularProgress, TextField, InputAdornment, Chip,
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon, Warning, Error, Info } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

function Events({ namespace }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, [namespace]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kubernetes/events?namespace=${namespace}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = events.filter(e =>
    e.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.involvedObject?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Warning': return <Warning sx={{ fontSize: 18, color: '#d29922' }} />;
      case 'Error': return <Error sx={{ fontSize: 18, color: '#f85149' }} />;
      default: return <Info sx={{ fontSize: 18, color: '#58a6ff' }} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Warning': return { bg: 'rgba(210, 153, 34, 0.15)', color: '#d29922' };
      case 'Error': return { bg: 'rgba(248, 81, 73, 0.15)', color: '#f85149' };
      default: return { bg: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff' };
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: 400 }}><CircularProgress /></Box>;

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Events</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8b949e' }} /></InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#21262d' } }} />
          <Tooltip title="Refresh"><IconButton onClick={fetchData} sx={{ color: '#8b949e' }}><RefreshIcon /></IconButton></Tooltip>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow>
            <TableCell width={80}>Type</TableCell>
            <TableCell>Reason</TableCell>
            <TableCell>Object</TableCell>
            <TableCell>Message</TableCell>
            <TableCell>Namespace</TableCell>
            <TableCell>Count</TableCell>
            <TableCell>Last Seen</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.map((event, idx) => {
              const typeColors = getTypeColor(event.type);
              return (
                <TableRow key={idx}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getTypeIcon(event.type)}
                      <Chip label={event.type} size="small"
                        sx={{ backgroundColor: typeColors.bg, color: typeColors.color, fontWeight: 500, fontSize: '0.7rem' }} />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{event.reason}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{event.involvedObject?.kind}: {event.involvedObject?.name}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 400 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{event.message}</Typography>
                  </TableCell>
                  <TableCell>{event.metadata?.namespace}</TableCell>
                  <TableCell>{event.count || 1}</TableCell>
                  <TableCell>
                    {event.lastTimestamp ? formatDistanceToNow(new Date(event.lastTimestamp), { addSuffix: true }) :
                      event.eventTime ? formatDistanceToNow(new Date(event.eventTime), { addSuffix: true }) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
              <Typography variant="body2" sx={{ color: '#8b949e' }}>No events found</Typography>
            </TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Events;
