'use client';
import { useState } from 'react';
type Person = { id: number; name: string; score: number };
type TagWeight = { id: number; weight: number };

export default function Home() {
  const [results, setResults] = useState<Person[]>([]);
  const sampleWeights: TagWeight[] = [
    { id: 3, weight: 0.5 },
    { id: 7, weight: 0.3 },
    { id: 11, weight: 0.2 },
  ];

  const handleClick = async () => {
    const res = await fetch('/api/top-people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tagWeights: sampleWeights }),
    });
    const json = await res.json();
    setResults(json.results);
  };

  return (
    <main className="p-8">
      <button
        onClick={handleClick}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        上位20名取得
      </button>
      <ul className="mt-6 space-y-2">
        {results.map((p) => (
          <li key={p.id} className="border p-4 rounded shadow">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">
              Score: {p.score.toFixed(3)}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
