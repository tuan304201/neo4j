import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Node, Edge } from '../../types/topology.types';
import { ArrowLeft, Database, Link2, Server, X } from 'lucide-react';

interface NodeDetailsProps {
  node: Node;
  relatedNodes: Node[];
  connections: Edge[];
  onClose: () => void;
  onNodeSelect: (nodeId: string) => void;
}

const NodeDetails: React.FC<NodeDetailsProps> = ({
  node,
  relatedNodes,
  connections,
  onClose,
  onNodeSelect,
}) => {
  // Group connections by type
  const incomingConnections = connections.filter(c => c.target === node.id);
  const outgoingConnections = connections.filter(c => c.source === node.id);

  const statusColors = {
    Healthy: 'bg-success-500',
    Warning: 'bg-warning-500',
    Critical: 'bg-error-500',
    Unknown: 'bg-gray-500',
  };

  const getStatusColor = (status?: string) => {
    if (!status) return statusColors.Unknown;
    return statusColors[status as keyof typeof statusColors] || statusColors.Unknown;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white">
              Node Details
            </h2>
          </div>
          <div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto p-6 flex-grow">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                    {node.label}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {node.type}
                    </Badge>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(node.status)} text-white`}>
                      {node.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Card title="Properties">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(node.properties).map(([key, value]) => (
                    <div key={key}>
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{key}</h4>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {String(value)}
                      </p>
                    </div>
                  ))}
                  {Object.keys(node.properties).length === 0 && (
                    <p className="col-span-2 text-sm text-gray-500 dark:text-gray-400">No properties found</p>
                  )}
                </div>
              </Card>
              
              {node.metrics && (
                <Card title="Metrics">
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(node.metrics).map(([key, value]) => (
                      <div key={key}>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{key}</h4>
                        <p className="text-sm text-gray-900 dark:text-white font-semibold">
                          {String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
            
            <div className="space-y-6">
              <Card title="Outgoing Connections" description={`${outgoingConnections.length} connections`}>
                <div className="space-y-2">
                  {outgoingConnections.length > 0 ? (
                    outgoingConnections.map((connection) => {
                      const targetNode = relatedNodes.find(n => n.id === connection.target);
                      return (
                        <div 
                          key={connection.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-750 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => onNodeSelect(connection.target)}
                        >
                          <div className="flex items-center space-x-2">
                            <Server size={16} className="text-secondary-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {targetNode?.label || connection.target}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {connection.type.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                          <span className={`h-2 w-2 rounded-full ${targetNode ? getStatusColor(targetNode.status) : 'bg-gray-400'}`}></span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No outgoing connections</p>
                  )}
                </div>
              </Card>
              
              <Card title="Incoming Connections" description={`${incomingConnections.length} connections`}>
                <div className="space-y-2">
                  {incomingConnections.length > 0 ? (
                    incomingConnections.map((connection) => {
                      const sourceNode = relatedNodes.find(n => n.id === connection.source);
                      return (
                        <div 
                          key={connection.id}
                          className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-750 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                          onClick={() => onNodeSelect(connection.source)}
                        >
                          <div className="flex items-center space-x-2">
                            <Database size={16} className="text-primary-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {sourceNode?.label || connection.source}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {connection.type.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                          <span className={`h-2 w-2 rounded-full ${sourceNode ? getStatusColor(sourceNode.status) : 'bg-gray-400'}`}></span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No incoming connections</p>
                  )}
                </div>
              </Card>
              
              <Card title="Actions">
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Server size={16} />}
                  >
                    View Entity Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    leftIcon={<Link2 size={16} />}
                  >
                    View Related Alerts
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodeDetails;