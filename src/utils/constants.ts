// Duration constants (in milliseconds)
export const DURATION = {
  SHORT: 200,
  MEDIUM: 500,
  LONG: 1000,
};

// API routes
export const API_ROUTES = {
  ALERTS: '/api/alerts',
  TOPOLOGY: '/api/topology',
  NEO4J: '/api/neo4j',
};

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'vncs-theme',
  USER_PREFERENCES: 'vncs-user-preferences',
};

// Default pagination values
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

// Alert severity colors
export const SEVERITY_COLORS = {
  Critical: 'bg-error-500',
  High: 'bg-error-400',
  Medium: 'bg-warning-400',
  Low: 'bg-success-400',
};

// Alert status colors
export const STATUS_COLORS = {
  New: 'bg-primary-500',
  Acknowledged: 'bg-primary-400',
  'In Progress': 'bg-warning-400',
  Resolved: 'bg-success-500',
  Suppressed: 'bg-gray-400',
};

// Node type colors for topology graph
export const NODE_TYPE_COLORS = {
  Service: '#3B82F6',
  API: '#14B8A6',
  Host: '#F97316',
  Pod: '#8B5CF6',
  Application: '#EC4899',
  Database: '#06B6D4',
  Network: '#64748B',
  Storage: '#84CC16',
  BusinessService: '#EAB308', 
  Container: '#9333EA',
  Cluster: '#D946EF',
  VirtualMachine: '#F43F5E',
};

// Edge type colors for topology graph
export const EDGE_TYPE_COLORS = {
  DEPENDS_ON: '#94A3B8',
  COMMUNICATES_WITH: '#60A5FA',
  HOSTS: '#34D399',
  CONTAINS: '#A3E635',
  BELONGS_TO: '#FCD34D',
  RUNS_ON: '#FB7185',
  CONNECTS_TO: '#C084FC',
};

// Mock data for development and testing
export const MOCK_ALERTS = [
  {
    id: 'ALT-001',
    alertType: 'Anomaly',
    severity: 'Critical',
    status: 'New',
    timestamp: '2023-06-15T10:32:00Z',
    entityName: 'payment-service',
    entityType: 'Service',
    mappedBusinessService: 'PaymentGateway',
    sourceSignal: 'CloudWatch',
    metricTriggered: 'cpu_utilization',
    currentValue: '92%',
    baselineThreshold: '75%',
    rootCauseIndicators: ['memory_leak', 'io_wait'],
    anomalyConfidence: 0.95,
    detectionModel: 'sagemaker-rf-v3',
    alertSummary: 'Unusual CPU spike on payment service',
    relatedAlerts: ['ALT-002', 'ALT-003'],
    ownerTeam: 'Platform Engineering',
  },
  {
    id: 'ALT-002',
    alertType: 'Rule-Based',
    severity: 'High',
    status: 'Acknowledged',
    timestamp: '2023-06-15T10:30:00Z',
    entityName: 'user-auth-api',
    entityType: 'API',
    mappedBusinessService: 'CustomerOnboarding',
    sourceSignal: 'Dynatrace',
    metricTriggered: 'error_rate',
    currentValue: '5.2%',
    baselineThreshold: '1%',
    rootCauseIndicators: ['database_timeout', 'throttling'],
    anomalyConfidence: 0.87,
    detectionModel: 'rule_error_rate_v1',
    alertSummary: 'Elevated error rate in authentication service',
    relatedAlerts: ['ALT-001'],
    ownerTeam: 'Auth Team',
  },
  {
    id: 'ALT-003',
    alertType: 'Threshold Breach',
    severity: 'Medium',
    status: 'In Progress',
    timestamp: '2023-06-15T10:28:00Z',
    entityName: 'postgres-main',
    entityType: 'Database',
    mappedBusinessService: 'Core Data Services',
    sourceSignal: 'Prometheus',
    metricTriggered: 'connection_count',
    currentValue: '980',
    baselineThreshold: '800',
    rootCauseIndicators: ['connection_leak', 'load_spike'],
    anomalyConfidence: 0.72,
    detectionModel: 'threshold_db_connections',
    alertSummary: 'Database connection pool near capacity',
    relatedAlerts: [],
    ownerTeam: 'Database Team',
  },
];

export const MOCK_TOPOLOGY = {
  nodes: [
    { id: 'n1', label: 'payment-service', type: 'Service', properties: { version: 'v2.3.0' }, status: 'Critical' },
    { id: 'n2', label: 'user-auth-api', type: 'API', properties: { version: 'v1.5.2' }, status: 'Warning' },
    { id: 'n3', label: 'postgres-main', type: 'Database', properties: { version: '13.4' }, status: 'Warning' },
    { id: 'n4', label: 'redis-cache', type: 'Database', properties: { version: '6.2.0' }, status: 'Healthy' },
    { id: 'n5', label: 'payment-gateway', type: 'BusinessService', properties: {}, status: 'Critical' },
    { id: 'n6', label: 'auth-service', type: 'BusinessService', properties: {}, status: 'Warning' },
    { id: 'n7', label: 'app-server-1', type: 'Host', properties: { os: 'Ubuntu 22.04' }, status: 'Critical' },
    { id: 'n8', label: 'app-server-2', type: 'Host', properties: { os: 'Ubuntu 22.04' }, status: 'Healthy' },
    { id: 'n9', label: 'db-server-1', type: 'Host', properties: { os: 'RHEL 8' }, status: 'Warning' },
  ],
  edges: [
    { id: 'e1', source: 'n1', target: 'n3', type: 'DEPENDS_ON', properties: {} },
    { id: 'e2', source: 'n1', target: 'n4', type: 'DEPENDS_ON', properties: {} },
    { id: 'e3', source: 'n2', target: 'n3', type: 'DEPENDS_ON', properties: {} },
    { id: 'e4', source: 'n5', target: 'n1', type: 'CONTAINS', properties: {} },
    { id: 'e5', source: 'n6', target: 'n2', type: 'CONTAINS', properties: {} },
    { id: 'e6', source: 'n1', target: 'n7', type: 'RUNS_ON', properties: {} },
    { id: 'e7', source: 'n2', target: 'n8', type: 'RUNS_ON', properties: {} },
    { id: 'e8', source: 'n3', target: 'n9', type: 'RUNS_ON', properties: {} },
    { id: 'e9', source: 'n4', target: 'n9', type: 'RUNS_ON', properties: {} },
    { id: 'e10', source: 'n2', target: 'n1', type: 'COMMUNICATES_WITH', properties: {} },
  ]
};