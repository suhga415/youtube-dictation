export type Caption = {
  // Index Signature
  [key: string]: string | number;
  
  text: string;
  translation: string;
  startTimeMs: number;
  endTimeMs: number;
};
