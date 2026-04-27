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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import StatusChip from '../components/StatusChip';
import api from '../services/api';

function Namespaces({ onRefresh }) {
  const [namespaces, setNamespaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createDialog, setCreateDialog] = useState(false);
  const [newNamespace, setNewNamespace] = useState('');

  useEffect(() => {
    fetchNamespaces();
  }, []);

  const fetchNamespaces = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kubernetes/namespaces');
      setNamespaces(response.data);
    } catch (error) {
      console.error('Failed to fetch namespaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNamespace = async (name) => {
    if (window.confirm(`Are you sure you want to delete namespace ${name}? This will delete all resources in this namespace.`)) {
      try {
        await api.delete(`/kubernetes/namespaces/${name}`);
        fetchNamespaces();
        if (onRefresh) onRefresh();
      } catch (error) {
        console.error('Failed to delete namespace:', error);
        alert('Failed to delete namespace: ' + error.message);
      }
    }
  };

  const createNamespace = async () => {
    if (!newNamespace.trim()) return;
    try {
      await api.post('/kubernetes/namespaces', { name: newNamespace.trim() });
      setCreateDialog(false);
      setNewNamespace('');
      fetchNamespaces();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to create namespace:', error);
      alert('Failed to create namespace: ' + error.message);
    }
  };

  const filteredNamespaces = namespaces.filter(ns =>
    ns.metadata.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        <Typography variant="h4">Namespaces</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search namespaces..."
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
          <Tooltip title="Create Namespace">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialog(true)}
            >
              Create
            </Button>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchNamespaces} sx={{ color: '#8b949e' }}>
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
              <TableCell>Labels</TableCell>
              <TableCell>Age</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNamespaces.map((ns) => (
              <TableRow key={ns.metadata.name}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {ns.metadata.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={ns.status.phase} />
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ color: '#8b949e' }}>
                    {Object.keys(ns.metadata.labels || {}).length} labels
                  </Typography>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(ns.metadata.creationTimestamp), { addSuffix: true })}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => deleteNamespace(ns.metadata.name)}
                      sx={{ color: '#f85149' }}
                      disabled={['default', 'kube-system', 'kube-public', 'kube-node-lease'].includes(ns.metadata.name)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredNamespaces.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>No namespaces found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Dialog */}
      <Dialog open={createDialog} onClose={() => setCreateDialog(false)}>
        <DialogTitle>Create Namespace</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 2 }}>
          <TextField
            fullWidth
            label="Namespace Name"
            value={newNamespace}
            onChange={(e) => setNewNamespace(e.target.value)}
            placeholder="my-namespace"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={createNamespace}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Namespaces;
