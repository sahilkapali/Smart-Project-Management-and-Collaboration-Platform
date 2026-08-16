export type ItemType = 'folder' | 'code' | 'pdf' | 'svg' | 'docx' | 'xlsx';

export interface RepositoryItem {
  id: string;
  title: string;
  type: ItemType;
  size: string;
  fileCount?: string; 
  lastModified?: string; 
  contributors: string[]; 
  aiChipLabel?: string; 
  aiChipIcon?: React.ReactNode; 
}


export interface RepositoryResponse {
  success: boolean;
  message?: string;
  data: RepositoryItem[];
}