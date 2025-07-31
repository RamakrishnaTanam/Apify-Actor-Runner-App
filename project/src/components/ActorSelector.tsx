import React from 'react';
import { Play, TrendingUp, Clock } from 'lucide-react';

interface Actor {
  id: string;
  name: string;
  title: string;
  description: string;
  stats: {
    totalRuns: number;
  };
}

interface ActorSelectorProps {
  actors: Actor[];
  onSelect: (actor: Actor) => void;
  searchTerm: string;
}

export function ActorSelector({ actors, onSelect, searchTerm }: ActorSelectorProps) {
  if (actors.length === 0) {
    return (
      <div className="p-8 text-center">
        {searchTerm ? (
          <div>
            <p className="text-gray-600 mb-2">No actors found matching "{searchTerm}"</p>
            <p className="text-sm text-gray-500">Try adjusting your search terms</p>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">No actors found in your account</p>
            <p className="text-sm text-gray-500">Create actors in your Apify console first</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {actors.map((actor) => (
        <div
          key={actor.id}
          className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onSelect(actor)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 truncate">
                    {actor.title}
                  </h4>
                  <p className="text-sm text-gray-500 font-mono">{actor.name}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {actor.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{actor.stats.totalRuns.toLocaleString()} runs</span>
                </div>
              </div>
            </div>
            <div className="ml-4 flex-shrink-0">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Select
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}