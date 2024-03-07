import { Links, MultiResponse, Pagination } from "../../types/Response";

export const createPagination = (
  page: number,
  limit: number,
  totalPages: number,
  totalData: number
): Pagination => {
  return {
    currentPage: Number(page),
    dataPerPage: Number(limit),
    totalPages,
    totalData,
    hasNextPage: Number(page) < totalPages,
  };
};

export const createPageLinks = (
  endpoint: string,
  page: number,
  totalPages: number,
  limit: number,
  category?: string
): Links => {
  const optionalCategory = category ? `?category=${category}` : "";

  return {
    previous:
      Number(page) > 1
        ? `${endpoint}${optionalCategory}&page=${Number(page) - 1}&limit=${Number(limit)}`
        : null,
    next:
      Number(page) < totalPages
        ? `${endpoint}${optionalCategory}&page=${Number(page) + 1}&limit=${Number(limit)}`
        : null,
  };
};

export const multiResponse = <T>(
  data: T[],
  pagination: Pagination,
  links: Links,
  additonalParams?: { [key: string]: any }
): MultiResponse => {
  return {
    data,
    pagination,
    links,
    ...additonalParams,
  };
};
