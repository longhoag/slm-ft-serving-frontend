// src/lib/api.ts

import type { ExtractionRequest, ExtractionResponse, HealthResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function extractMedicalInfo(request: ExtractionRequest): Promise<ExtractionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Extraction failed');
  }

  return response.json();
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error('Backend health check failed');
  }

  return response.json();
}
