import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import neo4j from 'neo4j-driver';
import Neovis from 'neovis.js';

interface Alert {
  source: string;
  title: string;
  alert_id: string | number;
  path: string;
  entityId: string;
  displayName: string;
}

interface Incident {
  incident_name: string;
  incident_time: string;
  alerts: Alert[];
}

interface NodeLabelCount {
  label: string;
  count: number;
  color: string;
}

interface RelationshipTypeCount {
  type: string;
  count: number;
  color: string;
}

interface NodeDetails {
  labels: string[];
  properties: Record<string, any>;
  alerts?: Alert[];
}

const Neo4jViz: React.FC = () => {
  // State
  const [statusMessage, setStatusMessage] = useState("Đang khởi tạo...");
  const [isLoading, setIsLoading] = useState(true);
  const [nodeLabelCounts, setNodeLabelCounts] = useState<NodeLabelCount[]>([]);
  const [relationshipTypeCounts, setRelationshipTypeCounts] = useState<RelationshipTypeCount[]>([]);
  const [activeNodeLabels, setActiveNodeLabels] = useState<Set<string>>(new Set());
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<NodeDetails | null>(null);
  const [nodeFilterText, setNodeFilterText] = useState("");

  // Refs
  const neovisInstanceRef = useRef<any>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Alert data
  const incidents: Incident[] = [
    {
      incident_name: "Service Degradation: Success Rate Triggered",
      incident_time: "2025-06-03T07:07:14.572000+00:00",
      alerts: [
        {
          source: "Grafana",
          title:
              "[UAT] SmartCredit JVM Heap Usage Over 70% {alertname=[UAT] SmartCredit JVM Heap Usage Over 70%, grafana_folder=Smart Credit, instance=	tcb-pt-rdb-heimdall-proxy-baseline, job=cf-deploy} - B=70.046663, C=1.000000",
          alert_id: 133,
          path: "s3://vncs-aiops-data/telemetry/grafana/ingest_year=2025/ingest_month=06/ingest_day=03/ingest_hour=07/run-1748934502023-part-r-00000",
          entityId: "HOST-E095176FF0424EB4",
          displayName: "tcb-pt-rdb-heimdall-proxy-baseline",
        },
        {
          source: "Solarwinds",
          title: "ALERT: Node DX-PA5280-01 is Down",
          alert_id: "ALERT: Node DX-PA5280-01 is Down",
          path: "s3://vncs-aiops-data/telemetry/solarwinds/ingest_year=2025/ingest_month=06/ingest_day=06/ingest_hour=03/run-1749180802733-part-r-00000",
          entityId: "3456-dfgbhn-bvc-sdfg",
          displayName: "DX-PA5280-01",
        },
      ],
    },
  ];

  // Neo4j Connection
  // const NEO4J_URL = "neo4j://192.168.1.109:7687";
  // const NEO4J_USER = "neo4j";
  // const NEO4J_PASSWORD = "123123123";
  const NEO4J_URL = import.meta.env.VITE_NEO4J_URI || "bolt://localhost:7687";
  const NEO4J_USER = import.meta.env.VITE_NEO4J_USER || "neo4j";
  const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD || "neo4j";

  // Color palette
  const colorPalette = [
    "#588BAE",
    "#FF6961",
    "#6D3B47",
    "#6EB4D1",
    "#CF4647",
    "#4D545E",
    "#E4A66B",
    "#62929E",
    "#934553",
    "#94C5CC",
    "#F4C2C2",
    "#7E8A97",
  ];
  const assignedColorsRef = useRef<Record<string, string>>({});
  const colorIndexRef = useRef(0);

  // Computed values
  const totalNodes = useMemo(() =>
          nodeLabelCounts.reduce((sum, item) => sum + item.count, 0),
      [nodeLabelCounts]
  );

  const totalRelationships = useMemo(() =>
          relationshipTypeCounts.reduce((sum, item) => sum + item.count, 0),
      [relationshipTypeCounts]
  );

  const alertsByDisplayName = useMemo(() => {
    const map = new Map<string, Alert[]>();
    incidents.forEach((incident) => {
      incident.alerts.forEach((alert) => {
        if (alert.displayName) {
          if (!map.has(alert.displayName)) map.set(alert.displayName, []);
          map.get(alert.displayName)!.push(alert);
        }
      });
    });
    return map;
  }, [incidents]);

  const alertedEntityNames = useMemo(() =>
          new Set(alertsByDisplayName.keys()),
      [alertsByDisplayName]
  );

  const filteredNodeLabelCounts = useMemo(() => {
    if (!nodeFilterText) {
      return nodeLabelCounts;
    }
    const filter = nodeFilterText.toLowerCase();
    return nodeLabelCounts.filter((item) =>
        item.label.toLowerCase().includes(filter)
    );
  }, [nodeLabelCounts, nodeFilterText]);

  // Helper functions
  const getAssignedColor = useCallback((item: string): string => {
    if (!assignedColorsRef.current[item]) {
      assignedColorsRef.current[item] = colorPalette[colorIndexRef.current % colorPalette.length];
      colorIndexRef.current++;
    }
    return assignedColorsRef.current[item];
  }, []);

  const stopBlinkingAnimation = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  }, []);

  const startBlinkingAnimation = useCallback((nodeIds: string[]) => {
    stopBlinkingAnimation();
    if (!neovisInstanceRef.current?.network || nodeIds.length === 0) return;

    const networkNodes = neovisInstanceRef.current.network.body.data.nodes;
    const originalColors = new Map<string, string>();

    nodeIds.forEach((id) => {
      const node = networkNodes.get(id);
      if (node) originalColors.set(id, node.color?.background || "#CCCCCC");
    });

    const duration = 1000;
    let start: number | null = null;

    function animate(timestamp: number) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const alpha = 0.5 * (1 + Math.sin((2 * Math.PI * elapsed) / duration));

      const updates = nodeIds.map((id) => {
        const originalColor = originalColors.get(id);
        const blinkColor = "#FF4136";
        const newColor = alpha > 0.5 ? blinkColor : originalColor;
        return {id, color: {background: newColor, border: blinkColor}};
      });

      if (updates.length > 0) networkNodes.update(updates);
      animationFrameIdRef.current = requestAnimationFrame(animate);
    }

    animationFrameIdRef.current = requestAnimationFrame(animate);
  }, [stopBlinkingAnimation]);

  // Core logic functions
  const fetchOverviewData = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage("Đang tải dữ liệu tổng quan...");

    // Note: You'll need to import neo4j-driver properly
    const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

    const labelsQuery = `MATCH (n) UNWIND labels(n) AS label RETURN label, count(n) AS count ORDER BY count DESC`;
    const relsQuery = `MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY count DESC`;

    try {
      const [labelsResult, relsResult] = await Promise.all([
        driver.session().run(labelsQuery),
        driver.session().run(relsQuery),
      ]);

      setNodeLabelCounts(labelsResult.records.map((r: any) => ({
        label: r.get("label"),
        count: r.get("count").toNumber(),
        color: getAssignedColor(r.get("label")),
      })));

      setRelationshipTypeCounts(relsResult.records.map((r: any) => ({
        type: r.get("type"),
        count: r.get("count").toNumber(),
        color: getAssignedColor(r.get("type")),
      })));
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu tổng quan:", e);
      setStatusMessage("Lỗi tải dữ liệu tổng quan.");
    } finally {
      setIsLoading(false);
      setStatusMessage("Sẵn sàng.");
      await driver.close();
    }
  }, [getAssignedColor]);

  const renderActiveGraph = useCallback(() => {
    stopBlinkingAnimation();
    if (!neovisInstanceRef.current) return;

    const labels = Array.from(activeNodeLabels);
    if (labels.length === 0) {
      clearGraph();
      return;
    }

    setIsLoading(true);
    setStatusMessage(`Đang tải...`);

    const cypher = `MATCH (n) WHERE any(label IN labels(n) WHERE label IN $labels) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m`;
    neovisInstanceRef.current.renderWithCypher(cypher, {labels});
  }, [activeNodeLabels, stopBlinkingAnimation]);

  const toggleNodesByType = useCallback((label: string) => {
    setActiveNodeLabels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  }, []);

  const showAllNodes = useCallback(() => {
    const allLabels = new Set(nodeLabelCounts.map(item => item.label));
    setActiveNodeLabels(allLabels);
  }, [nodeLabelCounts]);

  const clearGraph = useCallback(() => {
    stopBlinkingAnimation();
    if (!neovisInstanceRef.current) return;

    setActiveNodeLabels(new Set());
    setSelectedNodeDetails(null);
    neovisInstanceRef.current.renderWithCypher("MATCH (n) WHERE false RETURN n");
    setStatusMessage("Đã xóa đồ thị.");
  }, [stopBlinkingAnimation]);

  // Effects
  useEffect(() => {
    if (activeNodeLabels.size > 0) {  // Only render if there are active labels
      renderActiveGraph();
    }
  }, [activeNodeLabels, renderActiveGraph]);

  useEffect(() => {
    const initializeNeovis = async () => {
      await fetchOverviewData();

      const dynamicLabelsConfig: Record<string, any> = {};
      nodeLabelCounts.forEach((item) => (dynamicLabelsConfig[item.label] = {color: item.color}));

      const config = {
        containerId: "viz",
        neo4j: {
          serverUrl: NEO4J_URL,
          serverUser: NEO4J_USER,
          serverPassword: NEO4J_PASSWORD
        },
        initialCypher: `MATCH (n) WHERE false RETURN n`,
        visConfig: {
          physics: {
            enabled: true,
            forceAtlas2Based: {
              gravitationalConstant: -50,
              centralGravity: 0.01,
              springLength: 230,
              springConstant: 0.05
            },
            maxVelocity: 50,
            minVelocity: 0.75,
            solver: "forceAtlas2Based",
            stabilization: {iterations: 2000},
          },
          interaction: {hover: false},
        },
        labels: {
          ...dynamicLabelsConfig,
          [Neovis.NEOVIS_DEFAULT_CONFIG]: {
            size: 25,
            label: (n: any) => n.properties?.displayName || n.properties?.entityId || n.properties?.type || "",
          },
        },
      };

      neovisInstanceRef.current = new Neovis(config);
      neovisInstanceRef.current.render();

      neovisInstanceRef.current.registerOnEvent("completed", (eventData: any) => {
        setIsLoading(false);
        const graph = eventData?.graph;
        const nodeCount = graph?.nodes?.length || 0;
        const edgeCount = graph?.edges?.length || 0;

        if (nodeCount > 0) {
          setStatusMessage(`Hiển thị ${nodeCount} nodes và ${edgeCount} relationships.`);
          setTimeout(() => {
            setStatusMessage("");
          }, 2000);
        } else {
          setStatusMessage("Vui lòng chọn một loại node để hiển thị.");
        }

        const network = neovisInstanceRef.current.network;
        if (network) {
          const blinkingNodeIds: string[] = [];
          const visNodes = network.body.data.nodes.get();

          visNodes.forEach((node: any) => {
            const props = node.raw?.properties;
            if (props) {
              const nodeName = props.displayName || props.name;
              if (alertedEntityNames.has(nodeName)) blinkingNodeIds.push(node.id);
            }
          });

          startBlinkingAnimation(blinkingNodeIds);

          network.off("click");
          network.on("click", (params: any) => {
            if (params.nodes.length > 0) {
              const nodeId = params.nodes[0];
              const visNode = neovisInstanceRef.current.network.body.data.nodes.get(nodeId);
              const rawNeo4jNode = visNode?.raw;

              if (rawNeo4jNode) {
                const nodeName = rawNeo4jNode.properties?.displayName || rawNeo4jNode.properties?.name;
                const associatedAlerts = alertsByDisplayName.get(nodeName);
                setSelectedNodeDetails({
                  ...rawNeo4jNode,
                  alerts: associatedAlerts || []
                });
              } else {
                setSelectedNodeDetails(null);
              }
            } else {
              setSelectedNodeDetails(null);
            }
          });
        }
      });

      neovisInstanceRef.current.registerOnEvent("error", (e: any) => {
        setIsLoading(false);
        console.error("Lỗi từ Neovis:", e);
        setStatusMessage("Đã xảy ra lỗi khi vẽ đồ thị.");
      });
    };

    initializeNeovis();

    return () => {
      stopBlinkingAnimation();
      if (neovisInstanceRef.current && typeof neovisInstanceRef.current.network?.destroy === "function") {
        neovisInstanceRef.current.network.destroy();
      }
      neovisInstanceRef.current = null;
    };
  }, []);

  return (
      <div className="flex flex-col h-screen bg-white text-gray-800 font-sans">
        {/* Main Content Area */}
        <div className="flex flex-grow overflow-hidden">
          {/* Graph Visualization Area */}
          <div className="flex-grow relative">
            <div id="viz" className="w-full h-full"></div>
            {isLoading && (
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-white/70 z-10">
                  <div className="bg-white p-5 rounded-lg shadow-md text-lg text-center">
                    <svg
                        className="animate-spin h-8 w-8 text-gray-700 mx-auto mb-3"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                      <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                      />
                      <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {statusMessage}
                  </div>
                </div>
            )}
          </div>

          {/* Results Overview Panel */}
          <div className="flex-shrink-0 w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
            {/* Node details view */}
            {selectedNodeDetails ? (
                <div>
                  <h2 className="text-lg font-bold mb-3 text-gray-800">Node details</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedNodeDetails.labels.map((label) => (
                        <span
                            key={label}
                            className="px-3 py-1 text-sm font-medium rounded-full cursor-default text-white"
                            style={{backgroundColor: getAssignedColor(label)}}
                        >
                    {label}
                  </span>
                    ))}
                  </div>
                  <table className="w-full text-sm text-left mb-4">
                    <thead className="bg-gray-200">
                    <tr>
                      <th className="p-2 font-semibold">Key</th>
                      <th className="p-2 font-semibold">Value</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(selectedNodeDetails.properties).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-200">
                          <td className="p-2 font-mono align-top">{key}</td>
                          <td className="p-2 font-mono break-words">{String(value)}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>

                  {selectedNodeDetails.alerts && selectedNodeDetails.alerts.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-md font-bold mb-2 text-gray-800">Associated Alerts</h3>
                        {selectedNodeDetails.alerts.map((alert, index) => (
                            <div
                                key={index}
                                className="text-sm border-t border-gray-200 p-2 bg-red-50 rounded"
                            >
                              <p className="font-semibold text-red-800 break-words">{alert.title}</p>
                              <div className="font-mono text-xs text-gray-600 mt-2 space-y-1 break-words">
                                <p><strong>Entity ID:</strong> {alert.entityId}</p>
                                <p><strong>Path:</strong> {alert.path}</p>
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
            ) : (
                /* Overview view (default) */
                <div>
                  <h2 className="text-lg font-bold mb-3 text-gray-800">Results overview</h2>
                  <div className="mb-6">
                    {/* Node filter input */}
                    <div className="mb-3">
                      <input
                          type="text"
                          value={nodeFilterText}
                          onChange={(e) => setNodeFilterText(e.target.value)}
                          placeholder="Filter nodes..."
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-600 mb-2">
                      Nodes ({filteredNodeLabelCounts.length}/{totalNodes})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                  <span
                      onClick={clearGraph}
                      className="px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
                  >
                    Clear Graph
                  </span>
                      <span
                          onClick={showAllNodes}
                          className="px-3 py-1 text-sm font-medium rounded-full cursor-pointer transition-all bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                    Show All
                  </span>
                      {filteredNodeLabelCounts.map((item) => (
                          <span
                              key={item.label}
                              onClick={() => toggleNodesByType(item.label)}
                              className={`px-3 py-1 text-sm font-medium rounded-full cursor-pointer text-white transition-all ${
                                  activeNodeLabels.size > 0 && !activeNodeLabels.has(item.label)
                                      ? 'opacity-40 hover:opacity-70'
                                      : ''
                              } ${
                                  activeNodeLabels.has(item.label)
                                      ? 'ring-2 ring-offset-2 ring-blue-500'
                                      : ''
                              }`}
                              style={{backgroundColor: item.color}}
                          >
                      {item.label} ({item.count})
                    </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-600 mb-2">
                      Relationships ({totalRelationships})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {relationshipTypeCounts.map((item) => (
                          <span
                              key={item.type}
                              className="px-3 py-1 text-sm font-medium rounded-full cursor-default text-white"
                              style={{backgroundColor: item.color}}
                          >
                      {item.type} ({item.count})
                    </span>
                      ))}
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default Neo4jViz;