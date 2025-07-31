import React, { useState, useEffect } from 'react';
import { Key, Play, RefreshCw, CheckCircle, XCircle, AlertTriangle, Search, Clock } from 'lucide-react';
import { ApiClient } from './services/apiClient';
import { ActorSelector } from './components/ActorSelector';
import { SchemaForm } from './components/SchemaForm';
import { ExecutionResults } from './components/ExecutionResults';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { SuccessMessage } from './components/SuccessMessage';

interface Actor {
  id: string;
  name: string;
  title: string;
  description: string;
  stats: {
    totalRuns: number;
  };
}

interface ExecutionState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  runId?: string;
  results?: any;
  error?: string;
  startTime?: Date;
}

function App() {
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [actorSchema, setActorSchema] = useState<any>(null);
  const [isLoadingActors, setIsLoadingActors] = useState(false);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [execution, setExecution] = useState<ExecutionState>({ status: 'idle' });
  const [searchTerm, setSearchTerm] = useState('');

  const apiClient = new ApiClient(apiKey);

  const handleAuthentication = async () => {
    if (!apiKey.trim()) {
      setAuthError('Please enter your Apify API key');
      return;
    }

    setIsLoadingActors(true);
    setAuthError('');
    
    try {
      const userActors = await apiClient.getActors();
      setActors(userActors);
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoadingActors(false);
    }
  };

  const handleActorSelection = async (actor: Actor) => {
    setSelectedActor(actor);
    setIsLoadingSchema(true);
    setActorSchema(null);
    setExecution({ status: 'idle' });

    try {
      const schema = await apiClient.getActorSchema(actor.id);
      setActorSchema(schema);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to load actor schema');
    } finally {
      setIsLoadingSchema(false);
    }
  };

  const handleExecution = async (inputs: any) => {
    if (!selectedActor) return;

    setExecution({ status: 'running', startTime: new Date() });

    try {
      const runId = await apiClient.runActor(selectedActor.id, inputs);
      setExecution(prev => ({ ...prev, runId }));

      // Poll for results
      const results = await apiClient.waitForRun(runId);
      setExecution({
        status: 'completed',
        runId,
        results,
        startTime: execution.startTime
      });
    } catch (error) {
      setExecution({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Execution failed',
        startTime: execution.startTime
      });
    }
  };

  const resetApp = () => {
    setIsAuthenticated(false);
    setApiKey('');
    setActors([]);
    setSelectedActor(null);
    setActorSchema(null);
    setExecution({ status: 'idle' });
    setAuthError('');
    setSearchTerm('');
  };

  const filteredActors = actors.filter(actor =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    actor.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getExecutionDuration = () => {
    if (!execution.startTime) return null;
    const now = new Date();
    const diff = now.getTime() - execution.startTime.getTime();
    return Math.round(diff / 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Apify Integration</h1>
            </div>
            {isAuthenticated && (
              <button
                onClick={resetApp}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {!isAuthenticated ? (
          // Authentication Step
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect to Apify</h2>
                <p className="text-gray-600">Enter your Apify API key to get started</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="apify_api_..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    onKeyPress={(e) => e.key === 'Enter' && handleAuthentication()}
                  />
                </div>

                {authError && <ErrorMessage message={authError} />}

                <button
                  onClick={handleAuthentication}
                  disabled={isLoadingActors}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isLoadingActors ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p>In production, API keys should be handled server-side. This demo stores the key client-side for demonstration purposes only.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Main Application
          <div className="space-y-8">
            {/* Progress Indicator */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Workflow Progress</h2>
                <span className="text-sm text-gray-500">{actors.length} actors available</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">Connected</span>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedActor ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm font-medium ${selectedActor ? 'text-green-700' : 'text-gray-500'}`}>
                    Actor Selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {execution.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : execution.status === 'failed' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : execution.status === 'running' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className={`text-sm font-medium ${
                    execution.status === 'completed' ? 'text-green-700' :
                    execution.status === 'failed' ? 'text-red-700' :
                    execution.status === 'running' ? 'text-blue-700' :
                    'text-gray-500'
                  }`}>
                    {execution.status === 'completed' ? 'Completed' :
                     execution.status === 'failed' ? 'Failed' :
                     execution.status === 'running' ? 'Running' :
                     'Execute'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actor Selection */}
            {!selectedActor && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Select an Actor</h3>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search actors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                <ActorSelector
                  actors={filteredActors}
                  onSelect={handleActorSelection}
                  searchTerm={searchTerm}
                />
              </div>
            )}

            {/* Schema Form */}
            {selectedActor && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedActor.title}</h3>
                      <p className="text-gray-600 mt-1">{selectedActor.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedActor(null);
                        setActorSchema(null);
                        setExecution({ status: 'idle' });
                      }}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {isLoadingSchema ? (
                  <div className="p-8 text-center">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-2">Loading actor schema...</p>
                  </div>
                ) : actorSchema ? (
                  <SchemaForm
                    schema={actorSchema}
                    onSubmit={handleExecution}
                    isExecuting={execution.status === 'running'}
                    executionDuration={getExecutionDuration()}
                  />
                ) : null}
              </div>
            )}

            {/* Execution Status */}
            {execution.status === 'running' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <LoadingSpinner />
                  <div>
                    <h4 className="font-semibold text-blue-900">Executing Actor</h4>
                    <p className="text-blue-700">
                      Run ID: {execution.runId}
                      {execution.startTime && (
                        <span className="ml-2">
                          • Running for {getExecutionDuration()}s
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {(execution.status === 'completed' || execution.status === 'failed') && (
              <ExecutionResults
                execution={execution}
                duration={getExecutionDuration()}
                onReset={() => setExecution({ status: 'idle' })}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;