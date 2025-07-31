import React, { useState } from 'react';
import { Play, Clock } from 'lucide-react';

interface SchemaProperty {
  type: string;
  title?: string;
  description?: string;
  default?: any;
  enum?: string[];
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
}

interface Schema {
  type: string;
  properties: Record<string, SchemaProperty>;
  required?: string[];
}

interface SchemaFormProps {
  schema: Schema;
  onSubmit: (data: any) => void;
  isExecuting: boolean;
  executionDuration?: number | null;
}

export function SchemaForm({ schema, onSubmit, isExecuting, executionDuration }: SchemaFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const required = schema.required || [];

    required.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderInput = (key: string, property: SchemaProperty) => {
    const isRequired = schema.required?.includes(key);
    const hasError = errors[key];
    const value = formData[key] ?? property.default ?? '';

    const baseClasses = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

    switch (property.type) {
      case 'string':
        if (property.enum) {
          return (
            <select
              value={value}
              onChange={(e) => updateFormData(key, e.target.value)}
              className={baseClasses}
              required={isRequired}
            >
              <option value="">Select an option</option>
              {property.enum.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        }
        
        if (property.description?.toLowerCase().includes('url') || key.toLowerCase().includes('url')) {
          return (
            <input
              type="url"
              value={value}
              onChange={(e) => updateFormData(key, e.target.value)}
              className={baseClasses}
              placeholder="https://example.com"
              required={isRequired}
            />
          );
        }

        if (property.description?.toLowerCase().includes('email') || key.toLowerCase().includes('email')) {
          return (
            <input
              type="email"
              value={value}
              onChange={(e) => updateFormData(key, e.target.value)}
              className={baseClasses}
              placeholder="user@example.com"
              required={isRequired}
            />
          );
        }

        return (
          <textarea
            value={value}
            onChange={(e) => updateFormData(key, e.target.value)}
            className={`${baseClasses} min-h-[80px] resize-y`}
            placeholder={property.description || `Enter ${property.title || key}`}
            required={isRequired}
          />
        );

      case 'number':
      case 'integer':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateFormData(key, property.type === 'integer' ? parseInt(e.target.value) || 0 : parseFloat(e.target.value) || 0)}
            className={baseClasses}
            step={property.type === 'integer' ? '1' : 'any'}
            required={isRequired}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => updateFormData(key, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {property.title || key}
            </span>
          </div>
        );

      case 'array':
        return (
          <div className="space-y-2">
            <textarea
              value={Array.isArray(value) ? value.join('\n') : value}
              onChange={(e) => updateFormData(key, e.target.value.split('\n').filter(item => item.trim()))}
              className={`${baseClasses} min-h-[100px] resize-y`}
              placeholder="Enter one item per line"
              required={isRequired}
            />
            <p className="text-xs text-gray-500">Enter one item per line</p>
          </div>
        );

      default:
        return (
          <textarea
            value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateFormData(key, parsed);
              } catch {
                updateFormData(key, e.target.value);
              }
            }}
            className={`${baseClasses} min-h-[100px] resize-y font-mono text-sm`}
            placeholder="Enter JSON or text"
            required={isRequired}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(schema.properties).map(([key, property]) => (
          <div key={key} className="space-y-2">
            <label htmlFor={key} className="block text-sm font-medium text-gray-700">
              {property.title || key}
              {schema.required?.includes(key) && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            
            {renderInput(key, property)}
            
            {property.description && (
              <p className="text-xs text-gray-500">{property.description}</p>
            )}
            
            {errors[key] && (
              <p className="text-xs text-red-600">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {schema.required && schema.required.length > 0 && (
            <span>* Required fields</span>
          )}
        </div>
        
        <button
          type="submit"
          disabled={isExecuting}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isExecuting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Running...</span>
              {executionDuration && (
                <span className="text-blue-200">({executionDuration}s)</span>
              )}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Execute Actor</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}