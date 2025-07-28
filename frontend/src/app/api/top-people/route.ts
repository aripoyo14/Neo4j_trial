import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const payload = await request.json();
  const res = await fetch('http://backend:8000/api/top-people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Backend error');
  const data = await res.json();
  return NextResponse.json(data);
}
