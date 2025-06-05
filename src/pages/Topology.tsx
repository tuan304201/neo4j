import "aframe";
import React, { useEffect, useState } from "react";
import Card from "../components/common/Card";
import TopologyGraph from "../components/topology/TopologyGraph";
import GraphControls from "../components/topology/GraphControls";
import NodeDetails from "../components/topology/NodeDetails";
import {
  GraphData,
  GraphFilterOptions,
  GraphLayoutOptions,
  Node,
  Edge,
} from "../types/topology.types";
import {
  getTopologyGraph,
  getNodeById,
  getNodeConnections,
  getRelatedNodes,
  searchNodes,
} from "../services/neo4jService";

const Topology: React.FC = () => {
  const [graphData, setGraphData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [filteredData, setFilteredData] = useState<GraphData>({
    nodes: [],
    edges: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeConnections, setNodeConnections] = useState<Edge[]>([]);
  const [relatedNodes, setRelatedNodes] = useState<Node[]>([]);

  const [layoutOptions, setLayoutOptions] = useState<GraphLayoutOptions>({
    layout: "force",
    nodeSpacing: 100,
    edgeLength: 150,
    animate: true,
  });

  const [filterOptions, setFilterOptions] = useState<GraphFilterOptions>({
    nodeTypes: [],
    edgeTypes: [],
    status: [],
    nodeLabels: [],
  });

  useEffect(() => {
    fetchTopologyData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [graphData, filterOptions]);

  const fetchTopologyData = async () => {
    setLoading(true);
    try {
      const data = await getTopologyGraph();
      setGraphData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching topology data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let nodes = [...graphData.nodes];
    let edges = [...graphData.edges];

    // Apply node type filter
    if (filterOptions.nodeTypes.length > 0) {
      nodes = nodes.filter((node) =>
        filterOptions.nodeTypes.includes(node.type)
      );

      // Keep only edges between filtered nodes
      const nodeIds = nodes.map((node) => node.id);
      edges = edges.filter(
        (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
      );
    }

    // Apply edge type filter
    if (filterOptions.edgeTypes.length > 0) {
      edges = edges.filter((edge) =>
        filterOptions.edgeTypes.includes(edge.type)
      );

      // Make sure we include nodes connected by these edges
      const nodeIdsInEdges = new Set<string>();
      edges.forEach((edge) => {
        nodeIdsInEdges.add(edge.source);
        nodeIdsInEdges.add(edge.target);
      });

      // If we're filtering by both node and edge types, respect the node filter
      if (filterOptions.nodeTypes.length > 0) {
        nodes = nodes.filter((node) => nodeIdsInEdges.has(node.id));
      } else {
        nodes = graphData.nodes.filter((node) => nodeIdsInEdges.has(node.id));
      }
    }

    // Apply status filter
    if (filterOptions.status.length > 0) {
      nodes = nodes.filter(
        (node) => node.status && filterOptions.status.includes(node.status)
      );

      // Keep only edges between filtered nodes
      const nodeIds = nodes.map((node) => node.id);
      edges = edges.filter(
        (edge) => nodeIds.includes(edge.source) && nodeIds.includes(edge.target)
      );
    }

    setFilteredData({ nodes, edges });
  };

  const handleNodeClick = async (nodeId: string) => {
    try {
      const node = await getNodeById(nodeId);
      if (node) {
        setSelectedNode(node);

        // Get node connections and related nodes
        const connections = await getNodeConnections(nodeId);
        setNodeConnections(connections);

        const related = await getRelatedNodes(nodeId);
        setRelatedNodes(related);
      }
    } catch (error) {
      console.error("Error fetching node details:", error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      // Reset to filtered view based on current filters
      applyFilters();
      return;
    }

    setLoading(true);
    try {
      const matchingNodes = await searchNodes(query);

      // If we have filters, apply them to search results
      if (
        filterOptions.nodeTypes.length > 0 ||
        filterOptions.status.length > 0
      ) {
        const filteredMatchingNodes = matchingNodes.filter((node) => {
          const matchesType =
            filterOptions.nodeTypes.length === 0 ||
            filterOptions.nodeTypes.includes(node.type);
          const matchesStatus =
            filterOptions.status.length === 0 ||
            (node.status && filterOptions.status.includes(node.status));
          return matchesType && matchesStatus;
        });

        // Get edges between these nodes
        const nodeIds = filteredMatchingNodes.map((node) => node.id);
        const relevantEdges = graphData.edges.filter(
          (edge) =>
            nodeIds.includes(edge.source) &&
            nodeIds.includes(edge.target) &&
            (filterOptions.edgeTypes.length === 0 ||
              filterOptions.edgeTypes.includes(edge.type))
        );

        setFilteredData({
          nodes: filteredMatchingNodes,
          edges: relevantEdges,
        });
      } else {
        // Get edges between matching nodes
        const nodeIds = matchingNodes.map((node) => node.id);
        const relevantEdges = graphData.edges.filter(
          (edge) =>
            nodeIds.includes(edge.source) &&
            nodeIds.includes(edge.target) &&
            (filterOptions.edgeTypes.length === 0 ||
              filterOptions.edgeTypes.includes(edge.type))
        );

        setFilteredData({
          nodes: matchingNodes,
          edges: relevantEdges,
        });
      }
    } catch (error) {
      console.error("Error searching nodes:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
        Topology
      </h1>

      <Card>
        <GraphControls
          layoutOptions={layoutOptions}
          onLayoutChange={setLayoutOptions}
          filterOptions={filterOptions}
          onFilterChange={setFilterOptions}
          onRefresh={fetchTopologyData}
          onZoomIn={() => console.log("Zoom in")}
          onZoomOut={() => console.log("Zoom out")}
          onResetView={() => console.log("Reset view")}
          onSaveLayout={() => console.log("Save layout")}
          onSearch={handleSearch}
        />

        <div className="mt-6">
          {loading ? (
            <div className="h-[600px] flex items-center justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="ml-2 text-gray-600 dark:text-gray-300">
                Loading topology...
              </p>
            </div>
          ) : (
            <TopologyGraph
              data={filteredData}
              layoutOptions={layoutOptions}
              onNodeClick={handleNodeClick}
              height={600}
            />
          )}
        </div>
      </Card>

      {selectedNode && (
        <NodeDetails
          node={selectedNode}
          relatedNodes={relatedNodes}
          connections={nodeConnections}
          onClose={() => setSelectedNode(null)}
          onNodeSelect={handleNodeClick}
        />
      )}
    </div>
  );
};

export default Topology;
