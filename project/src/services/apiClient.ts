const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new ApiError(errorMessage, response.status);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred',
        0
      );
    }
  }

  async getActors() {
    try {
      const response = await this.makeRequest('/apify/actors');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch actors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getActorSchema(actorId: string) {
    try {
      const response = await this.makeRequest(`/apify/actors/${actorId}/schema`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch actor schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async runActor(actorId: string, input: any) {
    try {
      const response = await this.makeRequest(`/apify/actors/${actorId}/runs`, {
        method: 'POST',
        body: JSON.stringify(input),
      });
      
      return response.data.runId;
    } catch (error) {
      throw new Error(`Failed to start actor run: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRun(runId: string) {
    try {
      const response = await this.makeRequest(`/apify/runs/${runId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch run details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getRunDataset(runId: string) {
    try {
      const response = await this.makeRequest(`/apify/runs/${runId}/dataset`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch dataset:', error);
      return [];
    }
  }

  async waitForRun(runId: string) {
    try {
      const response = await this.makeRequest(`/apify/runs/${runId}/wait`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to wait for run completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}