import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ViewInAr as PodIcon,
  Rocket as DeploymentIcon,
  Hub as ServiceIcon,
  Description as ConfigMapIcon,
  VpnKey as SecretIcon,
  Storage as NodeIcon,
  FolderSpecial as NamespaceIcon,
  Dns as StatefulSetIcon,
  Memory as DaemonSetIcon,
  PlayArrow as JobIcon,
  Schedule as CronJobIcon,
  Language as IngressIcon,
  Save as PVIcon,
  Event as EventIcon,
} from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { divider: true, label: 'Workloads' },
  { text: 'Pods', icon: <PodIcon />, path: '/pods' },
  { text: 'Deployments', icon: <DeploymentIcon />, path: '/deployments' },
  { text: 'StatefulSets', icon: <StatefulSetIcon />, path: '/statefulsets' },
  { text: 'DaemonSets', icon: <DaemonSetIcon />, path: '/daemonsets' },
  { text: 'Jobs', icon: <JobIcon />, path: '/jobs' },
  { text: 'CronJobs', icon: <CronJobIcon />, path: '/cronjobs' },
  { divider: true, label: 'Network' },
  { text: 'Services', icon: <ServiceIcon />, path: '/services' },
  { text: 'Ingresses', icon: <IngressIcon />, path: '/ingresses' },
  { divider: true, label: 'Config & Storage' },
  { text: 'ConfigMaps', icon: <ConfigMapIcon />, path: '/configmaps' },
  { text: 'Secrets', icon: <SecretIcon />, path: '/secrets' },
  { text: 'Persistent Volumes', icon: <PVIcon />, path: '/persistentvolumes' },
  { divider: true, label: 'Cluster' },
  { text: 'Nodes', icon: <NodeIcon />, path: '/nodes' },
  { text: 'Namespaces', icon: <NamespaceIcon />, path: '/namespaces' },
  { text: 'Events', icon: <EventIcon />, path: '/events' },
];

function Sidebar({ open, drawerWidth }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0d1117',
          borderRight: '1px solid #30363d',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            backgroundColor: '#58a6ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#fff' }}>K</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#e6edf3' }}>
          Kube Lens
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: '#30363d' }} />
      
      <List sx={{ pt: 1 }}>
        {menuItems.map((item, index) => {
          if (item.divider) {
            return (
              <Box key={index} sx={{ px: 2, pt: 2, pb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#8b949e',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          }
          
          return (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: '#1f6feb',
                  '& .MuiListItemIcon-root': {
                    color: '#fff',
                  },
                  '& .MuiListItemText-primary': {
                    color: '#fff',
                  },
                },
                '&:hover': {
                  backgroundColor: '#21262d',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  color: location.pathname === item.path ? '#fff' : '#8b949e',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}

export default Sidebar;
