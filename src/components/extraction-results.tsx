// src/components/extraction-results.tsx

import { Card } from '@/components/ui/card';
import type { ExtractionResponse } from '@/types';

interface ExtractionResultsProps {
  results: ExtractionResponse | null;
}

const FIELD_LABELS: Record<string, string> = {
  cancer_type: 'Cancer Type',
  stage: 'Stage',
  gene_mutation: 'Gene Mutation',
  biomarker: 'Biomarker',
  treatment: 'Treatment',
  response: 'Response',
  metastasis_site: 'Metastasis Site',
};

export function ExtractionResults({ results }: ExtractionResultsProps) {
  if (!results) return null;

  const fields = Object.entries(FIELD_LABELS);
  const hasAnyValue = fields.some(([key]) => results[key as keyof ExtractionResponse] !== null);

  if (!hasAnyValue) {
    return (
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-yellow-800">No medical entities found in the provided text.</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Extraction Results</h3>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(([key, label]) => {
          const value = results[key as keyof ExtractionResponse];
          return (
            <div key={key} className="space-y-1">
              <dt className="text-sm text-gray-500">{label}</dt>
              <dd className="font-medium">
                {value ?? <span className="text-gray-400 italic">Not found</span>}
              </dd>
            </div>
          );
        })}
      </dl>
      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
        Tokens used: {results.tokens_used}
      </div>
    </Card>
  );
}
