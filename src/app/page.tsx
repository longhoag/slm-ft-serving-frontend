// src/app/page.tsx
'use client';

import { useState } from 'react';
import { ExtractionForm } from '@/components/extraction-form';
import { ExtractionResults } from '@/components/extraction-results';
import type { ExtractionResponse } from '@/types';

export default function Home() {
  const [results, setResults] = useState<ExtractionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async (text: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Extraction failed');
      }
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Medical Information Extraction</h1>
      
      <ExtractionForm onSubmit={handleExtract} isLoading={isLoading} />
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-800">
          {error}
        </div>
      )}
      
      <div className="mt-8">
        <ExtractionResults results={results} />
      </div>
    </main>
  );
}
