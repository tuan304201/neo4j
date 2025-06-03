import React, { useEffect, useRef, useState } from "react";
import { ForceGraph2D } from "react-force-graph";
import { GraphData, GraphLayoutOptions } from "../../types/topology.types";
import { NODE_TYPE_COLORS, EDGE_TYPE_COLORS } from "../../utils/constants";

interface TopologyGraphProps {
  data: GraphData;
  layoutOptions: GraphLayoutOptions;
  onNodeClick: (nodeId: string) => void;
  height?: number;
}

const TopologyGraph: React.FC<TopologyGraphProps> = ({ data, layoutOptions, onNodeClick, height = 600 }) => {
  const graphRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 0, height });

  useEffect(() => {
    const handleResize = () => {
      if (graphRef.current?.containerRef?.current) {
        const container = graphRef.current.containerRef.current;
        setDimensions({
          width: container.clientWidth,
          height: height || container.clientHeight,
        });
      }
    };

    // Initial resize
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [height]);

  const graphData = {
    nodes: data.nodes.map((node) => ({
      ...node,
      id: node.id,
      val: 1,
      color: NODE_TYPE_COLORS[node.type] || "#999",
      __status: node.status,
    })),
    links: data.edges.map((edge) => ({
      ...edge,
      source: edge.source,
      target: edge.target,
      color: EDGE_TYPE_COLORS[edge.type] || "#999",
      __type: edge.type,
    })),
  };

  const handleNodeClick = (node: any) => {
    onNodeClick(node.id);
  };

  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
      style={{ height }}
    >
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.label} (${node.type}) - ${node.__status}`}
        linkLabel={(link: any) => `${link.__type}`}
        nodeColor={(node: any) => {
          if (node.__status === "Critical") return "#EF4444";
          if (node.__status === "Warning") return "#F59E0B";
          if (node.__status === "Healthy") return "#10B981";
          return NODE_TYPE_COLORS[node.type] || "#999";
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2);

          // Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();

          // Status ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, 7, 0, 2 * Math.PI, false);
          ctx.strokeStyle =
            node.__status === "Critical"
              ? "#EF4444"
              : node.__status === "Warning"
              ? "#F59E0B"
              : node.__status === "Healthy"
              ? "#10B981"
              : "#6B7280";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Only render labels if zoomed in enough
          if (globalScale >= 0.7) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + 8, bckgDimensions[0], bckgDimensions[1]);

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#333333";
            ctx.fillText(label, node.x, node.y + 8 + fontSize / 2);
          }
        }}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        linkWidth={1}
        onNodeClick={handleNodeClick}
        cooldownTicks={layoutOptions.animate ? 100 : 0}
        d3AlphaDecay={layoutOptions.animate ? 0.02 : 0.1}
        d3VelocityDecay={layoutOptions.animate ? 0.1 : 0.5}
        d3AlphaMin={0.001}
        nodeRelSize={6}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.5}
        linkDirectionalParticleSpeed={0.01}
        width={dimensions.width}
        height={dimensions.height}
      />
    </div>
  );
};

export default TopologyGraph;
