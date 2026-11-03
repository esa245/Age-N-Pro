export interface Member {
  id: string;
  name: string;
  relation: string;
  dob: string; // YYYY-MM-DD
  dod?: string; // YYYY-MM-DD (Date of death if deceased)
  photo?: string;
  notes?: string;
}

export type Language = 'bn' | 'en';
