# Project Setup Guide

This guide covers the complete setup for the slm-ft-serving-frontend project. Follow each step in order.

---

## Prerequisites

Before starting, ensure you have:
- **Node.js**: v18.17.0 or later (`node -v`)
- **npm**: v9.0.0 or later (`npm -v`)
- **Git**: Repository already cloned
- **Backend Running**: EC2 instance with FastAPI gateway accessible (for testing)

---

## Step 1: Initialize Next.js Project

Since we have an existing repo with structure, initialize Next.js in the current directory.

```bash
cd /Volumes/deuxSSD/Developer/slm-ft-serving-frontend
```

Run the Next.js initialization (this will detect existing files):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**When prompted, select:**
| Prompt | Selection |
|--------|-----------|
| Would you like to use TypeScript? | Yes |
| Would you like to use ESLint? | Yes |
| Would you like to use Tailwind CSS? | Yes |
| Would you like your code inside a `src/` directory? | Yes |
| Would you like to use App Router? | Yes |
| Would you like to use Turbopack for `next dev`? | Yes (recommended) |
| Would you like to customize the import alias? | Yes → `@/*` |

> **Note**: If prompted about existing files, allow overwriting for config files but preserve `.github/` and `docs/`.

---

## Step 2: Install ShadcnUI

Initialize ShadcnUI in the project:

```bash
npx shadcn@latest init
```

**When prompted, select:**
| Prompt | Selection |
|--------|-----------|
| Which style would you like to use? | Default |
| Which color would you like to use as base color? | Slate (or preference) |
| Would you like to use CSS variables for colors? | Yes |

This creates:
- `components.json` - ShadcnUI configuration
- `src/lib/utils.ts` - Utility functions (cn helper)
- Updates `tailwind.config.ts` with ShadcnUI theme

**Install commonly needed components:**

```bash
npx shadcn@latest add button card input textarea label
```

Components will be added to `src/components/ui/`.

---

## Step 3: Create Environment Configuration

Create `.env.local` for local development (this file is git-ignored):

```bash
touch .env.local
```

Add the following content:

```env
# Backend API URL (FastAPI gateway on EC2)
# Server-only variable - used by API routes, never exposed to browser
BACKEND_API_URL=http://<ec2-public-ip>:8080

# Optional: Only needed if calling backend directly from client (lib/api.ts)
# NEXT_PUBLIC_API_BASE_URL=http://<ec2-public-ip>:8080
```

Replace `<ec2-public-ip>` with your actual EC2 instance public IP.

> **Why two variables?**
> - `BACKEND_API_URL` (server-only): Used by API routes (`route.ts`), completely hidden from browser, no redeploy needed when changed
> - `NEXT_PUBLIC_API_BASE_URL` (public): Only needed if using `lib/api.ts` to call backend directly from browser

Create `.env.example` as a template for other developers:

```bash
touch .env.example
```

```env
# Backend API URL (FastAPI gateway on EC2)
# Copy this file to .env.local and fill in values

# Server-only variable (used by API routes, never exposed to browser)
BACKEND_API_URL=http://your-ec2-ip:8080

# Public variable (optional - only needed if calling backend directly from client)
# NEXT_PUBLIC_API_BASE_URL=http://your-ec2-ip:8080
```

---

## Step 4: Create TypeScript Interfaces

Create the API types file at `src/types/api.ts`:

```typescript
// src/types/api.ts

export interface ExtractionRequest {
  text: string;
  temperature?: number;  // 0.0-2.0, default 0.3
  max_tokens?: number;   // 1-8192, default 512
}

export interface ExtractionResponse {
  cancer_type: string | null;
  stage: string | null;
  gene_mutation: string | null;
  biomarker: string | null;
  treatment: string | null;
  response: string | null;
  metastasis_site: string | null;
  raw_output: string;
  tokens_used: number;
}

export interface HealthResponse {
  status: string;
  vllm_available: boolean;
  version: string;
}

export interface ApiError {
  detail: string | Array<{
    type: string;
    loc: string[];
    msg: string;
    input: unknown;
  }>;
}
```

Create barrel export at `src/types/index.ts`:

```typescript
// src/types/index.ts
export * from './api';
```

---

## Step 5: Create API Client

Create the API client at `src/lib/api.ts`:

```typescript
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
```

---

## Step 6: Create API Route Proxy (Optional but Recommended)

To hide the EC2 IP from client-side code, create a server-side API route.

Create `src/app/api/extract/route.ts`:

```typescript
// src/app/api/extract/route.ts

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/v1/extract`, {
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
    return NextResponse.json(
      { detail: 'Failed to connect to backend' },
      { status: 503 }
    );
  }
}
```

Create `src/app/api/health/route.ts`:

```typescript
// src/app/api/health/route.ts

import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', vllm_available: false, error: 'Backend unreachable' },
      { status: 503 }
    );
  }
}
```

---

## Step 7: Build UI Components

### 7.1 Create Extraction Form Component

Create `src/components/extraction-form.tsx`:

```typescript
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
```

### 7.2 Create Results Display Component

Create `src/components/extraction-results.tsx`:

```typescript
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
```

### 7.3 Update Main Page

Update `src/app/page.tsx`:

```typescript
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
```

---

## Step 8: Run Development Server

Start the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

**Test the application:**
1. Ensure EC2 backend is running
2. Enter sample clinical text
3. Click "Extract Medical Entities"
4. Verify results display correctly

---

## Step 9: Deploy to Vercel

### 9.1 Create Vercel Account (if needed)

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended for auto-deploy)

### 9.2 Import Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Under "Import Git Repository", find `slm-ft-serving-frontend`
4. Click **"Import"**

### 9.3 Configure Project Settings

On the configuration page:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js (auto-detected) |
| Root Directory | `./` |
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm install` (default) |

### 9.4 Set Environment Variables

Before deploying, add environment variables:

1. Expand **"Environment Variables"** section
2. Add the following:

| Name | Value | Environment |
|------|-------|-------------|
| `BACKEND_API_URL` | `http://<ec2-public-ip>:8080` | Production, Preview, Development |

> **Important:** Use `BACKEND_API_URL` (server-only) for production. This keeps your EC2 IP completely hidden from the browser and allows changing it without redeploying.

3. Click **"Add"** for each variable

### 9.5 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (usually 1-2 minutes)
3. Once deployed, you'll get a URL like `https://medical-extraction.vercel.app` (custom project name change for cleaner address than the repo name: `slm-ft-serving-frontend`)

### 9.6 Verify Deployment

1. Visit the deployed URL
2. Test the extraction form
3. Check browser console for any errors

---

## Step 10: Post-Deployment Configuration

### 10.1 Update Backend CORS (Required)

After getting your Vercel domain, update the backend to restrict CORS:

In the **backend repository**, update `config/deployment.yml`:

```yaml
cors_origins:
  - "https://medical-extraction.vercel.app"
  - "https://*.vercel.app"  # For preview deployments
```

Redeploy the backend for CORS changes to take effect.

### 10.2 Custom Domain (Optional)

1. In Vercel dashboard, go to project **Settings** → **Domains**
2. Click **"Add"**
3. Enter your custom domain
4. Follow DNS configuration instructions

### 10.3 Update Backend IP Address (When EC2 IP Changes)

If your EC2 instance's public IP address changes (e.g., instance stopped/restarted, redeployment), update the environment variable on Vercel:

**Method 1: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Select your project **"medical-extraction"**
3. Navigate to **Settings** → **Environment Variables**
4. Find `BACKEND_API_URL`
5. Click the **three dots (⋯)** → **Edit**
6. Update the value to the new EC2 IP: `http://<new-ec2-ip>:8080`
7. Click **Save**

> **Important:** Because `BACKEND_API_URL` is a server-only variable (no `NEXT_PUBLIC_` prefix), changes take effect immediately without redeploying. The next API request will use the new IP.

**Method 2: Via Vercel CLI (Optional)**

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login
vercel login

# Update environment variable
vercel env rm BACKEND_API_URL production
vercel env add BACKEND_API_URL production
# When prompted, enter: http://<new-ec2-ip>:8080
```

**Verification:**

1. Visit `https://medical-extraction.vercel.app`
2. Test the extraction form with sample clinical text
3. Check that requests succeed (no connection errors)
4. Optionally, check `/api/health` endpoint responds correctly

**Alternative: Use Elastic IP (Backend Best Practice)**

To avoid manual updates, consider assigning an **Elastic IP** to your EC2 instance in the backend setup:
- Elastic IPs remain constant even when instance stops/restarts
- Set it once in Vercel, never update again
- Small additional AWS cost (~$0.005/hour when instance running)

---

## Development Commands Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server locally |
| `npm run lint` | Run ESLint |

---

## Troubleshooting

### CORS Errors
- Check browser console for CORS messages
- Verify backend CORS config includes Vercel domain
- Ensure EC2 security group allows port 8080

### Connection Timeout
- Verify EC2 instance is running
- Check `NEXT_PUBLIC_API_BASE_URL` is correct
- Test backend directly: `curl http://<ec2-ip>:8080/health`

### Build Failures on Vercel
- Check Vercel deployment logs
- Ensure all TypeScript types are correct
- Verify environment variables are set

### Empty Results
- Non-medical text returns null fields (expected behavior)
- Check `raw_output` field for model's actual response

---

## Next Steps After Setup

1. [ ] Add loading skeleton components
2. [ ] Add example clinical texts for demo
3. [ ] Implement extraction history (localStorage)
4. [ ] Add token usage display
5. [ ] Improve error messages with specific guidance
6. [ ] Add mobile-responsive improvements
