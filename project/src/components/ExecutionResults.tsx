import React, { useState } from 'react';
import { CheckCircle, XCircle, Download, Copy, Eye, EyeOff, Clock, RefreshCw } from 'lucide-react';

interface ExecutionState {
  status: 'idle' | 'running' | 'completed' | 'failed';
  runId?: string;
  results?: any;
  error?: string;
  startTime?: Date;
}

interface ExecutionResultsProps {
  execution: ExecutionState;
  duration?: number | null;
  onReset: () => void;
}

export function ExecutionResults({ execution, duration, onReset }: ExecutionResultsProps) {
  const [showRawData, setShowRawData] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadResults = () => {
    if (!execution.results) return;
    
    const dataStr = JSON.stringify(execution.results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apify-results-${execution.runId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDataSize = (data: any) => {
    const str = JSON.stringify(data);
    const bytes = new Blob([str]).size;
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderDataPreview = (data: any) => {
    if (!data) return null;

    if (Array.isArray(data)) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Dataset Results ({data.length} items)
            </span>
            <span className="text-xs text-gray-500">
              {formatDataSize(data)}
            </span>
          </div>
          
          {data.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Item:</h4>
              <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-40">
                {JSON.stringify(data[0], null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    }

    if (typeof data === 'object') {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <pre className="text-xs text-gray-600 bg-white p-3 rounded border overflow-auto max-h-60">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">{String(data)}</p>
      </div>
    );
  };

  if (execution.status === 'failed') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-red-900 mb-2">Execution Failed</h4>
            <div className="space-y-2">
              {execution.runId && (
                <p className="text-sm text-red-700">
                  <span className="font-medium">Run ID:</span> {execution.runId}
                </p>
              )}
              {duration && (
                <p className="text-sm text-red-700">
                  <span className="font-medium">Duration:</span> {duration}s
                </p>
              )}
              <div className="bg-red-100 rounded-lg p-3 mt-3">
                <p className="text-sm text-red-800 font-medium mb-1">Error Details:</p>
                <p className="text-sm text-red-700">{execution.error}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 text-red-700 hover:text-red-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (execution.status === 'completed') {
    const { results } = execution;
    const hasDataset = results?.dataset && Array.isArray(results.dataset) && results.dataset.length > 0;

    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-semibold text-green-900 mb-2">Execution Completed</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
              {execution.runId && (
                <div>
                  <span className="font-medium">Run ID:</span>
                  <p className="font-mono text-xs mt-1">{execution.runId}</p>
                </div>
              )}
              {duration && (
                <div>
                  <span className="font-medium">Duration:</span>
                  <p className="mt-1">{duration}s</p>
                </div>
              )}
              {results?.stats && (
                <div>
                  <span className="font-medium">Stats:</span>
                  <div className="mt-1 space-y-1">
                    {results.stats.computeUnits && (
                      <p className="text-xs">Compute Units: {results.stats.computeUnits}</p>
                    )}
                    {results.stats.memoryUsedBytes && (
                      <p className="text-xs">
                        Memory: {(results.stats.memoryUsedBytes / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                  </div>
                </div>
              )}
              {results?.finishedAt && (
                <div>
                  <span className="font-medium">Finished:</span>
                  <p className="text-xs mt-1">
                    {new Date(results.finishedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-green-900">Results</h5>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center space-x-1 px-3 py-1 text-xs text-green-700 hover:text-green-900 transition-colors"
              >
                {showRawData ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showRawData ? 'Hide' : 'Show'} Raw Data</span>
              </button>
              
              {results && (
                <>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(results, null, 2))}
                    className="flex items-center space-x-1 px-3 py-1 text-xs text-green-700 hover:text-green-900 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                  
                  <button
                    onClick={downloadResults}
                    className="flex items-center space-x-1 px-3 py-1 text-xs text-green-700 hover:text-green-900 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {showRawData ? (
            <div className="bg-white rounded-lg p-4 border">
              <pre className="text-xs text-gray-600 overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              {hasDataset ? (
                renderDataPreview(results.dataset)
              ) : results ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    No dataset results found. The actor may have produced output in a different format.
                  </p>
                  <button
                    onClick={() => setShowRawData(true)}
                    className="text-yellow-700 hover:text-yellow-900 text-sm underline mt-2"
                  >
                    View raw results
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">No results data available</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 text-green-700 hover:text-green-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Run Again</span>
          </button>
        </div>
      </div>
    );
  }

  return null;
}