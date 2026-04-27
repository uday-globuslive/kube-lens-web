import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Tooltip, CircularProgress, TextField, InputAdornment, Tabs, Tab, Chip,
} from '@mui/material';
import { Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import StatusChip from '../components/StatusChip';
import api from '../services/api';

function PersistentVolumes({ namespace }) {
  const [pvs, setPvs] = useState([]);
  const [pvcs, setPvcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => { fetchData(); }, [namespace]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pvsRes, pvcsRes] = await Promise.all([
        api.get('/kubernetes/persistentvolumes'),
        api.get(`/kubernetes/persistentvolumeclaims?namespace=${namespace}`),
      ]);
      setPvs(pvsRes.data);
      setPvcs(pvcsRes.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPVs = pvs.filter(i => i.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredPVCs = pvcs.filter(i =>
    i.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.metadata.namespace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: 400 }}><CircularProgress /></Box>;

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Persistent Storage</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField size="small" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8b949e' }} /></InputAdornment> }}
            sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#21262d' } }} />
          <Tooltip title="Refresh"><IconButton onClick={fetchData} sx={{ color: '#8b949e' }}><RefreshIcon /></IconButton></Tooltip>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Persistent Volumes (${pvs.length})`} />
        <Tab label={`Persistent Volume Claims (${pvcs.length})`} />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead><TableRow>
              <TableCell>Name</TableCell><TableCell>Status</TableCell><TableCell>Capacity</TableCell>
              <TableCell>Access Modes</TableCell><TableCell>Storage Class</TableCell><TableCell>Claim</TableCell><TableCell>Age</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filteredPVs.map((item) => (
                <TableRow key={item.metadata.name}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{item.metadata.name}</Typography></TableCell>
                  <TableCell><StatusChip status={item.status.phase} /></TableCell>
                  <TableCell>{item.spec.capacity?.storage}</TableCell>
                  <TableCell>{item.spec.accessModes?.join(', ')}</TableCell>
                  <TableCell>{item.spec.storageClassName || '-'}</TableCell>
                  <TableCell>{item.spec.claimRef ? `${item.spec.claimRef.namespace}/${item.spec.claimRef.name}` : '-'}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(item.metadata.creationTimestamp), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
              {filteredPVs.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" sx={{ color: '#8b949e' }}>No persistent volumes found</Typography>
              </TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead><TableRow>
              <TableCell>Name</TableCell><TableCell>Namespace</TableCell><TableCell>Status</TableCell>
              <TableCell>Volume</TableCell><TableCell>Capacity</TableCell><TableCell>Storage Class</TableCell><TableCell>Age</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {filteredPVCs.map((item) => (
                <TableRow key={`${item.metadata.namespace}-${item.metadata.name}`}>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 500 }}>{item.metadata.name}</Typography></TableCell>
                  <TableCell>{item.metadata.namespace}</TableCell>
                  <TableCell><StatusChip status={item.status.phase} /></TableCell>
                  <TableCell>{item.spec.volumeName || '-'}</TableCell>
                  <TableCell>{item.status.capacity?.storage || item.spec.resources?.requests?.storage}</TableCell>
                  <TableCell>{item.spec.storageClassName || '-'}</TableCell>
                  <TableCell>{formatDistanceToNow(new Date(item.metadata.creationTimestamp), { addSuffix: true })}</TableCell>
                </TableRow>
              ))}
              {filteredPVCs.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography variant="body2" sx={{ color: '#8b949e' }}>No persistent volume claims found</Typography>
              </TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default PersistentVolumes;
