export interface CapstoneProject {
  id: string;
  title: string;
  authors: string[]; // 1-4 members
  panelMembers: string[];
  adviser: string;
  year: number;
  month: number;
  thesisCoordinator: string;
}

export type SortField = 'title' | 'author' | 'adviser' | 'date' | 'coordinator';
export type SortDirection = 'asc' | 'desc';
