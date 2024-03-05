export interface Pagination {
  currentPage: number;
  dataPerPage: number;
  totalData: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface Links {
  previous: string | null;
  next: string | null;
}

export interface MultiResponse {
  data: any[];
  category?: string;
  categoriesAvailable?: string;
  pagination: Pagination;
  links: Links;
  additonalParams?: { [key: string]: any };
}
