import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Tabs, Tab, CircularProgress, IconButton, Tooltip, Chip, Button,
} from '@mui/material';
import { ArrowBack, Refresh as RefreshIcon } from '@mui/icons-material';
import YAML from 'yaml';
import { formatDistanceToNow } from 'date-fns';
import StatusChip from '../components/StatusChip';
import api from '../services/api';

function ResourceDetail() {
  const { kind, namespace, name } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [logs, setLogs] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    fetchResource();
  }, [kind, namespace, name]);

  const fetchResource = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/kubernetes/yaml/${kind}/${namespace}/${name}`);
      setResource(response.data);
      if (kind === 'pod') {
        fetchLogs();
      }
    } catch (error) {
      console.error('Failed to fetch resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const container = resource?.spec?.containers?.[0]?.name;
      const response = await api.get(`/logs/${namespace}/${name}?container=${container}&tailLines=500`);
      setLogs(response.data);
    } catch (error) {
      setLogs(`Error fetching logs: ${error.message}`);
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!resource) {
    return (
      <Box>
        <Typography>Resource not found</Typography>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  const getStatus = () => {
    if (kind === 'pod') return resource.status?.phase;
    if (kind === 'deployment') {
      const ready = resource.status?.readyReplicas || 0;
      const desired = resource.spec?.replicas || 0;
      return ready === desired ? 'Available' : ready > 0 ? 'Degraded' : 'Unavailable';
    }
    return 'Active';
  };

  const renderOverview = () => (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Metadata</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Name</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{resource.metadata.name}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Namespace</Typography>
            <Typography variant="body2">{resource.metadata.namespace}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">UID</Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
              {resource.metadata.uid}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Created</Typography>
            <Typography variant="body2">
              {formatDistanceToNow(new Date(resource.metadata.creationTimestamp), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {resource.metadata.labels && Object.keys(resource.metadata.labels).length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Labels</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Object.entries(resource.metadata.labels).map(([key, value]) => (
              <Chip
                key={key}
                label={`${key}: ${value}`}
                size="small"
                sx={{ backgroundColor: 'rgba(88, 166, 255, 0.15)', color: '#58a6ff', fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {resource.metadata.annotations && Object.keys(resource.metadata.annotations).length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Annotations</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(resource.metadata.annotations).map(([key, value]) => (
              <Box key={key}>
                <Typography variant="caption" color="text.secondary">{key}</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {kind === 'pod' && resource.spec?.containers && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Containers</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {resource.spec.containers.map((container, idx) => (
              <Paper key={idx} sx={{ p: 2, backgroundColor: '#0d1117' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>{container.name}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Image</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                      {container.image}
                    </Typography>
                  </Box>
                  {container.ports?.length > 0 && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">Ports</Typography>
                      <Typography variant="body2">
                        {container.ports.map(p => `${p.containerPort}/${p.protocol || 'TCP'}`).join(', ')}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );

  const renderYaml = () => (
    <Paper sx={{ p: 2 }}>
      <Box
        component="pre"
        sx={{
          backgroundColor: '#0d1117',
          p: 2,
          borderRadius: 1,
          overflow: 'auto',
          maxHeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.8rem',
          whiteSpace: 'pre-wrap',
          m: 0,
        }}
      >
        {YAML.stringify(resource, null, 2)}
      </Box>
    </Paper>
  );

  const renderLogs = () => (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button onClick={fetchLogs} disabled={logsLoading} startIcon={<RefreshIcon />}>
          Refresh Logs
        </Button>
      </Box>
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
            maxHeight: 600,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.75rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            m: 0,
          }}
        >
          {logs || 'No logs available'}
        </Box>
      )}
    </Paper>
  );

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Tooltip title="Go Back">
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#8b949e' }}>
            <ArrowBack />
          </IconButton>
        </Tooltip>
        <Box>
          <Typography variant="caption" sx={{ color: '#8b949e', textTransform: 'uppercase' }}>
            {kind}
          </Typography>
          <Typography variant="h4">{resource.metadata.name}</Typography>
        </Box>
        <StatusChip status={getStatus()} />
        <Box sx={{ ml: 'auto' }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchResource} sx={{ color: '#8b949e' }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="YAML" />
        {kind === 'pod' && <Tab label="Logs" />}
      </Tabs>

      {tab === 0 && renderOverview()}
      {tab === 1 && renderYaml()}
      {tab === 2 && kind === 'pod' && renderLogs()}
    </Box>
  );
}

export default ResourceDetail;
