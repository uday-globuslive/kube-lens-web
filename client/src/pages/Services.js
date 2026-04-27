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
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import api from '../services/api';

function Services({ namespace }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, [namespace]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kubernetes/services?namespace=${namespace}`);
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (ns, name) => {
    if (window.confirm(`Are you sure you want to delete service ${name}?`)) {
      try {
        await api.delete(`/kubernetes/services/${ns}/${name}`);
        fetchServices();
      } catch (error) {
        console.error('Failed to delete service:', error);
        alert('Failed to delete service: ' + error.message);
      }
    }
  };

  const filteredServices = services.filter(svc =>
    svc.metadata.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    svc.metadata.namespace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type) => {
    switch (type) {
      case 'LoadBalancer':
        return { bg: 'rgba(163, 113, 247, 0.15)', color: '#a371f7' };
      case 'NodePort':
        return { bg: 'rgba(210, 153, 34, 0.15)', color: '#d29922' };
      case 'ClusterIP':
        return { bg: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff' };
      default:
        return { bg: 'rgba(139, 148, 158, 0.15)', color: '#8b949e' };
    }
  };

  const getPorts = (svc) => {
    return svc.spec.ports?.map(p => `${p.port}${p.nodePort ? `:${p.nodePort}` : ''}/${p.protocol}`).join(', ') || '-';
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
        <Typography variant="h4">Services</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search services..."
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
            <IconButton onClick={fetchServices} sx={{ color: '#8b949e' }}>
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
              <TableCell>Cluster IP</TableCell>
              <TableCell>External IP</TableCell>
              <TableCell>Ports</TableCell>
              <TableCell>Age</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredServices.map((svc) => {
              const typeColors = getTypeColor(svc.spec.type);
              return (
                <TableRow
                  key={`${svc.metadata.namespace}-${svc.metadata.name}`}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/resource/service/${svc.metadata.namespace}/${svc.metadata.name}`)}
                >
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {svc.metadata.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{svc.metadata.namespace}</TableCell>
                  <TableCell>
                    <Chip
                      label={svc.spec.type}
                      size="small"
                      sx={{ backgroundColor: typeColors.bg, color: typeColors.color, fontWeight: 500 }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{svc.spec.clusterIP}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {svc.status?.loadBalancer?.ingress?.[0]?.ip ||
                      svc.status?.loadBalancer?.ingress?.[0]?.hostname ||
                      svc.spec.externalIPs?.[0] ||
                      '-'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>{getPorts(svc)}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(svc.metadata.creationTimestamp), { addSuffix: true })}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => deleteService(svc.metadata.namespace, svc.metadata.name)}
                        sx={{ color: '#f85149' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredServices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>No services found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default Services;
