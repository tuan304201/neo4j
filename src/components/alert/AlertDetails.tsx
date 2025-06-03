import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDateTime, getSeverityClass, getStatusClass } from '../../utils/formatters';
import { Alert } from '../../types/alert.types';
import { 
  Activity, AlertTriangle, ArrowLeft, Check, Clock, Database, 
  LinkIcon, Server, User, X 
} from 'lucide-react';

interface AlertDetailsProps {
  alert: Alert;
  onClose: () => void;
  onAcknowledge: (alert: Alert) => void;
  onResolve: (alert: Alert) => void;
  onSuppress: (alert: Alert) => void;
}

const AlertDetails: React.FC<AlertDetailsProps> = ({
  alert,
  onClose,
  onAcknowledge,
  onResolve,
  onSuppress,
}) => {
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
              Alert Details
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
                    {alert.alertSummary}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>{alert.id}</span>
                    <span>•</span>
                    <span>{formatDateTime(alert.timestamp)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(alert.severity)} text-white`}>
                    {alert.severity}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(alert.status)} text-white`}>
                    {alert.status}
                  </span>
                </div>
              </div>
              
              <Card title="Alert Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Alert Type</h4>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center">
                      <AlertTriangle size={16} className="mr-1 text-warning-500" />
                      {alert.alertType}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Detection Model</h4>
                    <p className="text-sm text-gray-900 dark:text-white">{alert.detectionModel}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Source Signal</h4>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center">
                      <Activity size={16} className="mr-1 text-primary-500" />
                      {alert.sourceSignal}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Anomaly Confidence</h4>
                    <div className="relative pt-1">
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                        <div
                          style={{ width: `${alert.anomalyConfidence * 100}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                        ></div>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">
                        {(alert.anomalyConfidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card title="Entity Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Entity Name</h4>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center">
                      <Server size={16} className="mr-1 text-secondary-500" />
                      {alert.entityName}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Entity Type</h4>
                    <Badge variant="outline">
                      {alert.entityType}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Mapped Business Service</h4>
                    <p className="text-sm text-gray-900 dark:text-white">{alert.mappedBusinessService}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Owner Team</h4>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center">
                      <User size={16} className="mr-1 text-accent-500" />
                      {alert.ownerTeam}
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card title="Metric Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Metric Triggered</h4>
                    <p className="text-sm text-gray-900 dark:text-white">{alert.metricTriggered}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Current Value</h4>
                    <p className="text-sm text-gray-900 dark:text-white font-semibold">
                      {alert.currentValue}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Baseline / Threshold</h4>
                    <p className="text-sm text-gray-900 dark:text-white">{alert.baselineThreshold}</p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card title="Root Cause Indicators">
                <div className="space-y-2">
                  {alert.rootCauseIndicators.map((indicator, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-750 rounded-md"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{indicator}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Factor {index + 1}</span>
                    </div>
                  ))}
                </div>
              </Card>
              
              <Card title="Related Alerts">
                <div className="space-y-2">
                  {alert.relatedAlerts.length > 0 ? (
                    alert.relatedAlerts.map((relatedAlert, index) => (
                      <div 
                        key={index}
                        className="flex items-center p-2 bg-gray-50 dark:bg-gray-750 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <LinkIcon size={14} className="mr-2 text-primary-500" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{relatedAlert}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No related alerts found</p>
                  )}
                </div>
              </Card>
              
              <Card title="Actions">
                <div className="space-y-3">
                  <Button
                    variant="primary"
                    className="w-full"
                    leftIcon={<Clock size={16} />}
                    onClick={() => onAcknowledge(alert)}
                  >
                    Acknowledge
                  </Button>
                  <Button
                    variant="success"
                    className="w-full"
                    leftIcon={<Check size={16} />}
                    onClick={() => onResolve(alert)}
                  >
                    Resolve
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    leftIcon={<Database size={16} />}
                    onClick={() => onSuppress(alert)}
                  >
                    Suppress
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

export default AlertDetails;