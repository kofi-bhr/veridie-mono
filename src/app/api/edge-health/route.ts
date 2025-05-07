import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
}

// Export config to enable edge runtime
export const config = {
  runtime: 'edge'
};
