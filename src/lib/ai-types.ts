export interface AIProviderResponse {
    text: string;
    provider: string;
    model: string;
    error?: string;
}

export interface StreamingChunk {
    text: string;
    isDone: boolean;
}
