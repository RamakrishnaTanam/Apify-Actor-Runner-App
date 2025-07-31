export class ApifyClient {
  private apiKey: string;
  private baseUrl = 'https://api.apify.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
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

      throw new Error(errorMessage);
    }

    return response.json();
  }

  async getActors() {
    try {
      const response = await this.makeRequest('/acts?my=true&limit=100');
      return response.data.items.map((actor: any) => ({
        id: actor.id,
        name: actor.name,
        title: actor.title || actor.name,
        description: actor.description || 'No description available',
        stats: actor.stats || { totalRuns: 0 }
      }));
    } catch (error) {
      throw new Error(`Failed to fetch actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActorSchema(actorId: string) {
    try {
      const response = await this.makeRequest(`/acts/${actorId}`);
      const inputSchema = response.data.defaultRunOptions?.inputSchema;
      
      if (!inputSchema) {
        throw new Error('No input schema found for this actor');
      }

      return inputSchema;
    } catch (error) {
      throw new Error(`Failed to fetch actor schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async runActor(actorId: string, input: any) {
    try {
      const response = await this.makeRequest(`/acts/${actorId}/runs`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      
      return response.data.id;
    } catch (error) {
      throw new Error(`Failed to start actor run: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRun(runId: string) {
    try {
      const response = await this.makeRequest(`/actor-runs/${runId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch run details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRunDataset(runId: string) {
    try {
      const run = await this.getRun(runId);
      const datasetId = run.defaultDatasetId;
      
      if (!datasetId) {
        return [];
      }

      const response = await this.makeRequest(`/datasets/${datasetId}/items?format=json`);
      return response;
    } catch (error) {
      console.warn('Failed to fetch dataset:', error);
      return [];
    }
  }

  async waitForRun(runId: string, maxWaitTime = 300000) { // 5 minutes max
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const run = await this.getRun(runId);
      
      if (run.status === 'SUCCEEDED') {
        const dataset = await this.getRunDataset(runId);
        return {
          status: run.status,
          finishedAt: run.finishedAt,
          stats: run.stats,
          dataset,
          run
        };
      } else if (run.status === 'FAILED' || run.status === 'ABORTED' || run.status === 'TIMED-OUT') {
        throw new Error(`Actor run ${run.status.toLowerCase()}: ${run.statusMessage || 'No error message available'}`);
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Actor run timed out - taking longer than expected');
  }
}