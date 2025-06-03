import { Alert, AlertFilterOptions } from '../types/alert.types';
import { MOCK_ALERTS } from '../utils/constants';

/**
 * Simulated delay for API calls
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Get all alerts with optional filtering
 */
export const getAlerts = async (filters?: AlertFilterOptions): Promise<Alert[]> => {
  // Simulate API call delay
  await delay(500);
  
  // In a real application, this would be an API call
  let filteredAlerts = [...MOCK_ALERTS];

  // Apply filters if provided
  if (filters) {
    if (filters.severity.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.severity.includes(alert.severity)
      );
    }

    if (filters.sourceSignal.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.sourceSignal.includes(alert.sourceSignal)
      );
    }

    if (filters.modelVersion.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.modelVersion.includes(alert.detectionModel)
      );
    }

    if (filters.team.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.team.includes(alert.ownerTeam)
      );
    }

    if (filters.entityType.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.entityType.includes(alert.entityType)
      );
    }

    if (filters.service.length > 0) {
      filteredAlerts = filteredAlerts.filter(alert => 
        filters.service.includes(alert.mappedBusinessService)
      );
    }
  }

  return filteredAlerts;
};

/**
 * Get alert by ID
 */
export const getAlertById = async (id: string): Promise<Alert | null> => {
  // Simulate API call delay
  await delay(300);
  
  // In a real application, this would be an API call
  const alert = MOCK_ALERTS.find(alert => alert.id === id) || null;
  return alert;
};

/**
 * Update alert status
 */
export const updateAlertStatus = async (id: string, status: Alert['status']): Promise<boolean> => {
  // Simulate API call delay
  await delay(300);
  
  // In a real application, this would be an API call
  const alertIndex = MOCK_ALERTS.findIndex(alert => alert.id === id);
  if (alertIndex !== -1) {
    MOCK_ALERTS[alertIndex].status = status;
    return true;
  }
  return false;
};

/**
 * Update alert owner team
 */
export const updateAlertOwner = async (id: string, ownerTeam: string): Promise<boolean> => {
  // Simulate API call delay
  await delay(300);
  
  // In a real application, this would be an API call
  const alertIndex = MOCK_ALERTS.findIndex(alert => alert.id === id);
  if (alertIndex !== -1) {
    MOCK_ALERTS[alertIndex].ownerTeam = ownerTeam;
    return true;
  }
  return false;
};

/**
 * Get related alerts by ID
 */
export const getRelatedAlerts = async (id: string): Promise<Alert[]> => {
  // Simulate API call delay
  await delay(400);
  
  // In a real application, this would be an API call
  const alert = MOCK_ALERTS.find(alert => alert.id === id);
  if (!alert) return [];
  
  return MOCK_ALERTS.filter(a => 
    alert.relatedAlerts.includes(a.id) || 
    a.relatedAlerts.includes(alert.id)
  );
};

/**
 * Search alerts by query
 */
export const searchAlerts = async (query: string): Promise<Alert[]> => {
  // Simulate API call delay
  await delay(400);
  
  if (!query.trim()) return MOCK_ALERTS;
  
  const lowerQuery = query.toLowerCase();
  
  // In a real application, this would be an API call with proper search capabilities
  return MOCK_ALERTS.filter(alert => 
    alert.id.toLowerCase().includes(lowerQuery) ||
    alert.entityName.toLowerCase().includes(lowerQuery) ||
    alert.alertSummary.toLowerCase().includes(lowerQuery) ||
    alert.metricTriggered.toLowerCase().includes(lowerQuery) ||
    alert.detectionModel.toLowerCase().includes(lowerQuery)
  );
};