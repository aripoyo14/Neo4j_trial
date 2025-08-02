'use client'
import { useState, useEffect, useRef } from 'react'
import { Network } from 'vis-network'
import { DataSet } from 'vis-data'

interface GraphNode {
  id: string | number
  label: string
  type: string
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

    // vis-network用のデータ形式に変換
    const nodes = new DataSet(validNodes.map(node => ({
      id: node.id,
      label: node.label || String(node.id),
      group: node.type || 'default',
      color: node.type === 'person' ? '#4CAF50' : '#2196F3'
    })))

    const edges = new DataSet(validLinks.map(link => ({
      id: `${link.source}-${link.target}`,
      from: link.source,
      to: link.target,
      label: `score: ${link.score}`,
      width: link.score * 3
    })))

    // ネットワークオプション
    const options = {
      nodes: {
        shape: 'circle',
        size: 20,
        font: {
          size: 12
        }
      },
      edges: {
        smooth: {
          enabled: true,
          type: 'continuous',
          roundness: 0.5
        }
      },
      physics: {
        stabilization: true,
        barnesHut: {
          gravitationalConstant: -80000,
          springConstant: 0.001,
          springLength: 200
        }
      }
    }

    // ネットワークを作成
    networkInstance.current = new Network(networkRef.current, { nodes, edges }, options)

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