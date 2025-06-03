import React, { useState } from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatDateTime, getSeverityClass, getStatusClass, truncateText } from '../../utils/formatters';
import { Alert } from '../../types/alert.types';
import { AlertCircle, Bell, Check, Clock, Eye, MoreHorizontal, User } from 'lucide-react';

interface AlertTableProps {
  alerts: Alert[];
  selectedAlerts: string[];
  onSelectAlert: (id: string) => void;
  onSelectAllAlerts: (selected: boolean) => void;
  onViewAlert: (alert: Alert) => void;
  onAcknowledgeAlert: (alert: Alert) => void;
  onSuppressAlert: (alert: Alert) => void;
}

const AlertTable: React.FC<AlertTableProps> = ({
  alerts,
  selectedAlerts,
  onSelectAlert,
  onSelectAllAlerts,
  onViewAlert,
  onAcknowledgeAlert,
  onSuppressAlert,
}) => {
  const [sortField, setSortField] = useState<keyof Alert>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Alert) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sortField === 'timestamp') {
      const dateA = new Date(a[sortField]);
      const dateB = new Date(b[sortField]);
      return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
    }
    
    if (a[sortField] < b[sortField]) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const allSelected = alerts.length > 0 && selectedAlerts.length === alerts.length;

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-3 py-3.5">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                checked={allSelected}
                onChange={(e) => onSelectAllAlerts(e.target.checked)}
              />
            </th>
            <th 
              scope="col" 
              className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('id')}
            >
              <div className="flex items-center">
                <span>Alert ID</span>
                {sortField === 'id' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Alert Type
            </th>
            <th 
              scope="col" 
              className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('severity')}
            >
              <div className="flex items-center">
                <span>Severity</span>
                {sortField === 'severity' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                <span>Status</span>
                {sortField === 'status' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('timestamp')}
            >
              <div className="flex items-center">
                <span>Timestamp</span>
                {sortField === 'timestamp' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th 
              scope="col" 
              className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
              onClick={() => handleSort('entityName')}
            >
              <div className="flex items-center">
                <span>Entity Name</span>
                {sortField === 'entityName' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Entity Type
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Alert Summary
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Owner Team
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {sortedAlerts.map((alert) => (
            <tr 
              key={alert.id} 
              className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <td className="px-3 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                  checked={selectedAlerts.includes(alert.id)}
                  onChange={() => onSelectAlert(alert.id)}
                />
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {alert.id}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {alert.alertType}
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(alert.severity)} text-white`}>
                  {alert.severity}
                </span>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(alert.status)} text-white`}>
                  {alert.status}
                </span>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {formatDateTime(alert.timestamp)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {alert.entityName}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                <Badge variant="outline">
                  {alert.entityType}
                </Badge>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {truncateText(alert.alertSummary, 30)}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {alert.ownerTeam}
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewAlert(alert)}
                    aria-label="View alert details"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onAcknowledgeAlert(alert)}
                    aria-label="Acknowledge alert"
                  >
                    <Check size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSuppressAlert(alert)}
                    aria-label="Suppress alert"
                  >
                    <Bell size={16} className="line-through" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="More options"
                  >
                    <MoreHorizontal size={16} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {alerts.length === 0 && (
            <tr>
              <td colSpan={11} className="px-3 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center justify-center">
                  <AlertCircle size={24} className="mb-2 text-gray-400" />
                  <p>No alerts found matching the current filters.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AlertTable;