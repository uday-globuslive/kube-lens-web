const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const expressWs = require('express-ws');

const kubernetesRoutes = require('./routes/kubernetes');
const metricsRoutes = require('./routes/metrics');
const logsRoutes = require('./routes/logs');

const app = express();
expressWs(app);

const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// API Routes
app.use('/api/kubernetes', kubernetesRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/logs', logsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Kube Lens Web server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
