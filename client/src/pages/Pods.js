import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Article as LogsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import StatusChip from '../components/StatusChip';
import api from '../services/api';

function Pods({ namespace }) {
  const navigate = useNavigate();
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logsDialog, setLogsDialog] = useState({ open: false, pod: null, logs: '' });
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetchPods();
  }, [namespace]);

  const fetchPods = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kubernetes/pods?namespace=${namespace}`);
      setPods(response.data);
    } catch (error) {
      console.error('Failed to fetch pods:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePod = async (ns, name) => {
    if (window.confirm(`Are you sure you want to delete pod ${name}?`)) {
      try {
        await api.delete(`/kubernetes/pods/${ns}/${name}`);
        fetchPods();
      } catch (error) {
        console.error('Failed to delete pod:', error);
        alert('Failed to delete pod: ' + error.message);
      }
    }
  };

  const viewLogs = async (pod) => {
    setLogsDialog({ open: true, pod, logs: '' });
    setLogsLoading(true);
    try {
      const container = pod.spec.containers[0]?.name;
      const response = await api.get(
        `/logs/${pod.metadata.namespace}/${pod.metadata.name}?container=${container}&tailLines=200`
      );
      setLogsDialog(prev => ({ ...prev, logs: response.data }));
    } catch (error) {
      setLogsDialog(prev => ({ ...prev, logs: `Error fetching logs: ${error.message}` }));
    } finally {
      setLogsLoading(false);
    }
  };

  const filteredPods = pods.filter(pod => 
    pod.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pod.metadata.namespace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRestartCount = (pod) => {
    return pod.status.containerStatuses?.reduce((sum, c) => sum + (c.restartCount || 0), 0) || 0;
  };

  const getReadyContainers = (pod) => {
    const total = pod.spec.containers.length;
    const ready = pod.status.containerStatuses?.filter(c => c.ready).length || 0;
    return `${ready}/${total}`;
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
        <Typography variant="h4">Pods</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search pods..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#8b949e' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#21262d',
              },
            }}
          />
          <Tooltip title="Refresh">
            <IconButton onClick={fetchPods} sx={{ color: '#8b949e' }}>
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
              <TableCell>Status</TableCell>
              <TableCell>Ready</TableCell>
              <TableCell>Restarts</TableCell>
              <TableCell>Node</TableCell>
              <TableCell>Age</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPods.map((pod) => (
              <TableRow
                key={`${pod.metadata.namespace}-${pod.metadata.name}`}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/resource/pod/${pod.metadata.namespace}/${pod.metadata.name}`)}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {pod.metadata.name}
                  </Typography>
                </TableCell>
                <TableCell>{pod.metadata.namespace}</TableCell>
                <TableCell>
                  <StatusChip status={pod.status.phase} />
                </TableCell>
                <TableCell>{getReadyContainers(pod)}</TableCell>
                <TableCell>{getRestartCount(pod)}</TableCell>
                <TableCell>{pod.spec.nodeName || '-'}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(pod.metadata.creationTimestamp), { addSuffix: true })}
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="View Logs">
                    <IconButton size="small" onClick={() => viewLogs(pod)}>
                      <LogsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Details">
                    <IconButton 
                      size="small" 
                      onClick={() => navigate(`/resource/pod/${pod.metadata.namespace}/${pod.metadata.name}`)}
                    >
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton 
                      size="small" 
                      onClick={() => deletePod(pod.metadata.namespace, pod.metadata.name)}
                      sx={{ color: '#f85149' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredPods.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>
                    No pods found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Logs Dialog */}
      <Dialog 
        open={logsDialog.open} 
        onClose={() => setLogsDialog({ open: false, pod: null, logs: '' })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Pod Logs: {logsDialog.pod?.metadata.name}
        </DialogTitle>
        <DialogContent>
          {logsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              component="pre"
              sx={{
                backgroundColor: '#0d1117',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 500,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {logsDialog.logs || 'No logs available'}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogsDialog({ open: false, pod: null, logs: '' })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Pods;
