import React, { useState } from 'react';
import Button from '../common/Button';
import { ArrowDownUp, Expand as ArrowsExpand, Circle, Filter, Grid, LayoutGrid, RefreshCw, Save, Search, Share2, ZoomIn, ZoomOut } from 'lucide-react';
import { GraphFilterOptions, GraphLayoutOptions, NodeType, EdgeType } from '../../types/topology.types';
import { NODE_TYPE_COLORS, EDGE_TYPE_COLORS } from '../../utils/constants';

interface GraphControlsProps {
  layoutOptions: GraphLayoutOptions;
  onLayoutChange: (options: GraphLayoutOptions) => void;
  filterOptions: GraphFilterOptions;
  onFilterChange: (options: GraphFilterOptions) => void;
  onRefresh: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSaveLayout: () => void;
  onSearch: (query: string) => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  layoutOptions,
  onLayoutChange,
  filterOptions,
  onFilterChange,
  onRefresh,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSaveLayout,
  onSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showLayout, setShowLayout] = useState(false);

  const handleLayoutChange = (layout: 'force' | 'hierarchical' | 'circular' | 'grid') => {
    onLayoutChange({
      ...layoutOptions,
      layout,
    });
  };

  const handleNodeTypeToggle = (nodeType: NodeType) => {
    const isTypeActive = filterOptions.nodeTypes.includes(nodeType);
    const newNodeTypes = isTypeActive
      ? filterOptions.nodeTypes.filter(type => type !== nodeType)
      : [...filterOptions.nodeTypes, nodeType];

    onFilterChange({
      ...filterOptions,
      nodeTypes: newNodeTypes,
    });
  };

  const handleEdgeTypeToggle = (edgeType: EdgeType) => {
    const isTypeActive = filterOptions.edgeTypes.includes(edgeType);
    const newEdgeTypes = isTypeActive
      ? filterOptions.edgeTypes.filter(type => type !== edgeType)
      : [...filterOptions.edgeTypes, edgeType];

    onFilterChange({
      ...filterOptions,
      edgeTypes: newEdgeTypes,
    });
  };

  const handleStatusToggle = (status: 'Healthy' | 'Warning' | 'Critical' | 'Unknown') => {
    const isStatusActive = filterOptions.status.includes(status);
    const newStatus = isStatusActive
      ? filterOptions.status.filter(s => s !== status)
      : [...filterOptions.status, status];

    onFilterChange({
      ...filterOptions,
      status: newStatus,
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const nodeTypes: NodeType[] = [
    'Service', 'API', 'Host', 'Pod', 'Application', 'Database', 'Network', 'Storage', 
    'BusinessService', 'Container', 'Cluster', 'VirtualMachine'
  ];

  const edgeTypes: EdgeType[] = [
    'DEPENDS_ON', 'COMMUNICATES_WITH', 'HOSTS', 'CONTAINS', 'BELONGS_TO', 'RUNS_ON', 'CONNECTS_TO'
  ];

  const statusTypes = ['Healthy', 'Warning', 'Critical', 'Unknown'];

  const statusColors = {
    Healthy: 'bg-success-500',
    Warning: 'bg-warning-500',
    Critical: 'bg-error-500',
    Unknown: 'bg-gray-500',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                      bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100
                      placeholder:text-gray-500 dark:placeholder:text-gray-400
                      focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search nodes by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Filter size={14} />}
            onClick={() => {
              setShowFilters(!showFilters);
              if (showLayout) setShowLayout(false);
            }}
          >
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LayoutGrid size={14} />}
            onClick={() => {
              setShowLayout(!showLayout);
              if (showFilters) setShowFilters(false);
            }}
          >
            Layout
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ZoomIn size={14} />}
            onClick={onZoomIn}
            aria-label="Zoom in"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ZoomOut size={14} />}
            onClick={onZoomOut}
            aria-label="Zoom out"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowsExpand size={14} />}
            onClick={onResetView}
            aria-label="Reset view"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw size={14} />}
            onClick={onRefresh}
            aria-label="Refresh graph"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Save size={14} />}
            onClick={onSaveLayout}
            aria-label="Save layout"
          />
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Share2 size={14} />}
            aria-label="Share graph"
          />
        </div>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-2 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Node Types</h4>
              <div className="flex flex-wrap gap-2">
                {nodeTypes.map((nodeType) => (
                  <div 
                    key={nodeType}
                    onClick={() => handleNodeTypeToggle(nodeType)}
                    className={`
                      flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer 
                      ${filterOptions.nodeTypes.includes(nodeType)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <span 
                      className="w-2 h-2 rounded-full mr-1.5" 
                      style={{ backgroundColor: NODE_TYPE_COLORS[nodeType] }}
                    />
                    {nodeType}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edge Types</h4>
              <div className="flex flex-wrap gap-2">
                {edgeTypes.map((edgeType) => (
                  <div 
                    key={edgeType}
                    onClick={() => handleEdgeTypeToggle(edgeType)}
                    className={`
                      flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer 
                      ${filterOptions.edgeTypes.includes(edgeType)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <span 
                      className="w-2 h-2 rounded-full mr-1.5" 
                      style={{ backgroundColor: EDGE_TYPE_COLORS[edgeType] }}
                    />
                    {edgeType.replace(/_/g, ' ')}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h4>
              <div className="flex flex-wrap gap-2">
                {statusTypes.map((status) => (
                  <div 
                    key={status}
                    onClick={() => handleStatusToggle(status as any)}
                    className={`
                      flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer 
                      ${filterOptions.status.includes(status as any)
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <span 
                      className={`w-2 h-2 rounded-full mr-1.5 ${statusColors[status as keyof typeof statusColors]}`}
                    />
                    {status}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showLayout && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mt-2 animate-fade-in">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Layout Type</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={layoutOptions.layout === 'force' ? 'primary' : 'outline'}
                  size="sm"
                  leftIcon={<ArrowDownUp size={14} />}
                  onClick={() => handleLayoutChange('force')}
                >
                  Force-Directed
                </Button>
                <Button
                  variant={layoutOptions.layout === 'hierarchical' ? 'primary' : 'outline'}
                  size="sm"
                  leftIcon={<ArrowDownUp size={14} className="rotate-90" />}
                  onClick={() => handleLayoutChange('hierarchical')}
                >
                  Hierarchical
                </Button>
                <Button
                  variant={layoutOptions.layout === 'circular' ? 'primary' : 'outline'}
                  size="sm"
                  leftIcon={<Circle size={14} />}
                  onClick={() => handleLayoutChange('circular')}
                >
                  Circular
                </Button>
                <Button
                  variant={layoutOptions.layout === 'grid' ? 'primary' : 'outline'}
                  size="sm"
                  leftIcon={<Grid size={14} />}
                  onClick={() => handleLayoutChange('grid')}
                >
                  Grid
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Node Spacing</h4>
                <input
                  type="range"
                  min="10"
                  max="200"
                  value={layoutOptions.nodeSpacing}
                  onChange={(e) => onLayoutChange({
                    ...layoutOptions,
                    nodeSpacing: parseInt(e.target.value),
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Compact</span>
                  <span>Spread</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Edge Length</h4>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={layoutOptions.edgeLength}
                  onChange={(e) => onLayoutChange({
                    ...layoutOptions,
                    edgeLength: parseInt(e.target.value),
                  })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Animation</h4>
                <div className="flex items-center space-x-2">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={layoutOptions.animate}
                      onChange={() => onLayoutChange({
                        ...layoutOptions,
                        animate: !layoutOptions.animate,
                      })}
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                      {layoutOptions.animate ? 'Enabled' : 'Disabled'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GraphControls;