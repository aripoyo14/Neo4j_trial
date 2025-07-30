import { NextRequest, NextResponse } from 'next/server'
import neo4j, { Record } from 'neo4j-driver'

const driver = neo4j.driver(
  process.env.NEO4J_URI!,
  neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!)
)

export async function GET(request: NextRequest) {
  const session = driver.session()
  try {
    const result = await session.run(`
      // 1) 生の重み定義＋正規化
      WITH [ {id:101, raw:6}, {id:102, raw:2}, {id:103, raw:2} ] AS rawWeights
      WITH rawWeights,
           reduce(sum=0, x IN rawWeights | sum + x.raw) AS totalRaw
      WITH [ x IN rawWeights | { id: x.id, weight: x.raw / totalRaw } ] AS tagWeights

      // 2) 各タグ × TAG_SIM 経路をたどり {weight,score} を集計
      UNWIND tagWeights AS tw
      MATCH (p:Person)-[r:TAG_SIM]->(t:Tag {id: tw.id})
      WITH p, collect({ w: tw.weight, s: r.score }) AS wsList

      // 3) weightedScore を計算
      WITH p,
           reduce(acc=0.0, x IN wsList | acc + x.w * x.s) AS weightedScore

      // 4) スコア降順で上位5名を抽出
      WITH p, weightedScore
      ORDER BY weightedScore DESC
      LIMIT 5

      // 5) 上位人物と選択タグのリレーションだけを返す
      MATCH (p)-[r:TAG_SIM]->(t:Tag)
      WHERE t.id IN [101,102,103]
      RETURN p, r, t
    `)
    
    // レコードを nodes/links に整形（重複除去）
    const nodesMap = new Map<string, any>()
    const links: any[] = []
    
    result.records.forEach((r: Record) => {
      const p = r.get('p').properties
      const t = r.get('t').properties
      const rel = r.get('r').properties
      
      // ノードのIDを文字列に変換
      const personId = String(p.id || p.name)
      const tagId = String(t.id || t.name)
      
      // 重複を避けてノードを追加
      nodesMap.set(personId, { 
        id: personId, 
        label: p.name || personId, 
        type: 'person' 
      })
      nodesMap.set(tagId, { 
        id: tagId, 
        label: t.name || tagId, 
        type: 'tag' 
      })
      
      // リンクを追加
      links.push({ 
        source: personId, 
        target: tagId, 
        score: rel.score || 0 
      })
    })
    
    const nodes = Array.from(nodesMap.values())
    console.log('API Response:', { nodes, links }) // デバッグ用
    
    return NextResponse.json({ nodes, links })
  } catch (e) {
    console.error('API Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  } finally {
    await session.close()
  }
}
