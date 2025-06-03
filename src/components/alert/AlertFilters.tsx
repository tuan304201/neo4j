import React, { useState } from 'react';
import { AlertFilterOptions, AlertSeverity, AlertStatus, AlertTabType, EntityType, SourceSignal } from '../../types/alert.types';
import Button from '../common/Button';
import { Filter, X, Search, RefreshCw } from 'lucide-react';

interface AlertFiltersProps {
  activeTab: AlertTabType;
  onTabChange: (tab: AlertTabType) => void;
  filters: AlertFilterOptions;
  onFilterChange: (filters: AlertFilterOptions) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
}

const AlertFilters: React.FC<AlertFiltersProps> = ({
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  onSearchChange,
  onRefresh,
}) => {
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const tabs: AlertTabType[] = ['Active', 'Suppressed', 'Resolved', 'Correlated Clusters', 'Model Drift'];

  const severityOptions: AlertSeverity[] = ['Critical', 'High', 'Medium', 'Low'];
  const sourceSignalOptions: SourceSignal[] = ['CloudWatch', 'Dynatrace', 'SolarWinds', 'Glue', 'Prometheus', 'Grafana', 'Custom'];
  const entityTypeOptions: EntityType[] = ['Service', 'API', 'Host', 'Pod', 'Application', 'Database', 'Network', 'Storage'];
  const teamOptions = ['Platform Engineering', 'Auth Team', 'Database Team', 'Frontend Team', 'Middleware Team'];
  
  const handleToggleSeverity = (severity: AlertSeverity) => {
    const updatedSeverities = filters.severity.includes(severity)
      ? filters.severity.filter(s => s !== severity)
      : [...filters.severity, severity];
    
    onFilterChange({
      ...filters,
      severity: updatedSeverities,
    });
  };

  const handleToggleSourceSignal = (source: SourceSignal) => {
    const updatedSources = filters.sourceSignal.includes(source)
      ? filters.sourceSignal.filter(s => s !== source)
      : [...filters.sourceSignal, source];
    
    onFilterChange({
      ...filters,
      sourceSignal: updatedSources,
    });
  };

  const handleToggleEntityType = (entityType: EntityType) => {
    const updatedEntityTypes = filters.entityType.includes(entityType)
      ? filters.entityType.filter(t => t !== entityType)
      : [...filters.entityType, entityType];
    
    onFilterChange({
      ...filters,
      entityType: updatedEntityTypes,
    });
  };

  const handleToggleTeam = (team: string) => {
    const updatedTeams = filters.team.includes(team)
      ? filters.team.filter(t => t !== team)
      : [...filters.team, team];
    
    onFilterChange({
      ...filters,
      team: updatedTeams,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(search);
  };

  const clearFilters = () => {
    onFilterChange({
      severity: [],
      sourceSignal: [],
      modelVersion: [],
      team: [],
      entityType: [],
      service: [],
    });
    setSearch('');
    onSearchChange('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onTabChange(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter size={14} />}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                      bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
                      placeholder:text-gray-500 dark:placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search by entity, summary, metric..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        
        {Object.values(filters).some(arr => arr.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<X size={14} />}
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        )}
      </div>

      {filtersOpen && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity</h4>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map((severity) => (
                <div 
                  key={severity}
                  onClick={() => handleToggleSeverity(severity)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium cursor-pointer 
                    ${filters.severity.includes(severity)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {severity}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source Signal</h4>
            <div className="flex flex-wrap gap-2">
              {sourceSignalOptions.map((source) => (
                <div 
                  key={source}
                  onClick={() => handleToggleSourceSignal(source)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium cursor-pointer 
                    ${filters.sourceSignal.includes(source)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {source}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Entity Type</h4>
            <div className="flex flex-wrap gap-2">
              {entityTypeOptions.map((entityType) => (
                <div 
                  key={entityType}
                  onClick={() => handleToggleEntityType(entityType)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium cursor-pointer 
                    ${filters.entityType.includes(entityType)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {entityType}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Team</h4>
            <div className="flex flex-wrap gap-2">
              {teamOptions.map((team) => (
                <div 
                  key={team}
                  onClick={() => handleToggleTeam(team)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium cursor-pointer 
                    ${filters.team.includes(team)
                      ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {team}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertFilters;