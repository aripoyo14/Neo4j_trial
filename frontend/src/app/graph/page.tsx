'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// クライアントサイドのみでレンダリングされるコンポーネント
const ClientOnlyGraph = dynamic(
  () => import('./ClientGraph'),
  { 
    ssr: false,
    loading: () => <div>Loading graph...</div>
  }
)

export default function GraphPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Initializing...
    </div>
  }

  return <ClientOnlyGraph />
}
