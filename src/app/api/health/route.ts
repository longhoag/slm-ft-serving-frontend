// src/app/api/health/route.ts

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function GET() {
  // Validate environment variable
  if (!BACKEND_URL) {
    console.error('[Health Route] BACKEND_API_URL is not set!');
    return NextResponse.json(
      { status: 'unhealthy', vllm_available: false, error: 'Backend configuration error: BACKEND_API_URL not set' },
      { status: 500 }
    );
  }

  try {
    const fullUrl = `${BACKEND_URL}/health`;
    console.log('[Health Route] BACKEND_API_URL:', BACKEND_URL);
    console.log('[Health Route] Full URL:', fullUrl);
    
    const response = await fetch(fullUrl);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', vllm_available: false, error: 'Backend unreachable' },
      { status: 503 }
    );
  }
}
