const k8s = require('@kubernetes/client-node');

class KubernetesClient {
  constructor() {
    this.kc = new k8s.KubeConfig();
    this.initializeConfig();
  }

  initializeConfig() {
    try {
      // Try to load in-cluster config first (when running in Kubernetes)
      this.kc.loadFromCluster();
      console.log('✅ Loaded in-cluster Kubernetes configuration');
    } catch (err) {
      try {
        // Fall back to default kubeconfig (for local development)
        this.kc.loadFromDefault();
        console.log('✅ Loaded default Kubernetes configuration');
      } catch (err2) {
        console.error('❌ Failed to load Kubernetes configuration:', err2.message);
        throw new Error('Could not load Kubernetes configuration');
      }
    }

    // Initialize API clients
    this.coreV1Api = this.kc.makeApiClient(k8s.CoreV1Api);
    this.appsV1Api = this.kc.makeApiClient(k8s.AppsV1Api);
    this.batchV1Api = this.kc.makeApiClient(k8s.BatchV1Api);
    this.networkingV1Api = this.kc.makeApiClient(k8s.NetworkingV1Api);
    this.rbacV1Api = this.kc.makeApiClient(k8s.RbacAuthorizationV1Api);
    this.storageV1Api = this.kc.makeApiClient(k8s.StorageV1Api);
    this.customObjectsApi = this.kc.makeApiClient(k8s.CustomObjectsApi);
    this.metricsClient = new k8s.Metrics(this.kc);
    this.log = new k8s.Log(this.kc);
    this.exec = new k8s.Exec(this.kc);
  }

  getConfig() {
    return this.kc;
  }

  getCurrentContext() {
    return this.kc.getCurrentContext();
  }

  getContexts() {
    return this.kc.getContexts();
  }

  getClusters() {
    return this.kc.getClusters();
  }
}

// Singleton instance
const kubernetesClient = new KubernetesClient();

module.exports = kubernetesClient;
