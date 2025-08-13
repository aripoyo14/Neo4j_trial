import { NextRequest, NextResponse } from 'next/server'

// ハードコーディングしたサンプルデータ（DB不要）
// 日本語名＋座標を付与して見た目を整える
const hardcodedNodes = [
  { id: 'takahashi', label: '高橋 美咲', type: 'person', x: -420, y: -110, size: 22 },
  { id: 'sato',      label: '佐藤 花子', type: 'person', x: -260, y:  -40, size: 30 },
  { id: 'nakamura',  label: '中村 雅子', type: 'person', x: -300, y:  110, size: 18 },
  { id: 'tanaka',    label: '田中 太郎', type: 'person', x:    0, y:    0, size: 28 },
  { id: 'yamada',    label: '山田 健一', type: 'person', x:  -60, y:  160, size: 20 },
  { id: 'suzuki',    label: '鈴木 次郎', type: 'person', x:  260, y:  -40, size: 26 },
  { id: 'morita',    label: '森田 恵子', type: 'person', x:  360, y:  110, size: 20 },
  { id: 'kobayashi', label: '小林 達也', type: 'person', x:  460, y: -110, size: 20 },
]

const hardcodedLinks = [
  { source: 'takahashi', target: 'sato',      score: 0.8 },
  { source: 'sato',      target: 'tanaka',    score: 0.9 },
  { source: 'sato',      target: 'nakamura',  score: 0.6 },
  { source: 'tanaka',    target: 'yamada',    score: 0.7 },
  { source: 'tanaka',    target: 'suzuki',    score: 0.85 },
  { source: 'suzuki',    target: 'morita',    score: 0.75 },
  { source: 'suzuki',    target: 'kobayashi', score: 0.65 },
]

export async function GET(request: NextRequest) {
  return NextResponse.json({ nodes: hardcodedNodes, links: hardcodedLinks })
}
