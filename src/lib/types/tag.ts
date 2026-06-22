export interface Tag {
  id: string;
  tagName: string;
  tagCode: string;
  tagType: 1 | 2;
  parentId: number | string;
  level: number;
  aiSource: 0 | 1 | 2;
  aiRecognitionEnabled: 0 | 1 | boolean;
  isVisible: 0 | 1;
  status: 0 | 1;
  sortOrder: number;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
