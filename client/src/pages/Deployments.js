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
  Slider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  RestartAlt as RestartIcon,
  Scale as ScaleIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import StatusChip from '../components/StatusChip';
import api from '../services/api';

function Deployments({ namespace }) {
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [scaleDialog, setScaleDialog] = useState({ open: false, deployment: null, replicas: 1 });

  useEffect(() => {
    fetchDeployments();
  }, [namespace]);

  const fetchDeployments = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kubernetes/deployments?namespace=${namespace}`);
      setDeployments(response.data);
    } catch (error) {
      console.error('Failed to fetch deployments:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDeployment = async (ns, name) => {
    if (window.confirm(`Are you sure you want to delete deployment ${name}?`)) {
      try {
        await api.delete(`/kubernetes/deployments/${ns}/${name}`);
        fetchDeployments();
      } catch (error) {
        console.error('Failed to delete deployment:', error);
        alert('Failed to delete deployment: ' + error.message);
      }
    }
  };

  const restartDeployment = async (ns, name) => {
    if (window.confirm(`Are you sure you want to restart deployment ${name}?`)) {
      try {
        await api.post(`/kubernetes/deployments/${ns}/${name}/restart`);
        fetchDeployments();
      } catch (error) {
        console.error('Failed to restart deployment:', error);
        alert('Failed to restart deployment: ' + error.message);
      }
    }
  };

  const openScaleDialog = (deployment) => {
    setScaleDialog({
      open: true,
      deployment,
      replicas: deployment.spec.replicas,
    });
  };

  const scaleDeployment = async () => {
    try {
      await api.patch(
        `/kubernetes/deployments/${scaleDialog.deployment.metadata.namespace}/${scaleDialog.deployment.metadata.name}/scale`,
        { replicas: scaleDialog.replicas }
      );
      setScaleDialog({ open: false, deployment: null, replicas: 1 });
      fetchDeployments();
    } catch (error) {
      console.error('Failed to scale deployment:', error);
      alert('Failed to scale deployment: ' + error.message);
    }
  };

  const filteredDeployments = deployments.filter(dep =>
    dep.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dep.metadata.namespace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatus = (dep) => {
    const ready = dep.status.readyReplicas || 0;
    const desired = dep.spec.replicas || 0;
    if (ready === desired && ready > 0) return 'Available';
    if (ready > 0) return 'Degraded';
    return 'Unavailable';
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
        <Typography variant="h4">Deployments</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search deployments..."
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
            <IconButton onClick={fetchDeployments} sx={{ color: '#8b949e' }}>
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
              <TableCell>Up-to-date</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Age</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeployments.map((dep) => (
              <TableRow
                key={`${dep.metadata.namespace}-${dep.metadata.name}`}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/resource/deployment/${dep.metadata.namespace}/${dep.metadata.name}`)}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {dep.metadata.name}
                  </Typography>
                </TableCell>
                <TableCell>{dep.metadata.namespace}</TableCell>
                <TableCell>
                  <StatusChip status={getStatus(dep)} />
                </TableCell>
                <TableCell>{`${dep.status.readyReplicas || 0}/${dep.spec.replicas || 0}`}</TableCell>
                <TableCell>{dep.status.updatedReplicas || 0}</TableCell>
                <TableCell>{dep.status.availableReplicas || 0}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(dep.metadata.creationTimestamp), { addSuffix: true })}
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Scale">
                    <IconButton size="small" onClick={() => openScaleDialog(dep)}>
                      <ScaleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Restart">
                    <IconButton
                      size="small"
                      onClick={() => restartDeployment(dep.metadata.namespace, dep.metadata.name)}
                    >
                      <RestartIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      onClick={() => deleteDeployment(dep.metadata.namespace, dep.metadata.name)}
                      sx={{ color: '#f85149' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {filteredDeployments.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>
                    No deployments found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Scale Dialog */}
      <Dialog open={scaleDialog.open} onClose={() => setScaleDialog({ open: false, deployment: null, replicas: 1 })}>
        <DialogTitle>Scale Deployment</DialogTitle>
        <DialogContent sx={{ minWidth: 400, pt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {scaleDialog.deployment?.metadata.name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#8b949e', mb: 1 }}>
            Replicas: {scaleDialog.replicas}
          </Typography>
          <Slider
            value={scaleDialog.replicas}
            onChange={(e, value) => setScaleDialog(prev => ({ ...prev, replicas: value }))}
            min={0}
            max={20}
            marks
            valueLabelDisplay="auto"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScaleDialog({ open: false, deployment: null, replicas: 1 })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={scaleDeployment}>
            Scale
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Deployments;
