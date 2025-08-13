'use client'
import { useState, useEffect, useRef } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'

interface GraphNode {
  id: string | number
  label: string
  type: string
  x?: number
  y?: number
  size?: number
}

interface GraphLink {
  source: string | number
  target: string | number
  score: number
}

export default function ClientGraph() {
  const [data, setData] = useState<{ nodes: GraphNode[]; links: GraphLink[] }>({ nodes: [], links: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const networkRef = useRef<HTMLDivElement>(null)
  const networkInstance = useRef<Network | null>(null)
  const nodesDataRef = useRef<DataSet<any> | null>(null)
  const draggingNodeIdRef = useRef<string | number | null>(null)
  const previousDragPosRef = useRef<{ x: number; y: number } | null>(null)
  // 近接反応の設定
  const influenceRadius = useRef<number>(180)
  const repelStrength = useRef<number>(0.6) // 0〜1程度で調整

  useEffect(() => {
    fetch('/api/graph')
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP error! status: ${r.status}`)
        }
        return r.json()
      })
      .then(setData)
      .catch(err => {
        console.error('Error fetching graph data:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!networkRef.current || !data.nodes.length) return

    console.log('Raw data:', data) // デバッグ用

    // 重複を除去してユニークなノードを作成
    const uniqueNodes = new Map<string, GraphNode>()
    data.nodes.forEach(node => {
      const nodeId = String(node.id)
      if (!uniqueNodes.has(nodeId)) {
        uniqueNodes.set(nodeId, {
          id: nodeId,
          label: node.label || nodeId,
          type: node.type || 'default'
        })
      }
    })

    // 重複を除去してユニークなリンクを作成
    const uniqueLinks = new Map<string, GraphLink>()
    data.links.forEach(link => {
      const sourceId = String(link.source)
      const targetId = String(link.target)
      const linkKey = `${sourceId}-${targetId}`
      
      if (!uniqueLinks.has(linkKey)) {
        uniqueLinks.set(linkKey, {
          source: sourceId,
          target: targetId,
          score: link.score || 0
        })
      }
    })

    const validNodes = Array.from(uniqueNodes.values())
    const validLinks = Array.from(uniqueLinks.values())

    console.log('Valid nodes:', validNodes) // デバッグ用
    console.log('Valid links:', validLinks) // デバッグ用

    if (validNodes.length === 0) {
      console.error('No valid nodes found')
      return
    }

    // ノード用の（中央からではない）斜めグラデーション画像を生成
    const createLinearGradientCircle = (
      start: string,
      end: string,
      ringColor: string = '#ffffff',
      ringWidth: number = 6
    ) => {
      const size = 96
      const radius = size * 0.5 - ringWidth * 0.6
      const cx = size / 2
      const cy = size / 2

      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')!

      // 本体の円を線形グラデーションで塗る（左上→右下）
      const lg = ctx.createLinearGradient(0, 0, size, size)
      lg.addColorStop(0, start)
      lg.addColorStop(1, end)
      ctx.fillStyle = lg
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()

      // 白いリング（外周）
      ctx.lineWidth = ringWidth
      ctx.strokeStyle = ringColor
      ctx.stroke()

      return canvas.toDataURL('image/png')
    }

    const personImg = createLinearGradientCircle('#b8dbe4', '#66aedd')
    const tagImg = createLinearGradientCircle('#d9ecfb', '#8ec7ff')

    // vis-network用のデータ形式に変換（グラデーション画像を使用）
    const nodes = new DataSet(validNodes.map(node => ({
      id: node.id,
      label: node.label || String(node.id),
      group: node.type || 'default',
      size: node.size ?? 22,
      x: node.x,
      y: node.y,
      // 固定はしない（ドラッグ可能にする）
      fixed: undefined,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 15, x: 0, y: 3 },
      font: { size: 18, color: '#2f3a46' },
      shape: 'circularImage',
      image: node.type === 'person' ? personImg : tagImg,
      brokenImage: undefined,
    })))
    nodesDataRef.current = nodes

    const edges = new DataSet(validLinks.map(link => ({
      id: `${link.source}-${link.target}`,
      from: link.source,
      to: link.target,
      width: 2 + link.score * 2.5,
      color: { color: '#8bbfdc', highlight: '#6ba8d6', opacity: 0.9 },
      smooth: { enabled: true, type: 'continuous', roundness: 0.5 }
    })))

    // ネットワークオプション
    const options = {
      nodes: {
        shape: 'circularImage',
        borderWidth: 0,
      },
      edges: {
        arrows: {
          to: { enabled: false },
        },
      },
      physics: {
        enabled: false,
      },
      interaction: {
        hover: true,
        tooltipDelay: 150,
        zoomView: true,
        dragView: true,
      },
    }

    // ネットワークを作成
    networkInstance.current = new Network(networkRef.current, { nodes, edges }, options)

    // ドラッグに応じて隣接ノードを連動移動
    const net = networkInstance.current
    net.on('dragStart', params => {
      if (!params.nodes?.length) return
      const id = params.nodes[0]
      draggingNodeIdRef.current = id
      const pos = net.getPositions([id])[id]
      previousDragPosRef.current = { x: pos.x, y: pos.y }
    })

    net.on('dragging', () => {
      const id = draggingNodeIdRef.current
      if (id == null || !nodesDataRef.current) return
      const current = net.getPositions([id])[id]
      const allIds = nodesDataRef.current.getIds() as (string | number)[]
      const positions = net.getPositions(allIds as any)
      const updates: any[] = []
      const R = influenceRadius.current
      const strength = repelStrength.current
      for (const nid of allIds) {
        if (nid === id) continue
        const p = positions[nid as any]
        if (!p) continue
        const dx = p.x - current.x
        const dy = p.y - current.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist >= R) continue
        const factor = (R - dist) / R
        const unitX = dx / (dist || 1)
        const unitY = dy / (dist || 1)
        const move = 8 * strength * factor // 1イベントあたりの移動量
        updates.push({ id: nid, x: p.x + unitX * move, y: p.y + unitY * move })
      }
      if (updates.length) nodesDataRef.current.update(updates)
      previousDragPosRef.current = { x: current.x, y: current.y }
    })

    net.on('dragEnd', () => {
      draggingNodeIdRef.current = null
      previousDragPosRef.current = null
    })

    return () => {
      if (networkInstance.current) {
        networkInstance.current.destroy()
      }
    }
  }, [data])

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Loading graph data...
    </div>
  }

  if (error) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
      Error: {error}
    </div>
  }

  return (
    <div style={{ height: '100vh' }}>
      <div ref={networkRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
} 