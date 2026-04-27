import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './pages/Dashboard';
import Pods from './pages/Pods';
import Deployments from './pages/Deployments';
import Services from './pages/Services';
import ConfigMaps from './pages/ConfigMaps';
import Secrets from './pages/Secrets';
import Nodes from './pages/Nodes';
import Namespaces from './pages/Namespaces';
import StatefulSets from './pages/StatefulSets';
import DaemonSets from './pages/DaemonSets';
import Jobs from './pages/Jobs';
import CronJobs from './pages/CronJobs';
import Ingresses from './pages/Ingresses';
import PersistentVolumes from './pages/PersistentVolumes';
import Events from './pages/Events';
import ResourceDetail from './pages/ResourceDetail';
import api from './services/api';

const drawerWidth = 240;

function App() {
  const [namespaces, setNamespaces] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchNamespaces();
  }, []);

  const fetchNamespaces = async () => {
    try {
      const response = await api.get('/kubernetes/namespaces');
      setNamespaces(response.data);
    } catch (error) {
      console.error('Failed to fetch namespaces:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <TopBar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        namespaces={namespaces}
        selectedNamespace={selectedNamespace}
        setSelectedNamespace={setSelectedNamespace}
      />
      <Sidebar open={sidebarOpen} drawerWidth={drawerWidth} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          ml: { sm: sidebarOpen ? `${drawerWidth}px` : 0 },
          transition: 'margin 0.3s ease',
          backgroundColor: 'background.default',
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<Dashboard namespace={selectedNamespace} />} />
          <Route path="/pods" element={<Pods namespace={selectedNamespace} />} />
          <Route path="/deployments" element={<Deployments namespace={selectedNamespace} />} />
          <Route path="/services" element={<Services namespace={selectedNamespace} />} />
          <Route path="/configmaps" element={<ConfigMaps namespace={selectedNamespace} />} />
          <Route path="/secrets" element={<Secrets namespace={selectedNamespace} />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/namespaces" element={<Namespaces onRefresh={fetchNamespaces} />} />
          <Route path="/statefulsets" element={<StatefulSets namespace={selectedNamespace} />} />
          <Route path="/daemonsets" element={<DaemonSets namespace={selectedNamespace} />} />
          <Route path="/jobs" element={<Jobs namespace={selectedNamespace} />} />
          <Route path="/cronjobs" element={<CronJobs namespace={selectedNamespace} />} />
          <Route path="/ingresses" element={<Ingresses namespace={selectedNamespace} />} />
          <Route path="/persistentvolumes" element={<PersistentVolumes namespace={selectedNamespace} />} />
          <Route path="/events" element={<Events namespace={selectedNamespace} />} />
          <Route path="/resource/:kind/:namespace/:name" element={<ResourceDetail />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
