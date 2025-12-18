# Copilot Instructions for slm-ft-serving-frontend

## Project Context
This is **Stage 3** of a 4-stage medical LLM serving project. The fine-tuned Llama 3.1 8B model (qLoRA) extracts structured cancer information from clinical text.

| Stage | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | vLLM server on EC2 g6.2xlarge |
| 2 | ✅ Complete | FastAPI gateway (port 8080) |
| 3 | 🚧 This Repo | Next.js frontend on Vercel |
| 4 | Future | CloudWatch monitoring |

**Backend repo**: Contains vLLM + FastAPI, see [docs/BACKEND-REPO-INSTRUCTIONS.md](docs/BACKEND-REPO-INSTRUCTIONS.md) for full context.

## Architecture
```
User Browser → Next.js (Vercel) → FastAPI Gateway (EC2:8080) → vLLM (EC2:8000)
```

## Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + ShadcnUI components
- **Package Manager**: npm (not Poetry—this is TypeScript, not Python)
- **Deployment**: Vercel (auto-deploys from main branch)

> **Note**: The backend repo uses Poetry/loguru (Python). This frontend uses npm and standard JS logging patterns.

> **Why ShadcnUI?** Copy-paste components built on Radix UI primitives + TailwindCSS. Not a dependency—components live in your codebase (`components/ui/`). Provides accessible, customizable form inputs, buttons, cards ideal for this extraction UI.

## Backend API Contract

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

## Environment Variables & Secrets

| Variable | Purpose | Exposure |
|----------|---------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend gateway URL | Public (client-side) |

**Local Development**: Use `.env.local` (git-ignored)
```env
NEXT_PUBLIC_API_BASE_URL=http://<ec2-ip>:8080
```

**Production**: Set in Vercel dashboard → Project Settings → Environment Variables

> **Why not AWS Secrets Manager?** This frontend runs on Vercel (not AWS). No direct AWS SDK calls—all AWS resources accessed via the FastAPI gateway. Standard `.env.local` + Vercel env vars is the idiomatic pattern.

## Implementation Patterns

### API Integration
- Use **Next.js API routes** (`app/api/extract/route.ts`) as proxy to hide EC2 IP from client
- Client components call `/api/extract`, server route forwards to EC2
- Define TypeScript interfaces in `types/` matching backend schema exactly

### UI/UX Requirements
- **Loading states**: LLM inference takes 2-3 seconds—always show spinners
- **All-null handling**: Non-medical text returns null fields; display "No medical entities found"
- **Error handling**: CORS errors, timeouts, network failures with user-friendly messages
- **Responsive**: Mobile-first, works on desktop

### Known Backend Behaviors
- Non-medical input may produce hallucinated `raw_output` but structured fields return null correctly
- CORS currently `*`, will be restricted to Vercel domain post-deploy
- Backend may be stopped (cost savings)—handle connection failures gracefully

## Cross-Repository Coordination
- API schema changes → Update backend first, then frontend types
- CORS issues → Update `config/deployment.yml` in backend repo
- Backend reference: [docs/BACKEND-REPO-INSTRUCTIONS.md](docs/BACKEND-REPO-INSTRUCTIONS.md)

## Development Workflow
1. `npm run dev` for local development
2. Push to `main` → Vercel auto-deploys
3. Ensure EC2 backend is running before testing extraction
4. Check Vercel deployment logs for build errors

## Project Structure
```
src/
  app/              # Next.js App Router
    api/extract/    # API route proxy
  components/       # React components
    ui/             # ShadcnUI components
  lib/              # Utilities, API client
  types/            # TypeScript interfaces
docs/
  BACKEND-REPO-INSTRUCTIONS.md  # Backend context
  SETUP.md                      # Project setup guide (TBD)
```
