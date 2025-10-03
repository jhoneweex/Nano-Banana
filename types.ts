
export type Language = 'en' | 'ar';

export type AspectRatio = '1:1' | '9:16' | '16:9';

export interface UploadedImage {
  id: string;
  name: string;
  base64: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  imageDataUrl: string;
  timestamp: number;
}

export type View = 'generator' | 'history';
