import React, { useEffect, useRef } from "react";
import Neovis, { NeovisConfig } from "neovis.js";

// const alerts = [
//   {
//     alertId: "ALERT-001",
//     hostId: "HOST-E095176FF0424EB4",
//     title: "CPU usage high",
//     description: "CPU usage over 90% for 10 minutes",
//     severity: "high",
//     isRootCause: true,
//   },
//   {
//     alertId: "ALERT-002",
//     hostId: "HOST-OTHERID123",
//     title: "Disk failure",
//     description: "Disk /dev/sda1 read errors",
//     severity: "critical",
//     isRootCause: false,
//   },
//   {
//     alertId: "ALERT-003",
//     hostId: "HOST-E095176FF0424EB4",
//     title: "Memory leak detected",
//     description: "Memory consumption increasing steadily",
//     severity: "medium",
//     isRootCause: false,
//   },
// ];

// const getRootCauseAlertsByHostId = (hostId: string) => {
//   return alerts.filter((alert) => alert.hostId === hostId && alert.isRootCause);
// };

const TopoView: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: NeovisConfig = {
      containerId: "viz",
      neo4j: {
        serverUrl: "neo4j://192.168.1.109:7687",
        serverUser: "neo4j",
        serverPassword: "123123123",
      },
      visConfig: {
        nodes: {
          shape: "circle",
          font: {
            size: 8,
            multi: "html",
            color: "#000",
            face: "arial",
            background: "transparent",
            strokeWidth: 0,
          },
          widthConstraint: {
            maximum: 50,
            minimum: 50,
          },
          scaling: {
            label: {
              enabled: true,
              min: 8,
              max: 12,
            },
          },
          color: {
            border: "#888",
            background: "#eee",
            highlight: {
              border: "#555",
              background: "#ddd",
            },
          },
        },
        edges: {
          arrows: { to: { enabled: true } },
          width: 2,
          smooth: { enabled: true, type: "dynamic", roundness: 0.5 },
        },
        physics: {
          enabled: true,
          forceAtlas2Based: {
            gravitationalConstant: -10000,
            centralGravity: 0.001,
            springLength: 300,
            springConstant: 0.01,
          },
          minVelocity: 0.75,
          solver: "barnesHut",
          stabilization: {
            enabled: true,
            iterations: 1500,
            updateInterval: 10,
          },
        },
        interaction: {
          dragNodes: true,
          dragView: true,
          zoomView: true,
          hover: true,
        },
      },
      labels: {
        EC2_INSTANCE: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        HOST: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        Entity: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        Host: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        DISK: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        CONTAINER_GROUP: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        CONTAINER_GROUP_INSTANCE: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        PROCESS_GROUP: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        PROCESS_GROUP_INSTANCE: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        SERVICE: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        AWS_AVAILABILITY_ZONE: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        KUBERNETES_CLUSTER: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        NETWORK_INTERFACE: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        Node: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) => node.properties?.type || node.properties?.entityId || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        CoreSwitch: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) =>
                node.properties?.type || node.properties?.entityId || node.properties?.name || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        Firewall: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) =>
                node.properties?.type || node.properties?.entityId || node.properties?.name || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        Switch: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) =>
                node.properties?.type || node.properties?.entityId || node.properties?.name || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        LoadBalancer: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) =>
                node.properties?.type || node.properties?.entityId || node.properties?.name || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        Server: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) =>
                node.properties?.type || node.properties?.entityId || node.properties?.name || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        Gateway: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) =>
                node.properties?.type || node.properties?.entityId || node.properties?.name || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
        ExternalNetwork: {
          size: "10",
          [Neovis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              label: (node: any) =>
                node.properties?.type || node.properties?.entityId || node.properties?.name || node.id,
              title: (node: any) =>
                `Entity ID: ${node.properties?.entityId || node.properties?.name || "-"}\n` +
                `Name: ${node.properties?.displayName || node.properties?.name || "-"}\n` +
                `Type: ${node.properties?.type || "-"}`,
            },
          },
        },
      },
      initialCypher: `
        MATCH (n)-[r]->(m)
        RETURN n, r, m
      `,
    };

    const viz = new Neovis(config);
    viz.render();

    // viz.registerOnEvent("completed", () => {
    //   const network = viz.network;
    //   if (!network) return;

    //   const allNodes = network.body.data.nodes.get();

    //   const flashingNodes = allNodes.filter((node: any) => node.label?.toUpperCase() === "HOST");

    //   let start: number | null = null;
    //   const duration = 1000;

    //   const animateBlink = (timestamp: number) => {
    //     if (!start) start = timestamp;
    //     const elapsed = timestamp - start;

    //     const alpha = (Math.sin((elapsed / duration) * Math.PI * 2) + 1) / 2;
    //     const r = 255;
    //     const g = Math.round(255 * (1 - alpha));
    //     const b = Math.round(255 * (1 - alpha));
    //     const backgroundColor = `rgba(${r},${g},${b},1)`;

    //     flashingNodes.forEach((node: any) => {
    //       network.body.data.nodes.update({
    //         id: node.id,
    //         color: {
    //           background: backgroundColor,
    //           border: "#555",
    //         },
    //       });
    //     });

    //     requestAnimationFrame(animateBlink);
    //   };

    //   requestAnimationFrame(animateBlink);

    //   network.on("click", (params: any) => {
    //     if (params.nodes.length > 0) {
    //       const nodeId = params.nodes[0];
    //       const clickedNode = network.body.data.nodes.get(nodeId);

    //       console.log("📌 Node được click:");
    //       console.log(clickedNode);

    //       if (clickedNode && clickedNode.label?.toUpperCase() === "HOST") {
    //         const hostId = clickedNode.title || clickedNode.id;
    //         const hostAlerts = getRootCauseAlertsByHostId(hostId);

    //         if (hostAlerts.length > 0) {
    //           console.log(`🚨 Root Cause Alerts for Host: ${hostId}`);
    //           console.log("=".repeat(50));

    //           hostAlerts.forEach((alert, index) => {
    //             console.log(`Root Cause Alert ${index + 1}:`);
    //             console.log(`  ID: ${alert.alertId}`);
    //             console.log(`  Title: ${alert.title}`);
    //             console.log(`  Description: ${alert.description}`);
    //             console.log(`  Severity: ${alert.severity.toUpperCase()}`);
    //             console.log("-".repeat(30));
    //           });

    //           const critical = hostAlerts.filter((a) => a.severity === "critical").length;
    //           const high = hostAlerts.filter((a) => a.severity === "high").length;
    //           const medium = hostAlerts.filter((a) => a.severity === "medium").length;

    //           console.log("📊 Root Cause Summary:");
    //           console.log(`  Total Root Cause Alerts: ${hostAlerts.length}`);
    //           console.log(`  Critical: ${critical}, High: ${high}, Medium: ${medium}`);
    //         } else {
    //           console.log(`✅ No root cause alerts found for Host: ${hostId}`);
    //         }
    //       }
    //     }
    //   });
    // });
  }, []);

  return <div ref={containerRef} id="viz" style={{ width: "100%", height: "100vh" }} />;
};

export default TopoView;
