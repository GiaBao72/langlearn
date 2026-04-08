import { NextResponse } from 'next/server'

// Deprecated — use /api/exercises/[id]/submit for submitting answers
// and /api/dashboard for progress data
export async function POST() {
  return NextResponse.json({ error: 'Deprecated. Use /api/exercises/[id]/submit' }, { status: 410 })
}

export async function GET() {
  return NextResponse.json({ error: 'Deprecated. Use /api/dashboard' }, { status: 410 })
}
