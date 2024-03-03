import { IComment } from "./Comment";
import { IInterest } from "./Interest";
import { IPost } from "./Post";
import { ITag } from "./Tag";
import { IUser } from "./User";

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
  data: IUser[] | IPost[] | ITag[] | IInterest[] | IComment[];
  category?: string;
  categoriesAvailable?: string;
  pagination: Pagination;
  links: Links;
}
