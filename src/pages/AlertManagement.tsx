import React, { useEffect, useState } from 'react';
import Card from '../components/common/Card';
import AlertTable from '../components/alert/AlertTable';
import AlertFilters from '../components/alert/AlertFilters';
import AlertActions from '../components/alert/AlertActions';
import AlertDetails from '../components/alert/AlertDetails';
import { Alert, AlertFilterOptions, AlertTabType } from '../types/alert.types';
import { getAlerts, searchAlerts, updateAlertStatus } from '../services/alertService';

const AlertManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AlertTabType>('Active');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<AlertFilterOptions>({
    severity: [],
    sourceSignal: [],
    modelVersion: [],
    team: [],
    entityType: [],
    service: [],
  });

  useEffect(() => {
    fetchAlerts();
  }, [activeTab, filters]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const fetchedAlerts = await getAlerts(filters);
      
      // Filter by active tab
      let filteredAlerts = fetchedAlerts;
      if (activeTab === 'Active') {
        filteredAlerts = fetchedAlerts.filter(alert => 
          alert.status !== 'Resolved' && alert.status !== 'Suppressed'
        );
      } else if (activeTab === 'Suppressed') {
        filteredAlerts = fetchedAlerts.filter(alert => alert.status === 'Suppressed');
      } else if (activeTab === 'Resolved') {
        filteredAlerts = fetchedAlerts.filter(alert => alert.status === 'Resolved');
      }
      
      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLoading(true);
      try {
        const searchResults = await searchAlerts(query);
        setAlerts(searchResults);
      } catch (error) {
        console.error('Error searching alerts:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // If search is cleared, go back to filtered results
      fetchAlerts();
    }
  };

  const handleSelectAlert = (id: string) => {
    setSelectedAlerts(prev => 
      prev.includes(id) 
        ? prev.filter(alertId => alertId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllAlerts = (selected: boolean) => {
    setSelectedAlerts(selected ? alerts.map(alert => alert.id) : []);
  };

  const handleViewAlert = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  const handleAcknowledgeAlert = async (alert: Alert) => {
    try {
      const success = await updateAlertStatus(alert.id, 'Acknowledged');
      if (success) {
        setAlerts(prev => 
          prev.map(a => 
            a.id === alert.id ? { ...a, status: 'Acknowledged' } : a
          )
        );
        
        if (selectedAlert?.id === alert.id) {
          setSelectedAlert(prev => prev ? { ...prev, status: 'Acknowledged' } : null);
        }
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleSuppressAlert = async (alert: Alert) => {
    try {
      const success = await updateAlertStatus(alert.id, 'Suppressed');
      if (success) {
        if (activeTab === 'Active') {
          // Remove from active list if tab is 'Active'
          setAlerts(prev => prev.filter(a => a.id !== alert.id));
        } else {
          // Update status in the current list
          setAlerts(prev => 
            prev.map(a => 
              a.id === alert.id ? { ...a, status: 'Suppressed' } : a
            )
          );
        }
        
        // Close details modal if it's showing this alert
        if (selectedAlert?.id === alert.id) {
          setSelectedAlert(null);
        }
        
        // Remove from selected alerts
        setSelectedAlerts(prev => prev.filter(id => id !== alert.id));
      }
    } catch (error) {
      console.error('Error suppressing alert:', error);
    }
  };

  const handleResolveAlert = async (alert: Alert) => {
    try {
      const success = await updateAlertStatus(alert.id, 'Resolved');
      if (success) {
        if (activeTab === 'Active') {
          // Remove from active list if tab is 'Active'
          setAlerts(prev => prev.filter(a => a.id !== alert.id));
        } else {
          // Update status in the current list
          setAlerts(prev => 
            prev.map(a => 
              a.id === alert.id ? { ...a, status: 'Resolved' } : a
            )
          );
        }
        
        // Close details modal
        setSelectedAlert(null);
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleBulkAcknowledge = async () => {
    // In a real application, this would be a batch API call
    for (const alertId of selectedAlerts) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        await handleAcknowledgeAlert(alert);
      }
    }
    // Clear selection after operation
    setSelectedAlerts([]);
  };

  const handleBulkSuppress = async () => {
    // In a real application, this would be a batch API call
    for (const alertId of selectedAlerts) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        await handleSuppressAlert(alert);
      }
    }
    // Clear selection after operation
    setSelectedAlerts([]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
        Alert Management
      </h1>
      
      <Card>
        <AlertFilters
          activeTab={activeTab}
          onTabChange={setActiveTab}
          filters={filters}
          onFilterChange={setFilters}
          onSearchChange={handleSearch}
          onRefresh={fetchAlerts}
        />
        
        <div className="mt-6 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading alerts...</p>
            </div>
          ) : (
            <AlertTable
              alerts={alerts}
              selectedAlerts={selectedAlerts}
              onSelectAlert={handleSelectAlert}
              onSelectAllAlerts={handleSelectAllAlerts}
              onViewAlert={handleViewAlert}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onSuppressAlert={handleSuppressAlert}
            />
          )}
        </div>
      </Card>
      
      <AlertActions
        selectedCount={selectedAlerts.length}
        onAcknowledge={handleBulkAcknowledge}
        onSuppress={handleBulkSuppress}
        onAssign={() => console.log('Assign to team')}
        onAddTag={() => console.log('Add tag')}
        onExport={() => console.log('Export CSV')}
        onDelete={() => console.log('Delete')}
      />
      
      {selectedAlert && (
        <AlertDetails
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAcknowledge={handleAcknowledgeAlert}
          onResolve={handleResolveAlert}
          onSuppress={handleSuppressAlert}
        />
      )}
    </div>
  );
};

export default AlertManagement;