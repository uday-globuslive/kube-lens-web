import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, CircularProgress, TextField, InputAdornment,
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import StatusChip from '../components/StatusChip';
import api from '../services/api';

function Jobs({ namespace }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchData(); }, [namespace]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kubernetes/jobs?namespace=${namespace}`);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter(i =>
    i.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.metadata.namespace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (item) => {
    if (item.status.succeeded) return 'Complete';
    if (item.status.failed) return 'Failed';
    if (item.status.active) return 'Running';
    return 'Pending';
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: 400 }}><CircularProgress /></Box>;

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Jobs</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8b949e' }} /></InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#21262d' } }} />
          <Tooltip title="Refresh"><IconButton onClick={fetchData} sx={{ color: '#8b949e' }}><RefreshIcon /></IconButton></Tooltip>
        </Box>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead><TableRow>
            <TableCell>Name</TableCell><TableCell>Namespace</TableCell><TableCell>Status</TableCell>
            <TableCell>Completions</TableCell><TableCell>Duration</TableCell><TableCell>Age</TableCell>
          </TableRow></TableHead>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={`${item.metadata.namespace}-${item.metadata.name}`}>
                <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{item.metadata.name}</Typography></TableCell>
                <TableCell>{item.metadata.namespace}</TableCell>
                <TableCell><StatusChip status={getStatus(item)} /></TableCell>
                <TableCell>{`${item.status.succeeded || 0}/${item.spec.completions || 1}`}</TableCell>
                <TableCell>{item.status.completionTime && item.status.startTime ?
                  `${Math.round((new Date(item.status.completionTime) - new Date(item.status.startTime)) / 1000)}s` : '-'}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(item.metadata.creationTimestamp), { addSuffix: true })}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
              <Typography variant="body2" sx={{ color: '#8b949e' }}>No jobs found</Typography>
            </TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Jobs;
