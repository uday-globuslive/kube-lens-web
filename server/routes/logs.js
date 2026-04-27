const express = require('express');
const router = express.Router();
const k8sClient = require('../config/kubernetes');
const stream = require('stream');

// Get pod logs
router.get('/:namespace/:podName', async (req, res) => {
  try {
    const { namespace, podName } = req.params;
    const { container, tailLines = 100, previous = false } = req.query;
    
    const options = {
      tailLines: parseInt(tailLines),
      previous: previous === 'true'
    };
    
    if (container) {
      options.container = container;
    }
    
    const response = await k8sClient.coreV1Api.readNamespacedPodLog(
      podName,
      namespace,
      container,
      false, // follow
      undefined, // insecureSkipTLSVerifyBackend
      undefined, // limitBytes
      undefined, // pretty
      previous === 'true',
      undefined, // sinceSeconds
      parseInt(tailLines),
      undefined // timestamps
    );
    
    res.type('text/plain').send(response.body);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// WebSocket endpoint for streaming logs
router.ws('/:namespace/:podName/stream', async (ws, req) => {
  const { namespace, podName } = req.params;
  const { container } = req.query;
  
  let logStream = null;
  
  try {
    const logOptions = {
      follow: true,
      tailLines: 50,
      pretty: false,
      timestamps: true
    };
    
    if (container) {
      logOptions.container = container;
    }
    
    logStream = new stream.PassThrough();
    
    await k8sClient.log.log(
      namespace,
      podName,
      container || undefined,
      logStream,
      logOptions
    );
    
    logStream.on('data', (chunk) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(chunk.toString());
      }
    });
    
    logStream.on('error', (err) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ error: err.message }));
      }
    });
    
    logStream.on('end', () => {
      if (ws.readyState === ws.OPEN) {
        ws.close();
      }
    });
    
  } catch (error) {
    ws.send(JSON.stringify({ error: error.message }));
    ws.close();
  }
  
  ws.on('close', () => {
    if (logStream) {
      logStream.destroy();
    }
  });
  
  ws.on('error', () => {
    if (logStream) {
      logStream.destroy();
    }
  });
});

module.exports = router;
