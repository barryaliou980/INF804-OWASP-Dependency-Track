'use client';

import React, { useRef, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ScanResult, GraphNode, GraphEdge } from '@/lib/types';
import { CveTooltip } from './cve-tooltip';

interface DepGraphProps {
  data: ScanResult;
}

export function DepGraph({ data }: DepGraphProps) {
  const fgRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL_ONLY'>('ALL');

  // Préparation des données pour le graphe
  const graphData = useMemo(() => {
    const nodes: GraphNode[] = [
      {
        id: 'root',
        name: data.filename || 'Mon Projet',
        version: '',
        severity: 'ROOT',
        cveIds: []
      }
    ];
    
    const links: GraphEdge[] = [];

    data.dependencies.forEach(item => {
      // Identifier la sévérité max
      let maxSeverity: any = 'SAFE';
      let maxScore = 0;
      
      item.vulnerabilities.forEach(v => {
        if (v.cvssScore > maxScore) {
          maxScore = v.cvssScore;
          maxSeverity = v.severity;
        }
      });

      // Si filter === 'CRITICAL_ONLY', on ignore les noeuds non critiques
      if (filter === 'CRITICAL_ONLY' && maxSeverity !== 'CRITICAL' && maxSeverity !== 'HIGH') {
        return;
      }

      const nodeId = item.dependency.name;
      
      nodes.push({
        id: nodeId,
        name: item.dependency.name,
        version: item.dependency.version,
        severity: maxSeverity,
        cvssScore: maxScore > 0 ? maxScore : undefined,
        cveIds: item.vulnerabilities.map(v => v.id)
      });

      links.push({
        source: 'root',
        target: nodeId
      });
    });

    return { nodes, links };
  }, [data, filter]);

  const getNodeColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#E24B4A';
      case 'HIGH': return '#EF9F27';
      case 'MEDIUM': return '#FAC775';
      case 'ROOT': return '#9CA3AF'; // Gris
      default: return '#639922'; // Vert (Safe)
    }
  };

  const getNodeSize = (severity: string) => {
    switch (severity) {
      case 'ROOT': return 10;
      case 'CRITICAL': return 8;
      case 'HIGH': return 6;
      case 'MEDIUM': return 5;
      default: return 4;
    }
  };

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
  }, []);

  const handleNodeDoubleClick = useCallback((node: any) => {
    if (fgRef.current) {
      // Zoom centré sur le nœud
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(8, 2000);
    }
  }, []);

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button 
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm border ${filter === 'ALL' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          Tout afficher
        </button>
        <button 
          onClick={() => setFilter('CRITICAL_ONLY')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm border ${filter === 'CRITICAL_ONLY' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
        >
          Critical / High seulement
        </button>
        <button 
          onClick={() => fgRef.current?.zoomToFit(400)}
          className="px-3 py-1.5 text-xs font-medium rounded-md shadow-sm border bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        >
          Réinitialiser vue
        </button>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/90 p-3 rounded-lg border border-gray-200 shadow-sm text-xs backdrop-blur-sm">
        <h4 className="font-semibold text-gray-700 mb-2">Légende</h4>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#E24B4A] shadow-[0_0_8px_rgba(226,75,74,0.6)]"></span> Critical</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#EF9F27]"></span> High</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#FAC775]"></span> Medium</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#639922]"></span> Safe</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-400"></span> Votre projet</div>
        </div>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.name}${node.version ? ` v${node.version}` : ''}`}
        nodeColor={(node: any) => getNodeColor(node.severity)}
        nodeRelSize={1}
        nodeVal={(node: any) => getNodeSize(node.severity)}
        linkColor={(link: any) => {
          // Couleur héritée de la cible
          const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target);
          return targetNode ? getNodeColor(targetNode.severity) : '#E5E7EB';
        }}
        linkWidth={(link: any) => {
          const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target);
          if (!targetNode) return 1;
          switch (targetNode.severity) {
            case 'CRITICAL': return 2;
            case 'HIGH': return 1.5;
            default: return 0.5;
          }
        }}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          // Animation de pulsation pour les noeuds critiques
          if (node.severity === 'CRITICAL') {
            const time = Date.now() / 300;
            const radius = getNodeSize('CRITICAL') + Math.sin(time) * 1.5;
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(226, 75, 74, 0.2)';
            ctx.fill();
          }
        }}
      />

      {selectedNode && (
        <CveTooltip node={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
}
