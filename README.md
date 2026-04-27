# Kube Lens Web

A web-based Kubernetes management dashboard similar to Lens, designed to run inside your Kubernetes cluster and be accessible via a web browser.

![Kube Lens Web](https://img.shields.io/badge/Kubernetes-Dashboard-blue)

## Features

- **Dashboard Overview**: Cluster health, resource summaries, and recent events
- **Workload Management**:
  - Pods (view logs, delete, details)
  - Deployments (scale, restart, delete)
  - StatefulSets, DaemonSets
  - Jobs, CronJobs
- **Network Resources**:
  - Services
  - Ingresses
- **Configuration**:
  - ConfigMaps
  - Secrets (values hidden by default)
- **Storage**:
  - Persistent Volumes
  - Persistent Volume Claims
- **Cluster Resources**:
  - Nodes (status, capacity)
  - Namespaces (create, delete)
  - Events

## Quick Start

### Prerequisites

- Node.js 18+ (for local development)
- Docker (for containerized deployment)
- kubectl configured with cluster access
- Kubernetes cluster

### Local Development

```bash
# Install dependencies
npm run install-all

# Start development servers (backend + frontend)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Docker Build

```bash
# Build the Docker image
docker build -t kube-lens-web:latest .

# Run with Docker (mount your kubeconfig)
docker run -p 3001:3001 -v ~/.kube:/home/nodeapp/.kube:ro kube-lens-web:latest
```

### Deploy to Kubernetes

```bash
# Build and push the image to your registry
docker build -t your-registry/kube-lens-web:latest .
docker push your-registry/kube-lens-web:latest

# Update the image in k8s/deployment.yaml
# Then deploy using kubectl
kubectl apply -k k8s/

# Or apply individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

### Access the Application

**Via NodePort:**
```bash
# Access via NodePort (default: 30080)
http://<node-ip>:30080
```

**Via Port Forward:**
```bash
kubectl port-forward -n kube-lens-web svc/kube-lens-web 8080:80
# Access at http://localhost:8080
```

**Via Ingress:**
```bash
# Add to /etc/hosts
<ingress-ip> kube-lens.local
# Access at http://kube-lens.local
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Browser                           │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Kube Lens Web Pod                      │
│  ┌────────────────────────────────────────────────┐ │
│  │              React Frontend                    │ │
│  │         (Static files served by Express)       │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │           Node.js/Express Backend              │ │
│  │          (Kubernetes API Client)               │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              Kubernetes API Server                  │
└─────────────────────────────────────────────────────┘
```

## Project Structure

```
kube-lens-web/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   ├── App.js
│   │   ├── theme.js        # MUI theme
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/
│   │   └── kubernetes.js   # K8s client configuration
│   ├── routes/
│   │   ├── kubernetes.js   # K8s resource routes
│   │   ├── metrics.js      # Metrics routes
│   │   └── logs.js         # Pod logs routes
│   └── index.js            # Express server
├── k8s/                    # Kubernetes manifests
│   ├── namespace.yaml
│   ├── rbac.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   └── kustomization.yaml
├── Dockerfile              # Production build
├── Dockerfile.dev          # Development build
├── docker-compose.yaml
└── package.json
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3001` | Server port |

### RBAC Permissions

The application requires the following permissions:
- **Read/Write**: Pods, Deployments, Services, ConfigMaps, Secrets, etc.
- **Read Only**: Nodes, Events, Storage Classes

See `k8s/rbac.yaml` for full permissions list.

## Security Considerations

1. **Authentication**: This basic version doesn't include authentication. Consider adding:
   - OAuth2 / OIDC integration
   - Basic auth
   - Kubernetes RBAC proxy

2. **Network Policies**: Restrict access to the dashboard namespace

3. **TLS**: Enable TLS in the Ingress configuration

4. **RBAC**: Customize the ClusterRole permissions based on your needs

## Development

### Adding New Features

1. **Backend Route**: Add new route in `server/routes/`
2. **Frontend Page**: Add new page in `client/src/pages/`
3. **Navigation**: Update sidebar in `client/src/components/Sidebar.js`

### Building for Production

```bash
# Build React frontend
npm run build

# Start production server
NODE_ENV=production npm start
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
