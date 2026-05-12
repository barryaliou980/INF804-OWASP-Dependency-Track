'use client';

import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { ScanResult, GraphNode, GraphEdge } from '@/lib/types';
import { CveTooltip } from './cve-tooltip';
import { Maximize, Minimize } from 'lucide-react';

interface DepGraphProps {
  data: ScanResult;
}

export function DepGraph({ data }: DepGraphProps) {
  const fgRef = useRef<any>();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL_ONLY'>('ALL');
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Recentrer automatiquement quand on change de mode
  useEffect(() => {
    if (fgRef.current) {
      // Attendre que la transition CSS et le redimensionnement soient terminés
      setTimeout(() => {
        fgRef.current.zoomToFit(400, 50);
        fgRef.current.centerAt(0, 0, 400);
      }, 350); // Le CSS transition est de 300ms
    }
  }, [isFullscreen]);

  return (
    <div className={`relative overflow-hidden transition-all duration-300 ${
      isFullscreen 
        ? 'fixed inset-0 z-[100] w-full h-full max-w-[100vw] max-h-[100vh] m-0 rounded-none border-0 bg-slate-900 flex flex-col' 
        : 'w-full h-[600px] border border-gray-700 rounded-xl bg-slate-900 flex flex-col'
    }`}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm border transition-colors ${
            filter === 'ALL' 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Tout afficher
        </button>
        <button
          onClick={() => setFilter('CRITICAL_ONLY')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm border transition-colors ${
            filter === 'CRITICAL_ONLY' 
              ? 'bg-red-600 border-red-500 text-white' 
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Critical / High seulement
        </button>
        <button
          onClick={() => fgRef.current?.zoomToFit(400)}
          className="px-3 py-1.5 text-xs font-medium rounded-md shadow-sm border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          Réinitialiser vue
        </button>
      </div>

      {/* Bouton Plein Écran */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleFullscreen}
          className="p-2 border rounded-md shadow-sm bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 transition-colors"
          title={isFullscreen ? "Quitter le plein écran" : "Passer en plein écran"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-800/80 p-3 rounded-lg border border-slate-700 shadow-sm text-xs backdrop-blur-md text-slate-300">
        <h4 className="font-semibold text-slate-200 mb-2">Légende</h4>
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
