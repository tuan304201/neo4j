export type AlertSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type AlertStatus = 'New' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Suppressed';

export type AlertType = 'Anomaly' | 'Rule-Based' | 'Threshold Breach' | 'Security' | 'Performance' | 'Other';

export type EntityType = 'Service' | 'API' | 'Host' | 'Pod' | 'Application' | 'Database' | 'Network' | 'Storage';

export type SourceSignal = 'CloudWatch' | 'Dynatrace' | 'SolarWinds' | 'Glue' | 'Prometheus' | 'Grafana' | 'Custom';

export interface Alert {
  id: string;
  alertType: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: string;
  entityName: string;
  entityType: EntityType;
  mappedBusinessService: string;
  sourceSignal: SourceSignal;
  metricTriggered: string;
  currentValue: number | string;
  baselineThreshold: number | string;
  rootCauseIndicators: string[];
  anomalyConfidence: number;
  detectionModel: string;
  alertSummary: string;
  relatedAlerts: string[];
  ownerTeam: string;
}

export type AlertTabType = 'Active' | 'Suppressed' | 'Resolved' | 'Correlated Clusters' | 'Model Drift';

export interface AlertFilterOptions {
  severity: AlertSeverity[];
  sourceSignal: SourceSignal[];
  modelVersion: string[];
  team: string[];
  entityType: EntityType[];
  service: string[];
}

export interface SortOption {
  field: keyof Alert;
  direction: 'asc' | 'desc';
}

export interface BulkAction {
  type: 'Suppress' | 'Assign' | 'Tag' | 'Export';
  payload?: any;
}