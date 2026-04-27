import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

function Secrets({ namespace }) {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSecrets();
  }, [namespace]);

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kubernetes/secrets?namespace=${namespace}`);
      setSecrets(response.data);
    } catch (error) {
      console.error('Failed to fetch secrets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSecrets = secrets.filter(secret =>
    secret.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    secret.metadata.namespace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type) => {
    if (type.includes('tls')) return { bg: 'rgba(63, 185, 80, 0.15)', color: '#3fb950' };
    if (type.includes('docker')) return { bg: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff' };
    if (type.includes('service-account')) return { bg: 'rgba(163, 113, 247, 0.15)', color: '#a371f7' };
    return { bg: 'rgba(139, 148, 158, 0.15)', color: '#8b949e' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Secrets</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search secrets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8b949e' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#21262d' } }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchSecrets} sx={{ color: '#8b949e' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Namespace</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Keys</TableCell>
              <TableCell>Age</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSecrets.map((secret) => {
              const typeColors = getTypeColor(secret.type);
              return (
                <TableRow key={`${secret.metadata.namespace}-${secret.metadata.name}`}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {secret.metadata.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{secret.metadata.namespace}</TableCell>
                  <TableCell>
                    <Chip
                      label={secret.type}
                      size="small"
                      sx={{ backgroundColor: typeColors.bg, color: typeColors.color, fontWeight: 500, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell>{Object.keys(secret.data || {}).length}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(secret.metadata.creationTimestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredSecrets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>No secrets found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Secrets;
