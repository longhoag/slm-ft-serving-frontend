# Copilot Instructions for slm-ft-serving-frontend

## Repository Context
**This is the FRONTEND repository** (Stage 3) - a React/Next.js app for medical cancer information extraction. The backend (vLLM + FastAPI gateway) is in a separate repository.

## Architecture
```
User Browser → Next.js (Vercel) → FastAPI Gateway (EC2:8080) → vLLM (EC2:8000)
```

## Tech Stack Requirements
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **Components**: ShadcnUI preferred
- **Deployment**: Vercel (auto-deploys from main branch)

## Backend API Integration
The FastAPI gateway exposes:

```typescript
// POST /api/v1/extract
interface ExtractionRequest {
  text: string;              // Clinical text (required, non-empty)
  temperature?: number;      // 0.0-2.0, default 0.3
  max_tokens?: number;       // 1-8192, default 512
}

interface ExtractionResponse {
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

// GET /health → {"status":"healthy","vllm_available":true,"version":"0.1.0"}
```

## Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://<ec2-ip>:8080  # Backend gateway URL
```

## UI/UX Patterns
1. **Loading states**: API calls take 2-3 seconds - always show loading indicators
2. **Error handling**: Handle CORS errors, timeouts, and null responses gracefully
3. **Empty results**: Non-medical text returns all null fields - display appropriate message
4. **Example texts**: Provide sample clinical texts for demo purposes
5. **Responsive**: Support both mobile and desktop layouts

## Key Implementation Notes
- **No SSR for API calls**: Use client components for extraction calls to avoid exposing backend URL
- **Consider API route proxy**: Create `/api/extract` route to hide EC2 IP from client
- **Type safety**: Define TypeScript interfaces matching backend response schema exactly
- **CORS**: Backend currently allows `*`, will be restricted to Vercel domain post-deploy

## Cross-Repository Coordination
When making changes that affect the backend:
- API schema changes → Update backend gateway first
- CORS issues → Update `config/deployment.yml` in backend repo
- New endpoints → Coordinate with backend implementation

## Development Workflow
1. `npm run dev` for local development
2. Push to main → Vercel auto-deploys
3. Test against live EC2 backend (ensure instance is running)
4. Check Vercel logs for deployment issues

## File Structure Pattern (when initialized)
```
src/
  app/           # Next.js App Router pages
  components/    # React components
    ui/          # ShadcnUI components
  lib/           # Utilities, API client
  types/         # TypeScript interfaces
```
