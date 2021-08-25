export type Caption = {
  // Index Signature
  [key: string]: string | number;
  
  text: string;
  startTimeMs: number;
  endTimeMs: number;
};
