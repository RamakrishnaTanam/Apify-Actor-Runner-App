const express = require('express');
const router = express.Router();

const APIFY_BASE_URL = 'https://api.apify.com/v2';

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (!apiKey) {
    return res.status(401).json({ error: { message: 'API key is required' } });
  }
  req.apiKey = apiKey;
  next();
};

// Helper function to make Apify API requests
const makeApifyRequest = async (endpoint, apiKey, options = {}) => {
  const url = `${APIFY_BASE_URL}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      // Use default error message if parsing fails
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    throw error;
  }

  return response.json();
};

// Get user's actors
router.get('/actors', validateApiKey, async (req, res, next) => {
  try {
    const response = await makeApifyRequest('/acts?my=true&limit=100', req.apiKey);
    
    const actors = response.data.items.map((actor) => ({
      id: actor.id,
      name: actor.name,
      title: actor.title || actor.name,
      description: actor.description || 'No description available',
      stats: actor.stats || { totalRuns: 0 }
    }));

    res.json({ data: actors });
  } catch (error) {
    next(error);
  }
});

// Get actor schema
router.get('/actors/:actorId/schema', validateApiKey, async (req, res, next) => {
  try {
    const { actorId } = req.params;
    const response = await makeApifyRequest(`/acts/${actorId}`, req.apiKey);
    
    const inputSchema = response.data.defaultRunOptions?.inputSchema;
    
    if (!inputSchema) {
      return res.status(404).json({ 
        error: { message: 'No input schema found for this actor' } 
      });
    }

    res.json({ data: inputSchema });
  } catch (error) {
    next(error);
  }
});

// Run actor
router.post('/actors/:actorId/runs', validateApiKey, async (req, res, next) => {
  try {
    const { actorId } = req.params;
    const input = req.body;

    const response = await makeApifyRequest(`/acts/${actorId}/runs`, req.apiKey, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    
    res.json({ data: { runId: response.data.id } });
  } catch (error) {
    next(error);
  }
});

// Get run details
router.get('/runs/:runId', validateApiKey, async (req, res, next) => {
  try {
    const { runId } = req.params;
    const response = await makeApifyRequest(`/actor-runs/${runId}`, req.apiKey);
    
    res.json({ data: response.data });
  } catch (error) {
    next(error);
  }
});

// Get run dataset
router.get('/runs/:runId/dataset', validateApiKey, async (req, res, next) => {
  try {
    const { runId } = req.params;
    
    // First get the run to find the dataset ID
    const runResponse = await makeApifyRequest(`/actor-runs/${runId}`, req.apiKey);
    const datasetId = runResponse.data.defaultDatasetId;
    
    if (!datasetId) {
      return res.json({ data: [] });
    }

    // Then get the dataset items
    const datasetResponse = await makeApifyRequest(
      `/datasets/${datasetId}/items?format=json`, 
      req.apiKey
    );
    
    res.json({ data: datasetResponse });
  } catch (error) {
    // If dataset fetch fails, return empty array instead of error
    console.warn('Failed to fetch dataset:', error.message);
    res.json({ data: [] });
  }
});

// Wait for run completion (polling endpoint)
router.get('/runs/:runId/wait', validateApiKey, async (req, res, next) => {
  try {
    const { runId } = req.params;
    const maxWaitTime = 300000; // 5 minutes
    const pollInterval = 2000; // 2 seconds
    const startTime = Date.now();

    const pollRun = async () => {
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Run timed out - taking longer than expected');
      }

      const runResponse = await makeApifyRequest(`/actor-runs/${runId}`, req.apiKey);
      const run = runResponse.data;
      
      if (run.status === 'SUCCEEDED') {
        // Get dataset
        let dataset = [];
        try {
          if (run.defaultDatasetId) {
            const datasetResponse = await makeApifyRequest(
              `/datasets/${run.defaultDatasetId}/items?format=json`, 
              req.apiKey
            );
            dataset = datasetResponse;
          }
        } catch (error) {
          console.warn('Failed to fetch dataset:', error.message);
        }

        return {
          status: run.status,
          finishedAt: run.finishedAt,
          stats: run.stats,
          dataset,
          run
        };
      } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(run.status)) {
        throw new Error(`Actor run ${run.status.toLowerCase()}: ${run.statusMessage || 'No error message available'}`);
      }

      // Still running, wait and try again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      return pollRun();
    };

    const result = await pollRun();
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;