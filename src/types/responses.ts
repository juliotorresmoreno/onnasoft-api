export interface GeminiImageResponse {
  candidates: Candidate[];
  usageMetadata: UsageMetadata;
  modelVersion: string;
  responseId: string;
}

export interface Candidate {
  content: {
    parts: Part[];
    role: string;
  };
  finishReason: string;
  index: number;
}

export type Part = { text: string } | { inlineData: InlineData };

export interface InlineData {
  mimeType: string;
  data: string;
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  promptTokensDetails: TokenDetail[];
  candidatesTokensDetails: TokenDetail[];
}

export interface TokenDetail {
  modality: 'TEXT' | 'IMAGE';
  tokenCount: number;
}
