const express = require('express');
const router = express.Router();
const k8sClient = require('../config/kubernetes');

// Get cluster info
router.get('/cluster', async (req, res) => {
  try {
    const contexts = k8sClient.getContexts();
    const currentContext = k8sClient.getCurrentContext();
    const clusters = k8sClient.getClusters();
    
    res.json({
      currentContext,
      contexts,
      clusters
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NAMESPACES ====================
router.get('/namespaces', async (req, res) => {
  try {
    const response = await k8sClient.coreV1Api.listNamespace();
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/namespaces', async (req, res) => {
  try {
    const { name, labels } = req.body;
    const namespace = {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: { name, labels }
    };
    const response = await k8sClient.coreV1Api.createNamespace(namespace);
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/namespaces/:name', async (req, res) => {
  try {
    await k8sClient.coreV1Api.deleteNamespace(req.params.name);
    res.json({ message: `Namespace ${req.params.name} deleted` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PODS ====================
router.get('/pods', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.coreV1Api.listNamespacedPod(namespace);
    } else {
      response = await k8sClient.coreV1Api.listPodForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/pods/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const response = await k8sClient.coreV1Api.readNamespacedPod(name, namespace);
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/pods/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    await k8sClient.coreV1Api.deleteNamespacedPod(name, namespace);
    res.json({ message: `Pod ${name} deleted from ${namespace}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEPLOYMENTS ====================
router.get('/deployments', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.appsV1Api.listNamespacedDeployment(namespace);
    } else {
      response = await k8sClient.appsV1Api.listDeploymentForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/deployments/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const response = await k8sClient.appsV1Api.readNamespacedDeployment(name, namespace);
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/deployments/:namespace/:name/scale', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const { replicas } = req.body;
    
    const patch = { spec: { replicas: parseInt(replicas) } };
    const response = await k8sClient.appsV1Api.patchNamespacedDeployment(
      name, namespace, patch,
      undefined, undefined, undefined, undefined,
      { headers: { 'Content-Type': 'application/merge-patch+json' } }
    );
    
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/deployments/:namespace/:name/restart', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    
    const patch = {
      spec: {
        template: {
          metadata: {
            annotations: {
              'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
            }
          }
        }
      }
    };
    
    const response = await k8sClient.appsV1Api.patchNamespacedDeployment(
      name, namespace, patch,
      undefined, undefined, undefined, undefined,
      { headers: { 'Content-Type': 'application/strategic-merge-patch+json' } }
    );
    
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/deployments/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    await k8sClient.appsV1Api.deleteNamespacedDeployment(name, namespace);
    res.json({ message: `Deployment ${name} deleted from ${namespace}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SERVICES ====================
router.get('/services', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.coreV1Api.listNamespacedService(namespace);
    } else {
      response = await k8sClient.coreV1Api.listServiceForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/services/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const response = await k8sClient.coreV1Api.readNamespacedService(name, namespace);
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/services/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    await k8sClient.coreV1Api.deleteNamespacedService(name, namespace);
    res.json({ message: `Service ${name} deleted from ${namespace}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CONFIGMAPS ====================
router.get('/configmaps', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.coreV1Api.listNamespacedConfigMap(namespace);
    } else {
      response = await k8sClient.coreV1Api.listConfigMapForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/configmaps/:namespace/:name', async (req, res) => {
  try {
    const { namespace, name } = req.params;
    const response = await k8sClient.coreV1Api.readNamespacedConfigMap(name, namespace);
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== SECRETS ====================
router.get('/secrets', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.coreV1Api.listNamespacedSecret(namespace);
    } else {
      response = await k8sClient.coreV1Api.listSecretForAllNamespaces();
    }
    
    // Don't expose actual secret data in list view
    const secrets = response.body.items.map(secret => ({
      ...secret,
      data: Object.keys(secret.data || {}).reduce((acc, key) => {
        acc[key] = '***hidden***';
        return acc;
      }, {})
    }));
    
    res.json(secrets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STATEFULSETS ====================
router.get('/statefulsets', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.appsV1Api.listNamespacedStatefulSet(namespace);
    } else {
      response = await k8sClient.appsV1Api.listStatefulSetForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== DAEMONSETS ====================
router.get('/daemonsets', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.appsV1Api.listNamespacedDaemonSet(namespace);
    } else {
      response = await k8sClient.appsV1Api.listDaemonSetForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== REPLICASETS ====================
router.get('/replicasets', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.appsV1Api.listNamespacedReplicaSet(namespace);
    } else {
      response = await k8sClient.appsV1Api.listReplicaSetForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== JOBS ====================
router.get('/jobs', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.batchV1Api.listNamespacedJob(namespace);
    } else {
      response = await k8sClient.batchV1Api.listJobForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== CRONJOBS ====================
router.get('/cronjobs', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.batchV1Api.listNamespacedCronJob(namespace);
    } else {
      response = await k8sClient.batchV1Api.listCronJobForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== INGRESSES ====================
router.get('/ingresses', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.networkingV1Api.listNamespacedIngress(namespace);
    } else {
      response = await k8sClient.networkingV1Api.listIngressForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PERSISTENT VOLUMES ====================
router.get('/persistentvolumes', async (req, res) => {
  try {
    const response = await k8sClient.coreV1Api.listPersistentVolume();
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== PERSISTENT VOLUME CLAIMS ====================
router.get('/persistentvolumeclaims', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.coreV1Api.listNamespacedPersistentVolumeClaim(namespace);
    } else {
      response = await k8sClient.coreV1Api.listPersistentVolumeClaimForAllNamespaces();
    }
    
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== STORAGE CLASSES ====================
router.get('/storageclasses', async (req, res) => {
  try {
    const response = await k8sClient.storageV1Api.listStorageClass();
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== NODES ====================
router.get('/nodes', async (req, res) => {
  try {
    const response = await k8sClient.coreV1Api.listNode();
    res.json(response.body.items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/nodes/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const response = await k8sClient.coreV1Api.readNode(name);
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== EVENTS ====================
router.get('/events', async (req, res) => {
  try {
    const { namespace } = req.query;
    let response;
    
    if (namespace && namespace !== 'all') {
      response = await k8sClient.coreV1Api.listNamespacedEvent(namespace);
    } else {
      response = await k8sClient.coreV1Api.listEventForAllNamespaces();
    }
    
    // Sort by last timestamp descending
    const events = response.body.items.sort((a, b) => {
      const timeA = new Date(a.lastTimestamp || a.eventTime || 0);
      const timeB = new Date(b.lastTimestamp || b.eventTime || 0);
      return timeB - timeA;
    });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RESOURCE YAML ====================
router.get('/yaml/:kind/:namespace/:name', async (req, res) => {
  try {
    const { kind, namespace, name } = req.params;
    let response;
    
    switch (kind.toLowerCase()) {
      case 'pod':
        response = await k8sClient.coreV1Api.readNamespacedPod(name, namespace);
        break;
      case 'deployment':
        response = await k8sClient.appsV1Api.readNamespacedDeployment(name, namespace);
        break;
      case 'service':
        response = await k8sClient.coreV1Api.readNamespacedService(name, namespace);
        break;
      case 'configmap':
        response = await k8sClient.coreV1Api.readNamespacedConfigMap(name, namespace);
        break;
      case 'secret':
        response = await k8sClient.coreV1Api.readNamespacedSecret(name, namespace);
        break;
      case 'statefulset':
        response = await k8sClient.appsV1Api.readNamespacedStatefulSet(name, namespace);
        break;
      case 'daemonset':
        response = await k8sClient.appsV1Api.readNamespacedDaemonSet(name, namespace);
        break;
      case 'ingress':
        response = await k8sClient.networkingV1Api.readNamespacedIngress(name, namespace);
        break;
      default:
        return res.status(400).json({ error: `Unknown resource kind: ${kind}` });
    }
    
    res.json(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
