import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Box,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Cloud as ClusterIcon,
} from '@mui/icons-material';

function TopBar({ 
  sidebarOpen, 
  setSidebarOpen, 
  namespaces, 
  selectedNamespace, 
  setSelectedNamespace 
}) {
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#161b22',
        borderBottom: '1px solid #30363d',
        boxShadow: 'none',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="toggle sidebar"
          edge="start"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <ClusterIcon sx={{ color: '#3fb950' }} />
          <Chip
            label="Connected"
            size="small"
            sx={{
              backgroundColor: 'rgba(63, 185, 80, 0.15)',
              color: '#3fb950',
              fontWeight: 500,
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#8b949e' }}>
            Namespace:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={selectedNamespace}
              onChange={(e) => setSelectedNamespace(e.target.value)}
              sx={{
                backgroundColor: '#21262d',
                color: '#e6edf3',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#30363d',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#484f58',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#58a6ff',
                },
                '.MuiSvgIcon-root': {
                  color: '#8b949e',
                },
              }}
            >
              <MenuItem value="all">All Namespaces</MenuItem>
              {namespaces.map((ns) => (
                <MenuItem key={ns.metadata.name} value={ns.metadata.name}>
                  {ns.metadata.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
