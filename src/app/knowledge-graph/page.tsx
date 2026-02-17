'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Navigation from '@/components/Navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { nodes, edges, Domain, KGEdge, KGNode } from '@/lib/knowledge-graph'
import { motion } from 'framer-motion'
import { Filter, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react'

const domainColors: Record<string, string> = {
  CVD: '#EF4444',
  T2DM: '#3B82F6',
  CKD: '#22C55E',
  Shared: '#A855F7',
  Intervention: '#F59E0B',
}

const nodeTypeShapes: Record<string, string> = {
  disease: 'circle',
  biomarker: 'diamond',
  lifestyle: 'triangle',
  medication: 'square',
  demographic: 'hexagon',
}

// Simple force-directed layout computed on client
interface LayoutNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  node: KGNode
  highlighted: boolean
}

function useForceLayout(filteredNodes: KGNode[], filteredEdges: KGEdge[], width: number, height: number) {
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([])

  useEffect(() => {
    // Initialize positions
    const ln: LayoutNode[] = filteredNodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / filteredNodes.length
      const r = Math.min(width, height) * 0.35
      return {
        id: n.id,
        x: width / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 50,
        y: height / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 50,
        vx: 0,
        vy: 0,
        node: n,
        highlighted: false,
      }
    })

    // Run force simulation for N iterations
    const iterations = 150
    const nodeMap = new Map(ln.map(n => [n.id, n]))

    for (let iter = 0; iter < iterations; iter++) {
      const alpha = 1 - iter / iterations
      const k = 0.1 * alpha

      // Repulsion
      for (let i = 0; i < ln.length; i++) {
        for (let j = i + 1; j < ln.length; j++) {
          let dx = ln[j].x - ln[i].x
          let dy = ln[j].y - ln[i].y
          let dist = Math.sqrt(dx * dx + dy * dy) || 1
          const force = 800 / (dist * dist)
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          ln[i].vx -= fx * k
          ln[i].vy -= fy * k
          ln[j].vx += fx * k
          ln[j].vy += fy * k
        }
      }

      // Attraction (edges)
      for (const edge of filteredEdges) {
        const source = nodeMap.get(edge.source)
        const target = nodeMap.get(edge.target)
        if (!source || !target) continue
        let dx = target.x - source.x
        let dy = target.y - source.y
        let dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = (dist - 120) * 0.01
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        source.vx += fx * k
        source.vy += fy * k
        target.vx -= fx * k
        target.vy -= fy * k
      }

      // Center gravity
      for (const n of ln) {
        n.vx += (width / 2 - n.x) * 0.001 * alpha
        n.vy += (height / 2 - n.y) * 0.001 * alpha
      }

      // Apply velocity
      for (const n of ln) {
        n.vx *= 0.8
        n.vy *= 0.8
        n.x += n.vx
        n.y += n.vy
        // Keep in bounds
        n.x = Math.max(40, Math.min(width - 40, n.x))
        n.y = Math.max(40, Math.min(height - 40, n.y))
      }
    }

    setLayoutNodes([...ln])
  }, [filteredNodes, filteredEdges, width, height])

  return layoutNodes
}

export default function KnowledgeGraphPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedDomains, setSelectedDomains] = useState<Set<Domain>>(new Set<Domain>(['CVD', 'T2DM', 'CKD', 'Shared', 'Intervention']))
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<KGEdge | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => { setMounted(true) }, [])

  const filteredEdges = useMemo(() => {
    return edges.filter(e => selectedDomains.has(e.domain))
  }, [selectedDomains])

  const filteredNodeIds = useMemo(() => {
    const ids = new Set<string>()
    for (const e of filteredEdges) {
      ids.add(e.source)
      ids.add(e.target)
    }
    return ids
  }, [filteredEdges])

  const filteredNodes = useMemo(() => {
    return nodes.filter(n => filteredNodeIds.has(n.id))
  }, [filteredNodeIds])

  const layoutNodes = useForceLayout(filteredNodes, filteredEdges, 800, 600)
  const nodePositions = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>()
    for (const n of layoutNodes) map.set(n.id, { x: n.x, y: n.y })
    return map
  }, [layoutNodes])

  // Highlight connected paths when node is selected
  const highlightedEdges = useMemo(() => {
    if (!selectedNode) return new Set<string>()
    const set = new Set<string>()
    for (const e of filteredEdges) {
      if (e.source === selectedNode || e.target === selectedNode) set.add(e.id)
    }
    return set
  }, [selectedNode, filteredEdges])

  const toggleDomain = (d: Domain) => {
    const next = new Set(selectedDomains)
    if (next.has(d)) next.delete(d)
    else next.add(d)
    setSelectedDomains(next)
  }

  if (!mounted) return <div className="flex items-center justify-center min-h-screen"><div className="animate-pulse text-teal-500">Loading...</div></div>

  const selectedNodeData = selectedNode ? nodes.find(n => n.id === selectedNode) : null
  const selectedNodeEdges = selectedNode ? edges.filter(e => e.source === selectedNode || e.target === selectedNode) : []

  return (
    <>
      <Navigation />
      <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">Causal Knowledge Graph</h1>
          <p className="text-navy-500 dark:text-navy-300">Interactive visualization of 107 NCD-CIE causal edges</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-navy-500" />
          {(['CVD', 'T2DM', 'CKD', 'Shared', 'Intervention'] as Domain[]).map(d => (
            <Button
              key={d}
              variant={selectedDomains.has(d) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleDomain(d)}
              style={selectedDomains.has(d) ? { backgroundColor: domainColors[d] } : undefined}
            >
              {d}
            </Button>
          ))}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(z + 0.2, 2))}><ZoomIn className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}><ZoomOut className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon" onClick={() => { setZoom(1); setSelectedNode(null) }}><RotateCcw className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Graph */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative overflow-hidden" style={{ height: '600px' }}>
                  <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 800 600`}
                    className="bg-navy-50/30 dark:bg-navy-900/50"
                    style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                    onClick={() => setSelectedNode(null)}
                  >
                    {/* Edges */}
                    {filteredEdges.map(edge => {
                      const sourcePos = nodePositions.get(edge.source)
                      const targetPos = nodePositions.get(edge.target)
                      if (!sourcePos || !targetPos) return null

                      const isHighlighted = highlightedEdges.has(edge.id)
                      const opacity = selectedNode ? (isHighlighted ? 1 : 0.1) : 0.4
                      const strokeWidth = Math.abs(edge.weight) * 6 + 1

                      return (
                        <g key={edge.id}>
                          <line
                            x1={sourcePos.x}
                            y1={sourcePos.y}
                            x2={targetPos.x}
                            y2={targetPos.y}
                            stroke={edge.weight > 0 ? '#EF4444' : '#22C55E'}
                            strokeWidth={strokeWidth}
                            opacity={opacity}
                            strokeLinecap="round"
                            onMouseEnter={() => setHoveredEdge(edge)}
                            onMouseLeave={() => setHoveredEdge(null)}
                            className="cursor-pointer"
                          />
                          {/* Arrow */}
                          {isHighlighted && (
                            <polygon
                              points={(() => {
                                const dx = targetPos.x - sourcePos.x
                                const dy = targetPos.y - sourcePos.y
                                const len = Math.sqrt(dx * dx + dy * dy) || 1
                                const nx = dx / len
                                const ny = dy / len
                                const ax = targetPos.x - nx * 20
                                const ay = targetPos.y - ny * 20
                                const px = -ny * 5
                                const py = nx * 5
                                return `${targetPos.x - nx * 14},${targetPos.y - ny * 14} ${ax + px},${ay + py} ${ax - px},${ay - py}`
                              })()}
                              fill={edge.weight > 0 ? '#EF4444' : '#22C55E'}
                              opacity={0.8}
                            />
                          )}
                        </g>
                      )
                    })}

                    {/* Nodes */}
                    {layoutNodes.map(ln => {
                      const pos = nodePositions.get(ln.id)
                      if (!pos) return null

                      const isSelected = selectedNode === ln.id
                      const isConnected = selectedNode ? highlightedEdges.size > 0 && edges.some(e => (e.source === selectedNode && e.target === ln.id) || (e.target === selectedNode && e.source === ln.id)) : true
                      const opacity = selectedNode ? (isSelected || isConnected ? 1 : 0.2) : 1
                      const r = ln.node.type === 'disease' ? 18 : 12
                      const color = domainColors[ln.node.domain] || '#6B7280'

                      return (
                        <g
                          key={ln.id}
                          onClick={(e) => { e.stopPropagation(); setSelectedNode(isSelected ? null : ln.id) }}
                          className="cursor-pointer"
                          opacity={opacity}
                        >
                          <circle
                            cx={pos.x}
                            cy={pos.y}
                            r={r}
                            fill={color}
                            stroke={isSelected ? '#0EA5E9' : 'white'}
                            strokeWidth={isSelected ? 3 : 2}
                          />
                          <text
                            x={pos.x}
                            y={pos.y + r + 14}
                            textAnchor="middle"
                            fontSize={10}
                            fill="#374151"
                            className="dark:fill-navy-200 pointer-events-none select-none"
                            fontWeight={isSelected ? 700 : 500}
                          >
                            {ln.node.label}
                          </text>
                        </g>
                      )
                    })}
                  </svg>

                  {/* Edge tooltip */}
                  {hoveredEdge && (
                    <div className="absolute top-4 left-4 bg-navy-800 text-white p-3 rounded-lg shadow-xl text-xs max-w-xs z-10">
                      <div className="font-semibold">{hoveredEdge.source} → {hoveredEdge.target}</div>
                      <div>Weight: <span className={hoveredEdge.weight > 0 ? 'text-red-400' : 'text-green-400'}>{hoveredEdge.weight.toFixed(2)}</span></div>
                      <div>95% CI: [{hoveredEdge.ci[0].toFixed(2)}, {hoveredEdge.ci[1].toFixed(2)}]</div>
                      <div>Evidence: Grade {hoveredEdge.evidenceGrade}</div>
                      <div className="mt-1 text-navy-300">{hoveredEdge.description}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Legend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <div className="font-medium mb-1">Domains</div>
                  {Object.entries(domainColors).map(([d, c]) => (
                    <div key={d} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-medium mb-1">Edge Colors</div>
                  <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-red-500" /><span>Risk (+)</span></div>
                  <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-green-500" /><span>Protective (−)</span></div>
                </div>
                <div className="text-navy-400">
                  Edge thickness = weight strength<br />
                  Node size: large = disease endpoint
                </div>
              </CardContent>
            </Card>

            {/* Selected Node Detail */}
            {selectedNodeData && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" /> {selectedNodeData.label}
                  </CardTitle>
                  <CardDescription className="text-xs">{selectedNodeData.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div><span className="font-medium">Type:</span> {selectedNodeData.type}</div>
                  <div><span className="font-medium">Domain:</span> {selectedNodeData.domain}</div>
                  {selectedNodeData.unit && <div><span className="font-medium">Unit:</span> {selectedNodeData.unit}</div>}
                  <div className="font-medium mt-2">Connected Edges ({selectedNodeEdges.length}):</div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {selectedNodeEdges.map(e => (
                      <div key={e.id} className="p-2 rounded bg-navy-50 dark:bg-navy-700/50">
                        <div className="flex items-center gap-1">
                          <span>{e.source === selectedNode ? '→' : '←'}</span>
                          <span className="font-medium">{e.source === selectedNode ? e.target : e.source}</span>
                          <span className={`ml-auto font-mono ${e.weight > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {e.weight > 0 ? '+' : ''}{e.weight.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-navy-400 mt-0.5">Grade {e.evidenceGrade} · CI [{e.ci[0].toFixed(2)}, {e.ci[1].toFixed(2)}]</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardContent className="pt-6 text-xs space-y-1">
                <div className="flex justify-between"><span className="text-navy-500">Total Nodes</span><span className="font-medium">{nodes.length}</span></div>
                <div className="flex justify-between"><span className="text-navy-500">Total Edges</span><span className="font-medium">{edges.length}</span></div>
                <div className="flex justify-between"><span className="text-navy-500">Visible Nodes</span><span className="font-medium">{filteredNodes.length}</span></div>
                <div className="flex justify-between"><span className="text-navy-500">Visible Edges</span><span className="font-medium">{filteredEdges.length}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
}
