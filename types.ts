export interface ImageAsset {
  id: string;
  data: string; // Base64 full string (data:image/...)
  mimeType: string;
}

export enum AppState {
  UPLOAD = 'UPLOAD',
  EDITING = 'EDITING',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface ProcessingStatus {
  isProcessing: boolean;
  message?: string;
}

export interface PresetPrompt {
  label: string;
  prompt: string;
  icon: string;
}