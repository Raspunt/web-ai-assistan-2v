export interface MissingModel {
  name: string;
  PercentageStatus: string;
  sizeModel: string;
}


export interface Message {
  typeMessage?: 'user' | 'bot';
  model: string;
  prompt: string;
  images?: string[];
}