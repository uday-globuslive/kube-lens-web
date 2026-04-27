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
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

function ConfigMaps({ namespace }) {
  const [configmaps, setConfigmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConfigMaps();
  }, [namespace]);

  const fetchConfigMaps = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kubernetes/configmaps?namespace=${namespace}`);
      setConfigmaps(response.data);
    } catch (error) {
      console.error('Failed to fetch configmaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConfigMaps = configmaps.filter(cm =>
    cm.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cm.metadata.namespace.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <Typography variant="h4">ConfigMaps</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search configmaps..."
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
            <IconButton onClick={fetchConfigMaps} sx={{ color: '#8b949e' }}>
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
              <TableCell>Keys</TableCell>
              <TableCell>Age</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredConfigMaps.map((cm) => (
              <TableRow key={`${cm.metadata.namespace}-${cm.metadata.name}`}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {cm.metadata.name}
                  </Typography>
                </TableCell>
                <TableCell>{cm.metadata.namespace}</TableCell>
                <TableCell>{Object.keys(cm.data || {}).length}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(cm.metadata.creationTimestamp), { addSuffix: true })}
                </TableCell>
              </TableRow>
            ))}
            {filteredConfigMaps.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>No configmaps found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ConfigMaps;
