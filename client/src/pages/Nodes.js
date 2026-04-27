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
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import StatusChip from '../components/StatusChip';
import api from '../services/api';

function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchNodes();
  }, []);

  const fetchNodes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kubernetes/nodes');
      setNodes(response.data);
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNodes = nodes.filter(node =>
    node.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNodeStatus = (node) => {
    const readyCondition = node.status.conditions?.find(c => c.type === 'Ready');
    return readyCondition?.status === 'True' ? 'Ready' : 'NotReady';
  };

  const getRoles = (node) => {
    const labels = node.metadata.labels || {};
    const roles = [];
    Object.keys(labels).forEach(key => {
      if (key.startsWith('node-role.kubernetes.io/')) {
        roles.push(key.replace('node-role.kubernetes.io/', ''));
      }
    });
    return roles.length > 0 ? roles : ['worker'];
  };

  const getCapacity = (node, resource) => {
    const capacity = node.status.capacity?.[resource];
    const allocatable = node.status.allocatable?.[resource];
    return { capacity, allocatable };
  };

  const parseMemory = (mem) => {
    if (!mem) return 0;
    const value = parseInt(mem);
    if (mem.endsWith('Ki')) return value / 1024 / 1024;
    if (mem.endsWith('Mi')) return value / 1024;
    if (mem.endsWith('Gi')) return value;
    return value / 1024 / 1024 / 1024;
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
        <Typography variant="h4">Nodes</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search nodes..."
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
            <IconButton onClick={fetchNodes} sx={{ color: '#8b949e' }}>
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
              <TableCell>Status</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>CPU</TableCell>
              <TableCell>Memory</TableCell>
              <TableCell>Version</TableCell>
              <TableCell>Age</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNodes.map((node) => {
              const cpu = getCapacity(node, 'cpu');
              const memory = getCapacity(node, 'memory');
              const memoryGi = parseMemory(memory.capacity).toFixed(1);
              
              return (
                <TableRow key={node.metadata.name}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {node.metadata.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#8b949e' }}>
                      {node.status.addresses?.find(a => a.type === 'InternalIP')?.address}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={getNodeStatus(node)} />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {getRoles(node).map(role => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(88, 166, 255, 0.15)',
                            color: '#58a6ff',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{cpu.allocatable || cpu.capacity} cores</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{memoryGi} Gi</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {node.status.nodeInfo?.kubeletVersion}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(node.metadata.creationTimestamp), { addSuffix: true })}
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredNodes.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>No nodes found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Nodes;
