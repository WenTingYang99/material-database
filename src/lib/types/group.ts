export interface MaterialGroup {
  id: string;
  name: string;
  count: number;
  depth: number;
  parentId?: string;
  system?: boolean;
  active?: boolean;
  status: "active" | "deleted";
}
