const express = require('express');
const router = express.Router();
const k8sClient = require('../config/kubernetes');

// Get node metrics
router.get('/nodes', async (req, res) => {
  try {
    const response = await k8sClient.metricsClient.getNodeMetrics();
    res.json(response.items);
  } catch (error) {
    // Metrics server might not be installed
    if (error.statusCode === 404 || error.message.includes('not found')) {
      res.json({ error: 'Metrics server not available', items: [] });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get pod metrics
router.get('/pods', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.metricsClient.getPodMetrics(namespace);
    } else {
      // Get metrics for all namespaces
      const namespaces = await k8sClient.coreV1Api.listNamespace();
      const allMetrics = [];
      
      for (const ns of namespaces.body.items) {
        try {
          const metrics = await k8sClient.metricsClient.getPodMetrics(ns.metadata.name);
          allMetrics.push(...metrics.items.map(m => ({ ...m, namespace: ns.metadata.name })));
        } catch (e) {
          // Skip namespaces with no metrics
        }
      }
      
      res.json(allMetrics);
      return;
    }
    
    res.json(response.items);
  } catch (error) {
    if (error.statusCode === 404 || error.message.includes('not found')) {
      res.json({ error: 'Metrics server not available', items: [] });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Get cluster resource summary
router.get('/summary', async (req, res) => {
  try {
    // Get node count and status
    const nodesResponse = await k8sClient.coreV1Api.listNode();
    const nodes = nodesResponse.body.items;
    
    // Get all pods
    const podsResponse = await k8sClient.coreV1Api.listPodForAllNamespaces();
    const pods = podsResponse.body.items;
    
    // Get all deployments
    const deploymentsResponse = await k8sClient.appsV1Api.listDeploymentForAllNamespaces();
    const deployments = deploymentsResponse.body.items;
    
    // Get all services
    const servicesResponse = await k8sClient.coreV1Api.listServiceForAllNamespaces();
    const services = servicesResponse.body.items;
    
    // Get namespaces
    const namespacesResponse = await k8sClient.coreV1Api.listNamespace();
    const namespaces = namespacesResponse.body.items;
    
    // Calculate pod status summary
    const podStatus = {
      running: pods.filter(p => p.status.phase === 'Running').length,
      pending: pods.filter(p => p.status.phase === 'Pending').length,
      failed: pods.filter(p => p.status.phase === 'Failed').length,
      succeeded: pods.filter(p => p.status.phase === 'Succeeded').length,
      unknown: pods.filter(p => p.status.phase === 'Unknown').length
    };
    
    // Calculate node status
    const nodeStatus = {
      ready: nodes.filter(n => 
        n.status.conditions.some(c => c.type === 'Ready' && c.status === 'True')
      ).length,
      notReady: nodes.filter(n => 
        n.status.conditions.some(c => c.type === 'Ready' && c.status !== 'True')
      ).length
    };
    
    // Calculate deployment health
    const deploymentHealth = {
      healthy: deployments.filter(d => 
        d.status.readyReplicas === d.spec.replicas
      ).length,
      degraded: deployments.filter(d => 
        d.status.readyReplicas > 0 && d.status.readyReplicas < d.spec.replicas
      ).length,
      unavailable: deployments.filter(d => 
        !d.status.readyReplicas || d.status.readyReplicas === 0
      ).length
    };
    
    res.json({
      nodes: {
        total: nodes.length,
        ...nodeStatus
      },
      pods: {
        total: pods.length,
        ...podStatus
      },
      deployments: {
        total: deployments.length,
        ...deploymentHealth
      },
      services: {
        total: services.length
      },
      namespaces: {
        total: namespaces.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
