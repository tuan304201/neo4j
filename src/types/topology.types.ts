export interface Node {
  id: string;
  label: string;
  type: NodeType;
  properties: Record<string, any>;
  metrics?: Record<string, any>;
  status?: 'Healthy' | 'Warning' | 'Critical' | 'Unknown';
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  properties: Record<string, any>;
  metrics?: Record<string, any>;
}

export type NodeType = 
  | 'Service' 
  | 'API' 
  | 'Host' 
  | 'Pod' 
  | 'Application' 
  | 'Database' 
  | 'Network' 
  | 'Storage' 
  | 'BusinessService'
  | 'Container'
  | 'Cluster'
  | 'VirtualMachine';

export type EdgeType = 
  | 'DEPENDS_ON' 
  | 'COMMUNICATES_WITH' 
  | 'HOSTS' 
  | 'CONTAINS' 
  | 'BELONGS_TO' 
  | 'RUNS_ON'
  | 'CONNECTS_TO';

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export interface GraphLayoutOptions {
  layout: 'force' | 'hierarchical' | 'circular' | 'grid';
  nodeSpacing: number;
  edgeLength: number;
  animate: boolean;
}

export interface GraphFilterOptions {
  nodeTypes: NodeType[];
  edgeTypes: EdgeType[];
  status: ('Healthy' | 'Warning' | 'Critical' | 'Unknown')[];
  nodeLabels: string[];
}

export interface Neo4jCredentials {
  url: string;
  username: string;
  password: string;
  database: string;
}