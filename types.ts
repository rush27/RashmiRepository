
export type Language = 'English' | 'Hinglish' | 'Hindi';
export type Tone = 'Professional' | 'Friendly' | 'Local';

export interface BrandContext {
  businessName: string;
  category: string;
  city: string;
  language: Language;
  tone: Tone;
  businessDescription?: string;
  apiKey?: string;
  firebaseConfigJSON?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'post' | 'offer' | 'reply' | 'broadcast' | 'prompt';
  content: string;
  meta?: any;
}

export interface ImagePrompt {
  platform: string;
  image_type: string;
  subject: string;
  setting: string;
  style: string;
  text_on_image: string;
  aspect_ratio: string;
}

export interface MonthlyPlanItem {
  date: string;
  type: string;
  topic: string;
}
