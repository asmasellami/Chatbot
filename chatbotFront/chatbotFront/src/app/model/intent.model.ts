export interface Intent {
  id?: number;
  tag: string;
  fileId?: number;
  patterns: string[];
  responses: string[];
}
