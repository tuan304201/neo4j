# VNCS XOP Solution

A modern monitoring and observability platform with alert management and topology visualization capabilities.

## Features

- Alert Management with advanced filtering and bulk actions
- Topology visualization using Neo4j
- Dark mode support
- Responsive design
- Real-time updates

## API Integration

### Alert Management API

The alert management system is designed to integrate with any REST API. Update the `alertService.ts` file with your API endpoints:

```typescript
// src/services/alertService.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getAlerts = async (filters?: AlertFilterOptions): Promise<Alert[]> => {
  const response = await fetch(`${API_BASE_URL}/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filters }),
  });
  return response.json();
};

export const updateAlertStatus = async (id: string, status: Alert['status']): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/alerts/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
  return response.ok;
};
```

### Neo4j Integration

The topology visualization integrates with Neo4j through the `neo4jService.ts`. Configure your Neo4j connection:

```typescript
// src/services/neo4jService.ts

import neo4j from 'neo4j-driver';

const NEO4J_URI = import.meta.env.VITE_NEO4J_URI;
const NEO4J_USER = import.meta.env.VITE_NEO4J_USER;
const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD;

const driver = neo4j.driver(
  NEO4J_URI,
  neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
);

export const getTopologyGraph = async (): Promise<GraphData> => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN n, r, m
    `);
    
    return transformNeo4jToGraphData(result);
  } finally {
    await session.close();
  }
};
```

## Environment Variables

Create a `.env` file with your API configuration:

```env
VITE_API_BASE_URL=http://your-api-url
VITE_NEO4J_URI=neo4j://your-neo4j-instance
VITE_NEO4J_USER=neo4j
VITE_NEO4J_PASSWORD=your-password
```

## API Requirements

### Alert Management API Endpoints

Required endpoints for full functionality:

```
GET    /api/alerts
POST   /api/alerts/search
PUT    /api/alerts/:id/status
PUT    /api/alerts/:id/assign
POST   /api/alerts/bulk/suppress
POST   /api/alerts/bulk/assign
GET    /api/alerts/:id/related
```

Response format for alerts:

```typescript
interface Alert {
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
```

### Neo4j Graph Data Format

Required Cypher query results format:

```typescript
interface Node {
  id: string;
  label: string;
  type: NodeType;
  properties: Record<string, any>;
  metrics?: Record<string, any>;
  status?: 'Healthy' | 'Warning' | 'Critical' | 'Unknown';
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  properties: Record<string, any>;
  metrics?: Record<string, any>;
}
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Production Deployment

Build the application:

```bash
npm run build
```

The built files will be in the `dist` directory, ready to be served by any static file server.

## License

MIT