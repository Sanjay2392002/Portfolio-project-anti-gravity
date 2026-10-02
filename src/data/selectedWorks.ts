import catalog from '../../shared/selectedWorks.json';

export type SelectedWorkCategory = 'Logo Presentation' | 'Stories' | 'Posters & Ads' | 'Thumbnails' | 'Carousels' | 'Other';

export interface SelectedWorkItem {
  id: string;
  brand: string;
  title: string;
  image: string;
  thumbnail?: string;
  type: 'image' | 'pdf';
  width: number;
  height: number;
  category: SelectedWorkCategory;
  collection: string;
  sort_order?: number;
}

const workData = catalog as unknown as { brands: string[]; works: Array<Omit<SelectedWorkItem, 'id'> & { id: string | number }> };

export const selectedWorkBrands: string[] = workData.brands;
export const selectedWorks: SelectedWorkItem[] = workData.works.map((work) => ({
  ...work,
  id: String(work.id),
}));
