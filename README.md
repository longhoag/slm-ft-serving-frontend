# Medical Information Extraction Frontend

A Next.js web application for extracting structured cancer information from clinical text using AI-powered analysis.

**🌐 Live Demo:** [https://medical-extraction.vercel.app](https://medical-extraction.vercel.app)

![ Medical Information Extraction Site Preview](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-16.x-black)

---

## Overview

This is the **frontend interface** to serve a fine-tuned Llama 3.1 8B model for medical information extraction. Built with Next.js and deployed on Vercel, it provides a user-friendly web interface to extract structured cancer information from clinical text using AI-powered analysis.

### What It Extracts

Given clinical text, the model extracts 7 structured fields:

| Field | Description |
|-------|-------------|
| Cancer Type | e.g., melanoma, breast cancer, NSCLC |
| Stage | e.g., III, IV, metastatic |
| Gene Mutation | e.g., EGFR exon 19, KRAS G12D, BRCA1 |
| Biomarker | e.g., HER2+, PD-L1 5%, TMB-high |
| Treatment | e.g., nivolumab, chemotherapy, surgery |
| Response | e.g., complete response, stable disease |
| Metastasis Site | e.g., brain, liver, bone |

---

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   User Browser   │────▶│   Vercel Edge    │────▶│   EC2 Backend    │
│                  │     │   (Next.js)      │     │                  │
│  React Frontend  │◀────│   API Routes     │◀────│  FastAPI + vLLM  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                              /api/extract            :8080/api/v1/extract
```

**Data Flow:**
1. User enters clinical text in the web form
2. Frontend calls `/api/extract` (Next.js API route)
3. API route proxies request to EC2 FastAPI gateway
4. FastAPI forwards to vLLM for inference (~2-3 seconds)
5. Structured JSON response displayed in UI

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS v4 |
| UI Components | ShadcnUI (Radix primitives) |
| Deployment | Vercel (auto-deploy from main) |
| Backend | FastAPI + vLLM (separate repo) |

---

## Features

✨ **Real-time Extraction** - Extract medical entities in 2-3 seconds  
🔒 **Secure Architecture** - EC2 backend IP hidden via server-side proxy  
📱 **Responsive Design** - Works seamlessly on mobile and desktop  
🎯 **Type-safe** - Full TypeScript coverage with strict mode  
⚡ **Fast & Modern** - Built with Next.js 16 and TailwindCSS v4  
🔄 **Auto-deploy** - Push to main → live on Vercel instantly

---

## How It Works

1. **Enter Clinical Text** - Paste any cancer-related medical notes
2. **AI Processing** - Fine-tuned Llama 3.1 8B analyzes the text
3. **Structured Output** - Get 7 organized fields in seconds
4. **Review Results** - Cancer type, stage, mutations, treatments, and more

---

## Example Usage

**Input:**
```
Patient diagnosed with stage 3 breast cancer with HER2 positive marker. 
Underwent mastectomy followed by adjuvant chemotherapy with trastuzumab 
and pertuzumab. Post-treatment scans show complete response.
```

**Output:**
- **Cancer Type:** Breast cancer
- **Stage:** 3
- **Biomarker:** HER2 positive
- **Treatment:** Mastectomy; trastuzumab and pertuzumab
- **Response:** Complete response
- _(Other fields: null if not mentioned)_

Try it yourself: [https://medical-extraction.vercel.app](https://medical-extraction.vercel.app)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS v4 |
| UI Components | ShadcnUI (Radix primitives) |
| Deployment | Vercel (auto-deploy from main) |
| Backend | FastAPI + vLLM (separate repo) |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── extract/route.ts   # Proxy to backend /api/v1/extract
│   │   └── health/route.ts    # Proxy to backend /health
│   ├── layout.tsx             # Root layout with metadata
│   └── page.tsx               # Main extraction form page
├── components/
│   ├── ui/                    # ShadcnUI components
│   ├── extraction-form.tsx    # Clinical text input form
│   └── extraction-results.tsx # Results display grid
├── lib/
│   ├── api.ts                 # API client functions
│   └── utils.ts               # Utility functions
└── types/
    ├── api.ts                 # TypeScript interfaces
    └── index.ts               # Barrel exports

docs/
├── SETUP.md                   # Detailed setup guide
├── EXAMPLES.md                # Sample clinical texts for testing
└── BACKEND-REPO-INSTRUCTIONS.md  # Backend context
```

---

## For Developers

Want to run this locally or contribute? See [docs/SETUP.md](docs/SETUP.md) for:
- Local development setup
- Environment configuration
- Deployment instructions
- Troubleshooting guide

### Project Context

This is **Stage 3** of a 4-stage medical LLM serving project:

| Stage | Status | Description | Repository |
|-------|--------|-------------|------------|
| 1 | ✅ Complete | vLLM inference server on EC2 g6.2xlarge | Backend repo |
| 2 | ✅ Complete | FastAPI gateway (port 8080) | Backend repo |
| 3 | ✅ Complete | **Next.js frontend on Vercel** | **This repo** |
| 4 | 🔮 Future | CloudWatch monitoring & observability | TBD |

The system uses a fine-tuned Llama 3.1 8B model (qLoRA 4-bit quantization) for structured medical entity extraction from clinical text.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BACKEND_API_URL` | FastAPI gateway URL (server-only) | ✅ Yes |

> **Note:** `BACKEND_API_URL` is a server-only variable (no `NEXT_PUBLIC_` prefix), meaning it's never exposed to the browser and can be changed in Vercel without redeploying.

---

## Deployment

This project is deployed on Vercel with auto-deployment from the `main` branch.

**Deployed URL:** [https://medical-extraction.vercel.app](https://medical-extraction.vercel.app)

For deployment details, see [docs/SETUP.md](docs/SETUP.md).

---

## API Endpoints

### Frontend Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Main extraction form |
| `/api/extract` | POST | Proxy to backend extraction |
| `/api/health` | GET | Proxy to backend health check |

### Backend API (proxied)

```typescript
// POST /api/extract
{
  "text": "Clinical text here...",
  "temperature": 0.3,    // optional
  "max_tokens": 512      // optional
}

// Response
{
  "cancer_type": "melanoma",
  "stage": "IV",
  "gene_mutation": null,
  "biomarker": "PD-L1 5%",
  "treatment": "nivolumab",
  "response": "partial response",
  "metastasis_site": "brain",
  "raw_output": "...",
  "tokens_used": 116
}
```

---

## Documentation

- [Setup Guide](docs/SETUP.md) - Complete installation and deployment steps
- [Clinical Examples](docs/EXAMPLES.md) - Sample texts for testing
- [Backend Instructions](docs/BACKEND-REPO-INSTRUCTIONS.md) - Backend repo context

---

## Related Projects

- **Backend Repository** - [vLLM server + FastAPI gateway (Stage 1 & 2)](https://github.com/longhoag/slm-ft-serving) 
- **Fine-tuned Model** - [loghoag/llama-3.1-8b-medical-ie](https://huggingface.co/loghoag/llama-3.1-8b-medical-ie)
- **Base Model** - [meta-llama/Llama-3.1-8B](https://huggingface.co/meta-llama/Llama-3.1-8B)

---

## License

MIT License - see [LICENSE](LICENSE) file for details.
