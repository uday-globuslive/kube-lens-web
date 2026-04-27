import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  ViewInAr as PodIcon,
  Rocket as DeploymentIcon,
  Hub as ServiceIcon,
  Storage as NodeIcon,
  FolderSpecial as NamespaceIcon,
  CheckCircle as HealthyIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../services/api';

const COLORS = {
  success: '#3fb950',
  warning: '#d29922',
  error: '#f85149',
  info: '#58a6ff',
  muted: '#8b949e',
};

function StatCard({ title, value, icon, subtitle, color = '#58a6ff' }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#8b949e', mb: 0.5, display: 'block' }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 600, color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#8b949e', mt: 1, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function Dashboard({ namespace }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [namespace]);

  const fetchData = async () => {
    try {
      const [summaryRes, eventsRes] = await Promise.all([
        api.get('/metrics/summary'),
        api.get(`/kubernetes/events?namespace=${namespace}`),
      ]);
      setSummary(summaryRes.data);
      setEvents(eventsRes.data.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  const podData = summary ? [
    { name: 'Running', value: summary.pods.running, color: COLORS.success },
    { name: 'Pending', value: summary.pods.pending, color: COLORS.warning },
    { name: 'Failed', value: summary.pods.failed, color: COLORS.error },
    { name: 'Succeeded', value: summary.pods.succeeded, color: COLORS.info },
  ].filter(d => d.value > 0) : [];

  const deploymentData = summary ? [
    { name: 'Healthy', value: summary.deployments.healthy, color: COLORS.success },
    { name: 'Degraded', value: summary.deployments.degraded, color: COLORS.warning },
    { name: 'Unavailable', value: summary.deployments.unavailable, color: COLORS.error },
  ].filter(d => d.value > 0) : [];

  return (
    <Box className="fade-in">
      <Typography variant="h4" sx={{ mb: 3 }}>
        Cluster Overview
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Nodes"
            value={summary?.nodes.total || 0}
            icon={<NodeIcon />}
            subtitle={`${summary?.nodes.ready || 0} ready`}
            color={COLORS.info}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Namespaces"
            value={summary?.namespaces.total || 0}
            icon={<NamespaceIcon />}
            color="#a371f7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Pods"
            value={summary?.pods.total || 0}
            icon={<PodIcon />}
            subtitle={`${summary?.pods.running || 0} running`}
            color={COLORS.success}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Deployments"
            value={summary?.deployments.total || 0}
            icon={<DeploymentIcon />}
            subtitle={`${summary?.deployments.healthy || 0} healthy`}
            color={COLORS.warning}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Services"
            value={summary?.services.total || 0}
            icon={<ServiceIcon />}
            color={COLORS.info}
          />
        </Grid>

        {/* Pod Status Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Pod Status Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={podData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {podData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Deployment Health Chart */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: 350 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Deployment Health
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deploymentData} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#8b949e' }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#8b949e' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {deploymentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Events */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Events
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {events.length === 0 ? (
                  <Typography variant="body2" sx={{ color: '#8b949e' }}>
                    No recent events
                  </Typography>
                ) : (
                  events.map((event, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 2,
                        backgroundColor: '#0d1117',
                        borderLeft: `3px solid ${
                          event.type === 'Warning' ? COLORS.warning :
                          event.type === 'Error' ? COLORS.error : COLORS.info
                        }`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        {event.type === 'Warning' && <WarningIcon sx={{ fontSize: 16, color: COLORS.warning }} />}
                        {event.type === 'Error' && <ErrorIcon sx={{ fontSize: 16, color: COLORS.error }} />}
                        {event.type === 'Normal' && <HealthyIcon sx={{ fontSize: 16, color: COLORS.info }} />}
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {event.involvedObject?.kind}: {event.involvedObject?.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#8b949e', ml: 'auto' }}>
                          {event.metadata?.namespace}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#8b949e' }}>
                        {event.message}
                      </Typography>
                    </Paper>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
