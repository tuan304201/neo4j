import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Neovis from "neovis.js";
import neo4j from "neo4j-driver";

// Type definitions
interface Alert {
  source: string;
  title: string;
  alert_id: string | number;
  path: string;
  entityId: string;
  displayName: string;
}

interface Incident {
  incident_name?: string;
  incident_time?: string;
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

interface Neo4jNode {
  properties?: Record<string, any>;
  labels?: string[];
}

declare global {
  interface Window {
    Neovis: any;
    neo4j: any;
  }
}

// NodeDetails Component
interface NodeDetailsProps {
  selectedNodeDetails: NodeDetails;
  incidents: Incident[];
  getAssignedColor: (item: string) => string;
}

const logIncidentName = (name: string, time: string): void => {
  console.log({ name, time });
};

const logIncidentTime = (name: string, time: string): void => {
  console.log({ name, time });
};

const NodeDetails: React.FC<NodeDetailsProps> = ({ selectedNodeDetails, incidents, getAssignedColor }) => {
  const formatIncidentTime = (time: string | undefined): string => {
    if (!time || time === "Unknown") return "Unknown";
    try {
      const date = new Date(time);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      });
    } catch (error) {
      console.error("Error formatting incident time:", error);
      return "Unknown";
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <h2 className="text-lg font-bold mb-3 text-gray-800">Node details</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedNodeDetails.labels?.map((label) => (
          <span
            key={label}
            className="px-3 py-1 text-sm font-medium rounded-full cursor-default text-white"
            style={{ backgroundColor: getAssignedColor(label) }}
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
          {Object.entries(selectedNodeDetails.properties || {}).map(([key, value]) => (
            <tr key={key} className="border-b border-gray-200">
              <td className="p-2 font-mono align-top">{key}</td>
              <td className="p-2 font-mono break-all">{String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedNodeDetails.alerts && selectedNodeDetails.alerts.length > 0 && (
        <div className="mt-4">
          {/* Incident Information Section */}
          {selectedNodeDetails.alerts.map((alert, index) => {
            const incident = incidents.find((inc) => inc.alerts.some((a) => a.alert_id === alert.alert_id));
            const incidentName = incident?.incident_name || "Unknown";
            const incidentTime = formatIncidentTime(incident?.incident_time);

            return (
              <div key={`incident-${index}`} className="mb-4">
                <h3 className="font-bold mb-2 text-gray-800">Incident Information</h3>
                <div className="text-sm border-t border-gray-200 p-2 bg-red-50 rounded mb-2">
                  <div className="p-2">
                    <div className="text-gray-600 text-xs mb-2">
                      <strong>Name: </strong>
                      <p className="text-sm font-semibold text-red-800">{incidentName}</p>
                    </div>
                    <div className="text-gray-600 text-xs mb-2">
                      <strong>Time: </strong>
                      <span className="font-mono text-xs text-gray-600 break-words">{incidentTime}</span>
                    </div>
                    {incidentName !== "Unknown" && incidentTime !== "Unknown" && (
                      <div className="flex gap-2 justify-evenly mt-5">
                        <button
                          className="px-3 py-1 text-sm font-medium bg-blue-500 text-white  rounded hover:bg-blue-300 transition"
                          onClick={() => logIncidentName(incidentName, incidentTime)}
                        >
                          Chat AI 1
                        </button>
                        <button
                          className="px-3 py-1 text-sm font-medium bg-blue-500 text-white  rounded hover:bg-blue-300 transition"
                          onClick={() => logIncidentTime(incidentName, incidentTime)}
                        >
                          Chat AI 2
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Alerts Section */}
          <h3 className="text-md font-bold mb-2 text-gray-800">Associated Alerts</h3>
          {selectedNodeDetails.alerts.map((alert, index) => (
            <div key={index} className="text-sm border-t border-gray-200 p-4 pb-6 bg-red-50 rounded mb-2">
              <strong className="text-gray-600 text-xs mb-2">Title:</strong>
              <p className="font-semibold text-red-800 break-words">{alert.title}</p>
              <div className="font-mono text-xs text-gray-600 mt-2 space-y-1 break-words">
                <p>
                  <strong>Entity ID:</strong> {alert.entityId}
                </p>
                <p>
                  <strong>Path:</strong> {alert.path}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GraphComponent: React.FC = () => {
  // State
  const [statusMessage, setStatusMessage] = useState<string>("Đang khởi tạo...");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [nodeLabelCounts, setNodeLabelCounts] = useState<NodeLabelCount[]>([]);
  const [relationshipTypeCounts, setRelationshipTypeCounts] = useState<RelationshipTypeCount[]>([]);
  const [activeNodeLabels, setActiveNodeLabels] = useState<Set<string>>(new Set());
  const [selectedNodeDetails, setSelectedNodeDetails] = useState<NodeDetails | null>(null);
  const [nodeFilterText, setNodeFilterText] = useState<string>("");

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
            "[UAT] SmartCredit JVM Heap Usage Over 70% {alertname=[UAT] SmartCredit JVM Heap Usage Over 70%, grafana_folder=Smart Credit, instance= tcb-pt-rdb-heimdall-proxy-baseline, job=cf-deploy} - B=70.046663, C=1.000000",
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
    {
      alerts: [
        {
          source: "Grafana 2",
          title: "TEST 2",
          alert_id: "135",
          path: "s3://vncs-aiops-data/telemetry/grafana/ingest_year=2025/ingest_month=06/ingest_day=03/ingest_hour=07/run-1748934502023-part-r-00000",
          entityId: "KUBERNETES_CLUSTER-46633836AB3EE44C",
          displayName: "rdb-pt",
        },
      ],
    },
    {
      alerts: [
        {
          source: "Grafana 3",
          title: "TEST 3",
          alert_id: "137",
          path: "s3://vncs-aiops-data/telemetry/grafana/ingest_year=2025/ingest_month=06/ingest_day=03/ingest_hour=07/run-1748934502023-part-r-00000",
          entityId: "PROCESS_GROUP_INSTANCE-05C45F918283E2DB",
          displayName: "vn.techcombank.pdms.Application rdb-pdms-service-dis-* (rdb-pdms-service-dis-99d6db648-w7bl6)",
        },
      ],
    },
  ];

  // Constants
  const NEO4J_URL = import.meta.env.VITE_NEO4J_URI;
  const NEO4J_USER = import.meta.env.VITE_NEO4J_USER;
  const NEO4J_PASSWORD = import.meta.env.VITE_NEO4J_PASSWORD;

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

  // Computed values
  const totalNodes = useMemo(() => nodeLabelCounts.reduce((sum, item) => sum + item.count, 0), [nodeLabelCounts]);

  const totalRelationships = useMemo(
    () => relationshipTypeCounts.reduce((sum, item) => sum + item.count, 0),
    [relationshipTypeCounts],
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

  const alertedEntityNames = useMemo(() => new Set(alertsByDisplayName.keys()), [alertsByDisplayName]);

  const filteredNodeLabelCounts = useMemo(() => {
    if (!nodeFilterText) {
      return nodeLabelCounts;
    }
    const filter = nodeFilterText.toLowerCase();
    return nodeLabelCounts.filter((item) => item.label.toLowerCase().includes(filter));
  }, [nodeLabelCounts, nodeFilterText]);

  // Helper functions
  const assignedColors = useRef<Record<string, string>>({});
  let colorIndex = useRef<number>(0);

  const getAssignedColor = useCallback(
    (item: string): string => {
      if (!assignedColors.current[item]) {
        assignedColors.current[item] = colorPalette[colorIndex.current % colorPalette.length];
        colorIndex.current++;
      }
      return assignedColors.current[item];
    },
    [colorPalette],
  );

  const stopBlinkingAnimation = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
  }, []);

  const startBlinkingAnimation = useCallback(
    (nodeIds: string[]) => {
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
          return { id, color: { background: newColor, border: blinkColor } };
        });

        if (updates.length > 0) networkNodes.update(updates);
        animationFrameIdRef.current = requestAnimationFrame(animate);
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    },
    [stopBlinkingAnimation],
  );

  // Core functions
  const fetchOverviewData = useCallback(async () => {
    if (!neo4j) {
      console.error("Neo4j driver not available. Using mock data.");
      setIsLoading(true);
      setStatusMessage("Đang tải dữ liệu (mock)...");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockLabels = [
        { label: "Host", count: 10 },
        { label: "Application", count: 5 },
        { label: "Service", count: 15 },
      ];
      const mockRels = [
        { type: "CONNECTS_TO", count: 20 },
        { type: "DEPENDS_ON", count: 8 },
      ];

      setNodeLabelCounts(mockLabels.map((r) => ({ ...r, count: r.count, color: getAssignedColor(r.label) })));
      setRelationshipTypeCounts(mockRels.map((r) => ({ ...r, count: r.count, color: getAssignedColor(r.type) })));

      setIsLoading(false);
      setStatusMessage("Sẵn sàng.");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Đang tải dữ liệu tổng quan...");

    const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const labelsQuery = `MATCH (n) UNWIND labels(n) AS label RETURN label, count(n) AS count ORDER BY count DESC`;
    const relsQuery = `MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY count DESC`;

    try {
      const [labelsResult, relsResult] = await Promise.all([
        driver.session().run(labelsQuery),
        driver.session().run(relsQuery),
      ]);

      setNodeLabelCounts(
        labelsResult.records.map((r: any) => ({
          label: r.get("label"),
          count: r.get("count").toNumber(),
          color: getAssignedColor(r.get("label")),
        })),
      );

      setRelationshipTypeCounts(
        relsResult.records.map((r: any) => ({
          type: r.get("type"),
          count: r.get("count").toNumber(),
          color: getAssignedColor(r.get("type")),
        })),
      );
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
      neovisInstanceRef.current.renderWithCypher("MATCH (n) WHERE false RETURN n");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Đang tải...");

    const cypher = `MATCH (n) WHERE any(label IN labels(n) WHERE label IN $labels) OPTIONAL MATCH (n)-[r]-(m) RETURN n, r, m`;
    neovisInstanceRef.current.renderWithCypher(cypher, { labels });
  }, [activeNodeLabels, stopBlinkingAnimation]);

  const toggleNodesByType = useCallback((label: string) => {
    setActiveNodeLabels((prev) => {
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
    setActiveNodeLabels(new Set(nodeLabelCounts.map((item) => item.label)));
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
    renderActiveGraph();
  }, [activeNodeLabels, renderActiveGraph]);

  useEffect(() => {
    const initializeNeovis = async () => {
      if (!Neovis || !neo4j) {
        console.error("Neovis or Neo4j not available. Make sure to include the required scripts.");
        setStatusMessage("Required libraries not loaded");
        setIsLoading(false);
        return;
      }

      await fetchOverviewData();

      const dynamicLabelsConfig: Record<string, any> = {};
      nodeLabelCounts.forEach((item) => {
        dynamicLabelsConfig[item.label] = { color: item.color };
      });

      const config = {
        containerId: "viz",
        neo4j: {
          serverUrl: NEO4J_URL,
          serverUser: NEO4J_USER,
          serverPassword: NEO4J_PASSWORD,
        },
        initialCypher: `MATCH (n) WHERE false RETURN n`,
        visConfig: {
          physics: {
            enabled: true,
            forceAtlas2Based: {
              gravitationalConstant: -50,
              centralGravity: 0.01,
              springLength: 230,
              springConstant: 0.05,
            },
            maxVelocity: 50,
            minVelocity: 0.75,
            solver: "forceAtlas2Based",
            stabilization: { iterations: 2000 },
          },
          interaction: { hover: false },
        },
        labels: {
          ...dynamicLabelsConfig,
          [Neovis.NEOVIS_DEFAULT_CONFIG]: {
            size: 25,
            label: (n: Neo4jNode) => n.properties?.displayName || n.properties?.entityId || n.properties?.type || "",
          },
        },
      };

      try {
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
                if (alertedEntityNames.has(nodeName)) {
                  blinkingNodeIds.push(node.id);
                }
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
                    alerts: associatedAlerts || [],
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
      } catch (error) {
        console.error("Error initializing Neovis:", error);
        setStatusMessage("Error initializing graph visualization");
        setIsLoading(false);
      }
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
    <div className="flex flex-col h-full rounded overflow-hidden bg-white text-gray-800 font-sans">
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
          {selectedNodeDetails ? (
            <NodeDetails
              selectedNodeDetails={selectedNodeDetails}
              incidents={incidents}
              getAssignedColor={getAssignedColor}
            />
          ) : (
            /* Overview View (Default) */
            <div>
              <h2 className="text-lg font-bold mb-3 text-gray-800">Results overview</h2>
              <div className="mb-6">
                {/* Node Filter Input */}
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
                          ? "opacity-40 hover:opacity-70"
                          : ""
                      } ${activeNodeLabels.has(item.label) ? "ring-2 ring-offset-2 ring-blue-500" : ""}`}
                      style={{ backgroundColor: item.color }}
                    >
                      {item.label} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-600 mb-2">Relationships ({totalRelationships})</h3>
                <div className="flex flex-wrap gap-2">
                  {relationshipTypeCounts.map((item) => (
                    <span
                      key={item.type}
                      className="px-3 py-1 text-sm font-medium rounded-full cursor-default text-white"
                      style={{ backgroundColor: item.color }}
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

export default GraphComponent;
