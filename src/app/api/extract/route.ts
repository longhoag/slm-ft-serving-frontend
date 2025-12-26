// src/app/api/extract/route.ts

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(request: NextRequest) {
  // Validate environment variable
  if (!BACKEND_URL) {
    console.error('[API Route] BACKEND_API_URL is not set!');
    return NextResponse.json(
      { detail: 'Backend configuration error: BACKEND_API_URL not set' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    
    // Debug logging
    const fullUrl = `${BACKEND_URL}/api/v1/extract`;
    console.log('[API Route] BACKEND_API_URL:', BACKEND_URL);
    console.log('[API Route] Full URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error:', error);
    console.error('[API Route] BACKEND_URL was:', BACKEND_URL);
    return NextResponse.json(
      { detail: 'Failed to connect to backend' },
      { status: 503 }
    );
  }
}
