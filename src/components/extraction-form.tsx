// src/components/extraction-form.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface ExtractionFormProps {
  onSubmit: (text: string) => void;
  isLoading: boolean;
}

export function ExtractionForm({ onSubmit, isLoading }: ExtractionFormProps) {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="clinical-text">Clinical Text</Label>
        <Textarea
          id="clinical-text"
          placeholder="Enter clinical text for medical entity extraction..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          disabled={isLoading}
        />
      </div>
      <Button type="submit" disabled={isLoading || !text.trim()}>
        {isLoading ? 'Extracting...' : 'Extract Medical Entities'}
      </Button>
    </form>
  );
}
