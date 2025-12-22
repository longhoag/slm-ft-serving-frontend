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
