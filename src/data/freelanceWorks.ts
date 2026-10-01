import catalog from './freelanceWorks.json';

export type FreelanceCategory = 'Logo Designs' | 'Posters & Flyers';

export interface FreelanceWorkItem {
  id: string;
  title: string;
  category: FreelanceCategory;
  subgroup: string;
  image: string;
  width: number;
  height: number;
  sort_order: number;
}

const data = catalog as unknown as { total: number; works: FreelanceWorkItem[] };

export const freelanceWorks: FreelanceWorkItem[] = data.works;
export const freelanceCategories: FreelanceCategory[] = ['Logo Designs', 'Posters & Flyers'];
